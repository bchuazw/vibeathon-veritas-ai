# app/agents/scout.py
import logging
from typing import List, Optional

from app.config import get_settings
from app.integrations.newsapi import NewsAPIClient
from app.models.article import NewsTopic

logger = logging.getLogger(__name__)


class ScoutAgent:
    """Agent responsible for discovering and monitoring news."""
    
    def __init__(self):
        self.settings = get_settings()
        self.news_client = NewsAPIClient()
        self.monitored_keywords = [
            "breaking", "urgent", "update",
            "technology", "business", "politics",
            "science", "health", "world"
        ]
    
    async def find_breaking_news(
        self,
        category: Optional[str] = None,
        min_relevance: float = 0.5,
    ) -> Optional[NewsTopic]:
        """Find the most relevant breaking news topic.
        
        Args:
            category: News category (business, entertainment, health, science, sports, technology)
            min_relevance: Minimum relevance score (0.0 to 1.0)
            
        Returns:
            Most relevant NewsTopic or None if no suitable topic found
        """
        logger.info(f"Scouting for breaking news (category: {category or 'all'})")
        
        # Fetch top headlines
        topics = await self.news_client.get_top_headlines(category=category)
        
        if not topics:
            logger.warning("No headlines found, trying search")
            # Fallback to search with breaking keywords
            topics = await self.news_client.search_news(
                query="breaking news",
                sort_by="popularity"
            )
        
        if not topics:
            logger.error("No news topics found")
            return None
        
        # Score and filter topics
        scored_topics = []
        for topic in topics:
            score = self._calculate_relevance(topic)
            topic.relevance_score = score
            if score >= min_relevance:
                scored_topics.append(topic)
        
        # Sort by relevance
        scored_topics.sort(key=lambda x: x.relevance_score, reverse=True)
        
        if not scored_topics:
            logger.warning(f"No topics met minimum relevance threshold of {min_relevance}")
            # Return the highest scored topic anyway as fallback
            if topics:
                best_topic = max(topics, key=lambda x: x.relevance_score)
                logger.info(f"Using fallback topic: {best_topic.title}")
                return best_topic
            return None
        
        best_topic = scored_topics[0]
        logger.info(f"Selected topic: {best_topic.title} (score: {best_topic.relevance_score:.2f})")
        
        # Gather additional sources for the topic
        await self._enrich_sources(best_topic)
        
        return best_topic
    
    async def search_topics(
        self,
        query: str,
        limit: int = 5,
    ) -> List[NewsTopic]:
        """Search for specific news topics.
        
        Args:
            query: Search query
            limit: Maximum number of topics to return
            
        Returns:
            List of relevant NewsTopic objects
        """
        logger.info(f"Searching for topics: {query}")
        
        topics = await self.news_client.search_news(query=query)
        
        # Score and sort
        for topic in topics:
            topic.relevance_score = self._calculate_relevance(topic, query)
        
        topics.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return topics[:limit]
    
    def _calculate_relevance(self, topic: NewsTopic, search_query: Optional[str] = None) -> float:
        """Calculate relevance score for a news topic.
        
        Factors:
        - Keyword matches in title/description
        - Source credibility
        - Recency
        - Content completeness
        """
        score = 0.0
        
        # Base score
        score += 0.3
        
        # Check for breaking keywords
        text = f"{topic.title} {topic.description or ''}".lower()
        keyword_matches = sum(1 for kw in self.monitored_keywords if kw in text)
        score += min(keyword_matches * 0.1, 0.3)
        
        # Search query match bonus
        if search_query:
            search_terms = search_query.lower().split()
            matches = sum(1 for term in search_terms if term in text)
            score += (matches / len(search_terms)) * 0.3
        
        # Content completeness
        if topic.description and len(topic.description) > 100:
            score += 0.1
        
        # Source quality (would be expanded with known good sources)
        reputable_sources = [
            "reuters", "associated press", "ap ", "bloomberg",
            "wall street journal", "wsj", "new york times", "nyt",
            "bbc", "cnn", "guardian", "financial times", "ft"
        ]
        source_lower = topic.sources[0].name.lower() if topic.sources else ""
        if any(rs in source_lower for rs in reputable_sources):
            score += 0.2
        
        return min(score, 1.0)
    
    async def _enrich_sources(self, topic: NewsTopic) -> None:
        """Find additional sources for the same topic."""
        try:
            # Search for related articles
            related = await self.news_client.search_news(
                query=topic.title[:50],  # Use first 50 chars of title
                sort_by="relevancy"
            )
            
            # Add unique sources
            existing_urls = {s.url for s in topic.sources}
            for rel_topic in related[:3]:  # Limit to 3 additional sources
                for source in rel_topic.sources:
                    if source.url not in existing_urls:
                        topic.sources.append(source)
                        existing_urls.add(source.url)
                        
        except Exception as e:
            logger.warning(f"Could not enrich sources: {e}")
    
    async def monitor_keywords(
        self,
        keywords: List[str],
        interval_minutes: int = 15,
    ) -> List[NewsTopic]:
        """Monitor specific keywords for new articles.
        
        Args:
            keywords: List of keywords to monitor
            interval_minutes: Time window to check
            
        Returns:
            List of matching NewsTopic objects
        """
        logger.info(f"Monitoring keywords: {keywords}")
        
        all_topics = []
        for keyword in keywords:
            topics = await self.news_client.search_news(query=keyword)
            for topic in topics:
                topic.keywords.append(keyword)
            all_topics.extend(topics)
        
        # Remove duplicates based on URL
        seen_urls = set()
        unique_topics = []
        for topic in all_topics:
            url = topic.sources[0].url if topic.sources else ""
            if url not in seen_urls:
                seen_urls.add(url)
                unique_topics.append(topic)
        
        return unique_topics
