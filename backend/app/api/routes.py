# app/api/routes.py
import logging
import time
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.config import get_settings
from app.integrations.supabase_client import get_supabase_client
from app.integrations.virlo_client import VirloClient
from app.models.article import (
    Article,
    ArticleRequest,
    ArticleResponse,
    ArticleStatus,
    GenerationStatus,
    NewsTopic,
)
from app.pipeline.runner import VeritasPipeline

logger = logging.getLogger(__name__)

router = APIRouter()
pipeline = VeritasPipeline()


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: float


class GenerateRequest(BaseModel):
    topic: str
    keywords: list = []
    target_length: int = 400


class BreakingNewsResponse(BaseModel):
    success: bool
    job_id: str
    message: str


class StatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    message: Optional[str]
    article_id: Optional[str]
    error: Optional[str]


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=time.time(),
    )


@router.post("/api/news/generate")
async def generate_article(request: ArticleRequest):
    """Generate an article from a specific topic.
    
    Args:
        request: Article generation request
        
    Returns:
        Generated article in frontend format
    """
    start_time = time.time()
    supabase = get_supabase_client()
    
    try:
        # Run pipeline with provided topic
        article = await pipeline.run_breaking_news(topic=request.topic)
        
        # Store article in Supabase
        await supabase.store_article(article)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return {
            "success": True,
            "article": _article_to_frontend(article),
            "processing_time_ms": processing_time,
        }
        
    except Exception as e:
        logger.error(f"Error generating article: {e}")
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/api/news/breaking", response_model=BreakingNewsResponse)
async def generate_breaking_news(
    background_tasks: BackgroundTasks,
    category: Optional[str] = None,
):
    """Find and generate breaking news article asynchronously.
    
    Args:
        category: Optional news category filter
        
    Returns:
        Job ID for tracking progress
    """
    try:
        # Create job
        job_id = pipeline.create_job()
        
        # Run pipeline in background
        background_tasks.add_task(
            pipeline.run_async,
            job_id=job_id,
            category=category,
        )
        
        return BreakingNewsResponse(
            success=True,
            job_id=job_id,
            message="Breaking news generation started",
        )
        
    except Exception as e:
        logger.error(f"Error starting breaking news job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/news/status/{job_id}", response_model=StatusResponse)
async def get_generation_status(job_id: str):
    """Check status of an article generation job.
    
    Args:
        job_id: Job ID to check
        
    Returns:
        Current job status
    """
    status = pipeline.get_job_status(job_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return StatusResponse(
        job_id=status.id,
        status=status.status.value,
        progress=status.progress,
        message=status.message,
        article_id=status.article_id,
        error=status.error,
    )


def _article_to_frontend(article: Article) -> dict:
    """Convert backend Article model to frontend format.
    
    Args:
        article: Backend Article model
        
    Returns:
        Dict with frontend-expected field names
    """
    # Get first source for source/source_url fields
    first_source = article.sources[0] if article.sources else None
    
    return {
        "id": article.id,
        "title": article.headline,
        "content": article.body,
        "summary": article.summary or "",
        "source": first_source.name if first_source else "Veritas AI",
        "source_url": first_source.url if first_source else None,
        "published_at": article.published_at.isoformat() if article.published_at else article.created_at.isoformat(),
        "category": article.keywords[0] if article.keywords else "News",
        "credibility_score": article.credibility_score,
        "is_breaking": False,  # Default value
        "image_url": None,  # Default value
        "author": None,  # Default value
        "created_at": article.created_at.isoformat(),
        "updated_at": article.created_at.isoformat(),
    }


@router.get("/api/news/article/{article_id}")
async def get_article(article_id: str):
    """Get a published article.
    
    Args:
        article_id: Article ID
        
    Returns:
        Article content in frontend format
    """
    # Try Supabase first
    supabase = get_supabase_client()
    article = await supabase.get_article(article_id)
    
    # Fallback to in-memory storage
    if not article:
        article = pipeline.get_article(article_id)
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return {"article": _article_to_frontend(article)}


@router.get("/api/news/articles")
async def list_articles(limit: int = 10, offset: int = 0):
    """List recent articles from Supabase.
    
    Args:
        limit: Maximum number of articles to return
        offset: Number of articles to skip
        
    Returns:
        List of articles in frontend format
    """
    supabase = get_supabase_client()
    articles = await supabase.list_recent_articles(limit=limit, offset=offset)
    
    return {
        "articles": [_article_to_frontend(a) for a in articles],
        "total": len(articles),
    }


@router.post("/api/news/optimize")
async def optimize_with_virlo(request: GenerateRequest):
    """Optimize article content using Virlo viral insights.
    
    Args:
        request: Generate request with topic
        
    Returns:
        Virlo optimization results
    """
    try:
        virlo = VirloClient()
        
        # Optimize the headline
        headline_result = await virlo.optimize_headline(
            headline=request.topic,
            topic=request.topic
        )
        
        # Get trending data
        trending_topics = await virlo.get_trending_topics(limit=5)
        trending_hashtags = await virlo.get_trending_hashtags(limit=10)
        
        return {
            "success": True,
            "headline_optimization": headline_result,
            "trending_topics": trending_topics,
            "trending_hashtags": trending_hashtags,
            "optimized_with": "Virlo AI"
        }
        
    except Exception as e:
        logger.error(f"Error optimizing with Virlo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/news/virlo/status")
async def get_virlo_status():
    """Get Virlo API status and trending data.
    
    Returns:
        Virlo API status and sample trending data
    """
    try:
        virlo = VirloClient()
        
        # Fetch trending data
        trending_topics = await virlo.get_trending_topics(limit=5)
        trending_hashtags = await virlo.get_trending_hashtags(limit=10)
        
        return {
            "status": "active",
            "enabled": True,
            "trending_topics_count": len(trending_topics),
            "trending_hashtags_count": len(trending_hashtags),
            "trending_topics": trending_topics,
            "trending_hashtags": trending_hashtags[:5],
            "message": "Virlo viral content optimization is active"
        }
        
    except Exception as e:
        logger.error(f"Error fetching Virlo status: {e}")
        return {
            "status": "error",
            "enabled": False,
            "message": str(e)
        }


@router.get("/api/news/topics")
async def get_topics(query: Optional[str] = None):
    """Search for news topics.
    
    Args:
        query: Search query
        
    Returns:
        List of news topics
    """
    from app.agents.scout import ScoutAgent
    
    scout = ScoutAgent()
    
    if query:
        topics = await scout.search_topics(query=query)
    else:
        # Return breaking news topics
        topic = await scout.find_breaking_news()
        topics = [topic] if topic else []
    
    return {
        "topics": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "sources": [{"name": s.name, "url": s.url} for s in t.sources],
                "relevance_score": t.relevance_score,
            }
            for t in topics
        ]
    }
