# app/agents/publisher.py
import logging
from datetime import datetime
from typing import Dict, Optional

from app.config import get_settings
from app.integrations.openai_client import OpenAIClient
from app.models.article import Article

logger = logging.getLogger(__name__)


class PublisherAgent:
    """Agent responsible for SEO optimization and final publication."""
    
    def __init__(self):
        self.settings = get_settings()
        self.openai = OpenAIClient()
    
    async def publish(self, article: Article) -> Article:
        """Finalize and optimize article for publication.
        
        Steps:
        1. SEO optimization
        2. Format for publication
        3. Add metadata
        
        Args:
            article: Article to publish
            
        Returns:
            Published/optimized Article
        """
        logger.info(f"Publishing article: {article.headline}")
        
        # Step 1: SEO optimization
        logger.info("Optimizing for SEO...")
        seo_data = await self.openai.optimize_seo(
            headline=article.headline,
            body=article.body,
            keywords=article.keywords,
        )
        
        article.meta_title = seo_data.get("meta_title", article.headline)
        article.meta_description = seo_data.get(
            "meta_description", 
            article.summary or article.body[:160]
        )
        
        # Add SEO keywords
        additional_keywords = seo_data.get("additional_keywords", [])
        article.keywords = list(set(article.keywords + additional_keywords))
        
        # Step 2: Format body
        logger.info("Formatting article body...")
        article.body = self._format_body(article.body)
        
        # Step 3: Set publication metadata
        article.published_at = datetime.utcnow()
        
        logger.info(f"Article published: {article.id}")
        return article
    
    async def optimize_headline(self, headline: str, keywords: list) -> str:
        """Optimize a headline for engagement and SEO.
        
        Args:
            headline: Original headline
            keywords: Target keywords
            
        Returns:
            Optimized headline
        """
        prompt = f"""Optimize this headline for engagement and SEO:

Original: {headline}
Keywords: {', '.join(keywords)}

Requirements:
- 50-60 characters ideal
- Include primary keyword if possible
- Compelling and click-worthy
- Accurate to content
- AP Style compliant

Return only the optimized headline."""

        try:
            result = await self.openai.client.chat.completions.create(
                model=self.openai.model,
                messages=[
                    {"role": "system", "content": "You are a headline optimization expert. Create compelling, SEO-friendly headlines."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100,
                temperature=0.5,
            )
            
            optimized = result.choices[0].message.content.strip()
            # Remove quotes if present
            optimized = optimized.strip('"\'')
            return optimized if optimized else headline
            
        except Exception as e:
            logger.error(f"Error optimizing headline: {e}")
            return headline
    
    def _format_body(self, body: str) -> str:
        """Format article body for publication.
        
        Args:
            body: Raw article body
            
        Returns:
            Formatted body
        """
        # Clean up whitespace
        lines = body.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                cleaned_lines.append(line)
        
        # Join paragraphs with proper spacing
        formatted = '\n\n'.join(cleaned_lines)
        
        # Remove excessive newlines
        while '\n\n\n' in formatted:
            formatted = formatted.replace('\n\n\n', '\n\n')
        
        return formatted.strip()
    
    def generate_slug(self, headline: str) -> str:
        """Generate URL slug from headline.
        
        Args:
            headline: Article headline
            
        Returns:
            URL-friendly slug
        """
        import re
        
        # Convert to lowercase
        slug = headline.lower()
        
        # Remove special characters
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        # Replace spaces with hyphens
        slug = re.sub(r'\s+', '-', slug)
        
        # Remove multiple hyphens
        slug = re.sub(r'-+', '-', slug)
        
        # Limit length
        slug = slug[:60].strip('-')
        
        return slug
    
    def create_social_preview(
        self,
        article: Article,
        platform: str = "twitter",
    ) -> Dict[str, str]:
        """Create social media preview for article.
        
        Args:
            article: Article to create preview for
            platform: Target platform (twitter, facebook, linkedin)
            
        Returns:
            Dict with title, description, and suggested hashtags
        """
        # Platform-specific limits
        limits = {
            "twitter": {"title": 70, "description": 200},
            "facebook": {"title": 80, "description": 300},
            "linkedin": {"title": 100, "description": 250},
        }
        
        limit = limits.get(platform, limits["twitter"])
        
        title = article.meta_title or article.headline
        if len(title) > limit["title"]:
            title = title[:limit["title"]-3] + "..."
        
        description = article.meta_description or article.summary or article.body[:150]
        if len(description) > limit["description"]:
            description = description[:limit["description"]-3] + "..."
        
        # Generate hashtags
        hashtags = [f"#{kw.replace(' ', '')}" for kw in article.keywords[:3]]
        
        return {
            "title": title,
            "description": description,
            "hashtags": " ".join(hashtags),
            "full_text": f"{title}\n\n{description}\n\n{' '.join(hashtags)}",
        }
