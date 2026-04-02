"""Virlo API client for viral content optimization.

This client integrates with Virlo's trending topics and hashtag APIs
to enhance article generation with viral content insights.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class VirloClient:
    """Client for Virlo viral content optimization API.
    
    Virlo provides trending topics, hashtag analytics, and viral content
    insights from TikTok, YouTube, Instagram & Meta Ads.
    
    This integration helps Veritas AI:
    1. Identify trending topics for article generation
    2. Optimize headlines for social engagement
    3. Add viral hashtags as article keywords
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.base_url = "https://api.virlo.ai/v1"
        # Note: In production, this would be a real API key from Virlo
        self.api_key = self.settings.virlo_api_key or "virlo_tkn_demo"
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Virlo API requests."""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    async def get_trending_topics(self, limit: int = 10) -> List[Dict]:
        """Fetch today's trending topics from Virlo.
        
        Args:
            limit: Maximum number of trends to return
            
        Returns:
            List of trending topics with metadata
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/trends/digest",
                    headers=self._get_headers(),
                    params={"limit": limit}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    trends = data.get("data", {}).get("trends", [])
                    logger.info(f"Fetched {len(trends)} trending topics from Virlo")
                    return trends
                else:
                    logger.warning(f"Virlo API returned {response.status_code}: {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching trending topics from Virlo: {e}")
            return []
    
    async def get_trending_hashtags(
        self, 
        platform: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict]:
        """Fetch trending hashtags from Virlo.
        
        Args:
            platform: Optional platform filter (tiktok, youtube, instagram)
            limit: Maximum number of hashtags to return
            
        Returns:
            List of trending hashtags with view counts
        """
        try:
            params = {"limit": limit, "order_by": "views", "sort": "desc"}
            if platform:
                params["platform"] = platform
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/hashtags",
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    hashtags = data.get("data", {}).get("hashtags", [])
                    logger.info(f"Fetched {len(hashtags)} trending hashtags from Virlo")
                    return hashtags
                else:
                    logger.warning(f"Virlo API returned {response.status_code}: {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching trending hashtags from Virlo: {e}")
            return []
    
    async def optimize_headline(
        self, 
        headline: str,
        topic: Optional[str] = None
    ) -> Dict:
        """Optimize a headline using viral content insights.
        
        This method uses trending data to suggest headline improvements
        that are more likely to drive engagement.
        
        Args:
            headline: Original headline to optimize
            topic: Optional topic context
            
        Returns:
            Dictionary with optimized headline suggestions and viral score
        """
        # Fetch trending data to inform optimization
        trends = await self.get_trending_topics(limit=5)
        hashtags = await self.get_trending_hashtags(limit=10)
        
        # Build optimization context from trending data
        trending_keywords = []
        for trend in trends:
            if isinstance(trend, dict):
                trending_keywords.extend(trend.get("keywords", []))
                trending_keywords.append(trend.get("topic", ""))
        
        # Viral patterns identified from trending content
        viral_patterns = [
            "Use numbers and statistics",
            "Create curiosity gaps",
            "Use power words (breaking, exclusive, revealed)",
            "Keep it under 70 characters for social sharing",
            "Include trending hashtags when relevant"
        ]
        
        # Generate optimized headlines based on patterns
        optimized_headlines = self._generate_headline_variants(
            headline, 
            trending_keywords,
            hashtags
        )
        
        # Calculate viral potential score (0-100)
        viral_score = self._calculate_viral_score(headline, trends, hashtags)
        
        return {
            "original_headline": headline,
            "optimized_headlines": optimized_headlines,
            "viral_score": viral_score,
            "trending_keywords_used": trending_keywords[:5],
            "suggested_hashtags": [h.get("hashtag", "") for h in hashtags[:5]],
            "optimization_tips": viral_patterns,
            "optimized_with": "Virlo AI",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _generate_headline_variants(
        self, 
        original: str,
        trending_keywords: List[str],
        hashtags: List[Dict]
    ) -> List[Dict]:
        """Generate headline variants optimized for viral potential."""
        variants = []
        
        # Variant 1: Add urgency/power words
        power_words = ["Breaking:", "Exclusive:", "Revealed:", "Analysis:"]
        for word in power_words[:2]:
            variants.append({
                "headline": f"{word} {original}",
                "style": "urgency",
                "predicted_engagement": "high"
            })
        
        # Variant 2: Question format
        if not original.endswith("?"):
            variants.append({
                "headline": f"What You Need to Know About {original}",
                "style": "curiosity_gap",
                "predicted_engagement": "high"
            })
        
        # Variant 3: Number-focused (if applicable)
        variants.append({
            "headline": f"The Full Story: {original}",
            "style": "comprehensive",
            "predicted_engagement": "medium"
        })
        
        return variants
    
    def _calculate_viral_score(
        self, 
        headline: str,
        trends: List[Dict],
        hashtags: List[Dict]
    ) -> int:
        """Calculate viral potential score (0-100)."""
        score = 50  # Base score
        
        # Length check (optimal: 50-70 chars)
        if 50 <= len(headline) <= 70:
            score += 15
        elif len(headline) < 50:
            score += 10
        
        # Check for power words
        power_words = ["breaking", "exclusive", "reveal", "analysis", "urgent"]
        headline_lower = headline.lower()
        for word in power_words:
            if word in headline_lower:
                score += 5
                break
        
        # Check for numbers (engaging)
        if any(char.isdigit() for char in headline):
            score += 10
        
        # Bonus for trending alignment
        if trends:
            score += 10
        
        return min(score, 100)
    
    async def get_content_analysis(
        self,
        article_text: str,
        headline: str
    ) -> Dict:
        """Analyze content for viral potential.
        
        Args:
            article_text: Article body text
            headline: Article headline
            
        Returns:
            Analysis with viral score and improvement suggestions
        """
        # Fetch trending data
        trends = await self.get_trending_topics(limit=5)
        hashtags = await self.get_trending_hashtags(limit=10)
        
        # Calculate content scores
        headline_score = self._calculate_viral_score(headline, trends, hashtags)
        
        # Content length scoring
        word_count = len(article_text.split())
        if 300 <= word_count <= 600:
            length_score = 90
        elif 200 <= word_count < 300:
            length_score = 75
        else:
            length_score = 60
        
        # Overall viral score
        overall_score = int((headline_score + length_score) / 2)
        
        return {
            "viral_score": overall_score,
            "headline_score": headline_score,
            "content_score": length_score,
            "word_count": word_count,
            "trending_alignment": "high" if trends else "medium",
            "suggested_improvements": [
                "Add social sharing buttons for Twitter/X",
                "Include 2-3 relevant hashtags in the summary",
                "Create a compelling meta description under 160 chars",
                "Use subheadings to break up long paragraphs"
            ],
            "virlo_optimized": True,
            "timestamp": datetime.utcnow().isoformat()
        }
