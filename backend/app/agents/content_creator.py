# app/agents/content_creator.py
import logging
from typing import Dict, List, Optional

from app.config import get_settings
from app.integrations.openai_client import OpenAIClient
from app.integrations.virlo_client import VirloClient
from app.integrations.unsplash import get_unsplash_client
from app.models.article import Article, NewsTopic, Source

logger = logging.getLogger(__name__)


class ContentCreatorAgent:
    """Agent responsible for researching and writing articles."""
    
    def __init__(self):
        self.settings = get_settings()
        self.openai = OpenAIClient()
        self.virlo = VirloClient()
        self.unsplash = get_unsplash_client()
        self.max_retries = self.settings.max_retries
    
    async def create(
        self,
        topic: NewsTopic,
        target_length: int = 400,
    ) -> Article:
        """Create a complete article from a news topic.
        
        Pipeline:
        1. Research the topic
        2. Write initial draft
        3. Fact-check claims
        4. Edit for AP style
        
        Args:
            topic: NewsTopic to base article on
            target_length: Target word count
            
        Returns:
            Completed Article
        """
        logger.info(f"Creating article for topic: {topic.title}")
        
        # Step 1: Research
        logger.info("Step 1: Researching topic...")
        research = await self.openai.research_topic(
            topic=topic.title,
            sources=topic.sources
        )
        
        # Step 2: Write initial draft
        logger.info("Step 2: Writing initial draft...")
        draft = await self.openai.write_article(
            topic=topic.title,
            research=research,
            target_length=target_length,
        )
        
        # Step 3: Fact-check
        logger.info("Step 3: Fact-checking...")
        fact_check_result = await self.openai.fact_check(
            article_text=draft.get("body", ""),
            sources=topic.sources
        )
        
        # Step 4: Edit for AP style
        logger.info("Step 4: Editing for AP style...")
        final_article = await self._edit_for_ap_style(
            draft=draft,
            fact_check=fact_check_result,
        )
        
        # Step 5: Virlo headline optimization
        original_headline = final_article.get("headline", topic.title)
        virlo_optimized_headline = original_headline
        virlo_score = None
        virlo_hashtags = []
        
        if self.settings.virlo_enabled:
            logger.info("Step 5: Optimizing headline with Virlo...")
            try:
                virlo_result = await self.virlo.optimize_headline(
                    headline=original_headline,
                    topic=topic.title
                )
                
                # Use the first optimized headline if available
                optimized_variants = virlo_result.get("optimized_headlines", [])
                if optimized_variants:
                    virlo_optimized_headline = optimized_variants[0].get("headline", original_headline)
                    logger.info(f"Virlo optimized headline: {virlo_optimized_headline}")
                
                virlo_score = virlo_result.get("viral_score", 50)
                virlo_hashtags = virlo_result.get("suggested_hashtags", [])
                
                logger.info(f"Virlo viral score: {virlo_score}/100")
            except Exception as e:
                logger.warning(f"Virlo optimization failed, using original headline: {e}")
                virlo_optimized_headline = original_headline
        
        # Step 6: Fetch image for article
        logger.info("Step 6: Fetching article image...")
        image_url = getattr(topic, 'image_url', None)
        
        # If no image from topic source, fetch from Unsplash
        if not image_url:
            # Determine category from keywords or default to Technology
            category = "Technology"  # Default
            keywords_lower = [k.lower() for k in topic.keywords]
            
            # Simple keyword matching for category
            category_keywords = {
                "Technology": ["ai", "tech", "software", "computer", "digital", "robot"],
                "Business": ["business", "finance", "market", "economy", "startup", "company"],
                "Science": ["science", "research", "space", "physics", "biology"],
                "Health": ["health", "medical", "medicine", "doctor", "hospital"],
                "Environment": ["climate", "environment", "green", "energy", "solar", "renewable"],
                "Education": ["education", "school", "university", "student", "learning"],
                "Sports": ["sports", "game", "team", "player", "championship"],
                "Politics": ["politics", "government", "election", "vote", "policy"],
                "Entertainment": ["movie", "music", "film", "entertainment", "celebrity"],
                "World": ["world", "international", "global", "country", "nation"],
            }
            
            for cat, words in category_keywords.items():
                if any(word in keywords_lower for word in words):
                    category = cat
                    break
            
            image_url = self.unsplash.get_image_for_category(
                category=category,
                keywords=topic.keywords
            )
            logger.info(f"Fetched image for category '{category}': {image_url}")
        
        # Create Article model with Virlo optimization data and image
        article = Article(
            headline=virlo_optimized_headline,
            body=final_article.get("body", ""),
            summary=final_article.get("summary", ""),
            sources=topic.sources,
            keywords=topic.keywords + virlo_hashtags[:3],  # Add Virlo hashtags to keywords
            topic_id=topic.id,
            image_url=image_url,
            virlo_optimized=self.settings.virlo_enabled,
            virlo_score=virlo_score,
            virlo_original_headline=original_headline if virlo_optimized_headline != original_headline else None,
            virlo_suggested_hashtags=virlo_hashtags[:5],
        )
        
        logger.info(f"Article created: {article.headline}")
        return article
    
    async def create_from_topic_string(
        self,
        topic: str,
        sources: Optional[List[Source]] = None,
        target_length: int = 400,
    ) -> Article:
        """Create an article from a topic string.
        
        Args:
            topic: Topic string
            sources: Optional list of sources
            target_length: Target word count
            
        Returns:
            Completed Article
        """
        news_topic = NewsTopic(
            title=topic,
            description=topic,
            sources=sources or [],
        )
        return await self.create(news_topic, target_length)
    
    async def _edit_for_ap_style(
        self,
        draft: Dict,
        fact_check: Dict,
    ) -> Dict:
        """Edit article for AP style compliance.
        
        Args:
            draft: Initial draft dict with headline, body, summary
            fact_check: Fact check results
            
        Returns:
            Edited article dict
        """
        corrections = fact_check.get("suggested_corrections", [])
        
        # Use the openai client's edit_for_ap_style method
        return await self.openai.edit_for_ap_style(draft, corrections)
    
    async def summarize(self, text: str, max_sentences: int = 3) -> str:
        """Create a summary of given text.
        
        Args:
            text: Text to summarize
            max_sentences: Maximum sentences in summary
            
        Returns:
            Summary string
        """
        return await self.openai.summarize(text, max_sentences)
