# app/integrations/newsapi.py
import logging
from datetime import datetime, timedelta
from typing import List, Optional

import httpx

from app.config import get_settings
from app.models.article import NewsTopic, Source

logger = logging.getLogger(__name__)


class NewsAPIClient:
    """Client for NewsAPI integration."""
    
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.newsapi_base_url
        self.api_key = self.settings.newsapi_key
        self.page_size = self.settings.newsapi_page_size
        
    def _get_mock_headlines(self) -> List[NewsTopic]:
        """Return mock breaking news headlines for demo purposes."""
        mock_articles = [
            {
                "title": "OpenAI Announces GPT-5 with Breakthrough Reasoning Capabilities",
                "description": "The latest model demonstrates unprecedented performance on complex problem-solving tasks, surpassing human-level performance on several benchmarks.",
                "url": "https://example.com/openai-gpt5",
                "source": {"name": "TechCrunch"},
                "publishedAt": datetime.utcnow().isoformat(),
                "urlToImage": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
            },
            {
                "title": "Google DeepMind's AlphaFold 3 Revolutionizes Drug Discovery",
                "description": "Scientists report major breakthrough in protein structure prediction that could accelerate development of life-saving medications.",
                "url": "https://example.com/alphafold3",
                "source": {"name": "Nature"},
                "publishedAt": datetime.utcnow().isoformat(),
                "urlToImage": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
            },
            {
                "title": "Tesla's Full Self-Driving Reaches 1 Billion Miles Driven Autonomously",
                "description": "The milestone marks a significant step toward widespread autonomous vehicle adoption as safety records improve.",
                "url": "https://example.com/tesla-fsd",
                "source": {"name": "Reuters"},
                "publishedAt": datetime.utcnow().isoformat(),
                "urlToImage": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
            },
            {
                "title": "Apple Unveils AI-Powered Health Monitoring in Latest Watch",
                "description": "New sensors can detect early signs of cardiovascular issues and respiratory conditions using machine learning algorithms.",
                "url": "https://example.com/apple-watch-ai",
                "source": {"name": "The Verge"},
                "publishedAt": datetime.utcnow().isoformat(),
                "urlToImage": "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80",
            },
            {
                "title": "Microsoft's Quantum Computer Achieves Error Correction Breakthrough",
                "description": "Researchers demonstrate a logical qubit with 100x lower error rates, paving the way for practical quantum computing applications.",
                "url": "https://example.com/microsoft-quantum",
                "source": {"name": "Ars Technica"},
                "publishedAt": datetime.utcnow().isoformat(),
                "urlToImage": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
            },
        ]
        logger.warning("Using mock news data - add NEWSAPI_KEY for real news")
        return self._parse_articles(mock_articles)

    async def get_top_headlines(
        self,
        category: Optional[str] = None,
        country: str = "us",
        q: Optional[str] = None,
    ) -> List[NewsTopic]:
        """Fetch top headlines from NewsAPI."""
        # Check if API key is configured
        if not self.api_key:
            logger.warning("NEWSAPI_KEY not set - using mock data")
            return self._get_mock_headlines()
        
        url = f"{self.base_url}/top-headlines"
        params = {
            "apiKey": self.api_key,
            "pageSize": self.page_size,
            "country": country,
        }
        if category:
            params["category"] = category
        if q:
            params["q"] = q
            
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "ok":
                    logger.error(f"NewsAPI error: {data}")
                    # Fallback to mock data on API error
                    return self._get_mock_headlines()
                
                return self._parse_articles(data.get("articles", []))
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching headlines: {e}")
            return self._get_mock_headlines()
        except Exception as e:
            logger.error(f"Error fetching headlines: {e}")
            return self._get_mock_headlines()
    
    async def search_news(
        self,
        query: str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        sort_by: str = "relevancy",
    ) -> List[NewsTopic]:
        """Search for news articles."""
        # Check if API key is configured
        if not self.api_key:
            logger.warning("NEWSAPI_KEY not set - using mock data for search")
            return self._get_mock_headlines()
        
        url = f"{self.base_url}/everything"
        
        if not from_date:
            from_date = datetime.utcnow() - timedelta(days=7)
        if not to_date:
            to_date = datetime.utcnow()
            
        params = {
            "apiKey": self.api_key,
            "q": query,
            "from": from_date.strftime("%Y-%m-%d"),
            "to": to_date.strftime("%Y-%m-%d"),
            "sortBy": sort_by,
            "pageSize": self.page_size,
            "language": "en",
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "ok":
                    logger.error(f"NewsAPI error: {data}")
                    return self._get_mock_headlines()
                
                return self._parse_articles(data.get("articles", []))
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error searching news: {e}")
            return self._get_mock_headlines()
        except Exception as e:
            logger.error(f"Error searching news: {e}")
            return self._get_mock_headlines()
    
    def _parse_articles(self, articles: List[dict]) -> List[NewsTopic]:
        """Parse NewsAPI articles into NewsTopic models."""
        topics = []
        
        for article in articles:
            if not article.get("title") or article["title"] == "[Removed]":
                continue
                
            source = Source(
                name=article.get("source", {}).get("name", "Unknown"),
                url=article.get("url", ""),
                published_at=article.get("publishedAt"),
            )
            
            topic = NewsTopic(
                title=article.get("title", ""),
                description=article.get("description") or article.get("content", ""),
                sources=[source],
                relevance_score=0.8,  # Default score for NewsAPI results
                keywords=self._extract_keywords(article),
                image_url=article.get("urlToImage"),
            )
            topics.append(topic)
            
        return topics
    
    def _extract_keywords(self, article: dict) -> List[str]:
        """Extract keywords from article."""
        keywords = []
        text = f"{article.get('title', '')} {article.get('description', '')}"
        
        # Simple keyword extraction - in production, use NLP
        common_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"}
        words = text.lower().split()
        
        for word in words:
            word = word.strip(".,!?;:()")
            if len(word) > 4 and word not in common_words:
                keywords.append(word)
        
        return list(set(keywords))[:5]  # Return top 5 unique keywords
