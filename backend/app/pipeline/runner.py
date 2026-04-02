# app/pipeline/runner.py
import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, Optional
from uuid import uuid4

from app.agents.scout import ScoutAgent
from app.agents.content_creator import ContentCreatorAgent
from app.agents.publisher import PublisherAgent
from app.models.article import (
    Article,
    ArticleStatus,
    GenerationStatus,
    NewsTopic,
)

logger = logging.getLogger(__name__)


class VeritasPipeline:
    """Orchestrates the article generation pipeline."""
    
    def __init__(self):
        self.scout = ScoutAgent()
        self.creator = ContentCreatorAgent()
        self.publisher = PublisherAgent()
        
        # In-memory job storage (replace with Redis/DB in production)
        self._jobs: Dict[str, GenerationStatus] = {}
        self._articles: Dict[str, Article] = {}
    
    async def run_breaking_news(
        self,
        topic: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Article:
        """Run the full pipeline for breaking news.
        
        Linear pipeline:
        1. Scout finds breaking news (or uses provided topic)
        2. Content Creator researches and writes
        3. Publisher optimizes and publishes
        
        Args:
            topic: Optional specific topic to use (skip scouting)
            category: News category filter for scouting
            
        Returns:
            Completed Article
        """
        start_time = time.time()
        
        # Step 1: Scout
        if topic:
            logger.info(f"Using provided topic: {topic}")
            news_topic = NewsTopic(
                title=topic,
                description=topic,
            )
        else:
            logger.info("Scouting for breaking news...")
            news_topic = await self.scout.find_breaking_news(category=category)
            
        if not news_topic:
            raise ValueError("No breaking news found")
        
        logger.info(f"Found topic: {news_topic.title}")
        
        # Step 2: Create content
        logger.info("Creating article content...")
        article = await self.creator.create(news_topic)
        
        # Step 3: Publish
        logger.info("Publishing article...")
        article = await self.publisher.publish(article)
        
        elapsed = time.time() - start_time
        logger.info(f"Pipeline completed in {elapsed:.2f}s: {article.headline}")
        
        return article
    
    async def run_async(
        self,
        job_id: str,
        topic: Optional[str] = None,
        category: Optional[str] = None,
    ) -> None:
        """Run pipeline asynchronously and track status.
        
        Args:
            job_id: Job ID to track
            topic: Optional topic string
            category: Optional category filter
        """
        try:
            # Update status to scouting
            self._update_job(job_id, ArticleStatus.SCOUTING, 0.1, "Finding news...")
            
            # Scout
            if topic:
                news_topic = NewsTopic(title=topic, description=topic)
            else:
                news_topic = await self.scout.find_breaking_news(category=category)
                
            if not news_topic:
                self._update_job(
                    job_id,
                    ArticleStatus.FAILED,
                    0.0,
                    error="No news found"
                )
                return
            
            # Research
            self._update_job(job_id, ArticleStatus.RESEARCHING, 0.3, "Researching topic...")
            await asyncio.sleep(0.1)  # Allow status update to propagate
            
            # Write
            self._update_job(job_id, ArticleStatus.WRITING, 0.5, "Writing article...")
            article = await self.creator.create(news_topic)
            
            # Edit
            self._update_job(job_id, ArticleStatus.EDITING, 0.7, "Editing content...")
            
            # Publish
            self._update_job(job_id, ArticleStatus.PUBLISHING, 0.9, "Finalizing...")
            article = await self.publisher.publish(article)
            
            # Store article in memory and Supabase
            self._articles[article.id] = article
            
            # Store in Supabase if available
            try:
                from app.integrations.supabase_client import get_supabase_client
                supabase = get_supabase_client()
                await supabase.store_article(article)
            except Exception as e:
                logger.warning(f"Could not store article in Supabase: {e}")
            
            # Complete
            self._update_job(
                job_id,
                ArticleStatus.COMPLETED,
                1.0,
                "Article ready",
                article_id=article.id
            )
            
        except Exception as e:
            logger.error(f"Pipeline error for job {job_id}: {e}")
            self._update_job(
                job_id,
                ArticleStatus.FAILED,
                0.0,
                error=str(e)
            )
    
    def create_job(self, topic: Optional[str] = None) -> str:
        """Create a new pipeline job.
        
        Args:
            topic: Optional topic for the job
            
        Returns:
            Job ID
        """
        job_id = str(uuid4())
        now = datetime.utcnow()
        
        self._jobs[job_id] = GenerationStatus(
            id=job_id,
            status=ArticleStatus.PENDING,
            progress=0.0,
            message="Job created" if not topic else f"Topic: {topic}",
            created_at=now,
            updated_at=now,
        )
        
        return job_id
    
    def get_job_status(self, job_id: str) -> Optional[GenerationStatus]:
        """Get status of a pipeline job.
        
        Args:
            job_id: Job ID to check
            
        Returns:
            GenerationStatus or None if not found
        """
        return self._jobs.get(job_id)
    
    def get_article(self, article_id: str) -> Optional[Article]:
        """Get a published article.
        
        Args:
            article_id: Article ID
            
        Returns:
            Article or None if not found
        """
        return self._articles.get(article_id)
    
    def _update_job(
        self,
        job_id: str,
        status: ArticleStatus,
        progress: float,
        message: Optional[str] = None,
        article_id: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        """Update job status."""
        if job_id not in self._jobs:
            return
            
        job = self._jobs[job_id]
        job.status = status
        job.progress = progress
        if message:
            job.message = message
        if article_id:
            job.article_id = article_id
        if error:
            job.error = error
        job.updated_at = datetime.utcnow()
        
        logger.info(f"Job {job_id}: {status.value} ({progress*100:.0f}%)")
