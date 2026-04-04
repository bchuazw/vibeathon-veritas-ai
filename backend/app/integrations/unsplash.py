# app/integrations/unsplash.py
import logging
import random
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


class UnsplashClient:
    """Client for fetching relevant images from Unsplash."""
    
    # Category to search term mapping
    CATEGORY_IMAGES = {
        "Technology": [
            "technology", "computer", "digital", "innovation", "tech",
            "artificial intelligence", "software", "coding", "robotics"
        ],
        "Business": [
            "business", "office", "meeting", "corporate", "finance",
            "startup", "entrepreneur", "strategy", "professional"
        ],
        "Science": [
            "science", "laboratory", "research", "space", "chemistry",
            "physics", "biology", "experiment", "discovery"
        ],
        "Health": [
            "health", "medical", "healthcare", "doctor", "medicine",
            "wellness", "hospital", "fitness", "healthy"
        ],
        "Politics": [
            "politics", "government", "parliament", "election", "democracy",
            "policy", "political", "vote", "congress"
        ],
        "Sports": [
            "sports", "athlete", "stadium", "competition", "fitness",
            "soccer", "basketball", "tennis", "olympics"
        ],
        "Entertainment": [
            "entertainment", "movie", "music", "concert", "celebration",
            "festival", "theater", "performance", "art"
        ],
        "Environment": [
            "environment", "nature", "climate", "green", "sustainability",
            "renewable energy", "conservation", "earth", "eco"
        ],
        "Education": [
            "education", "school", "university", "learning", "student",
            "classroom", "study", "books", "knowledge"
        ],
        "World": [
            "world", "global", "international", "travel", "culture",
            "diversity", "landmark", "geography", "nations"
        ],
    }
    
    # Generic fallback images for any category
    GENERIC_IMAGES = [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    ]
    
    def __init__(self):
        self.settings = get_settings()
        self.api_key = getattr(self.settings, 'unsplash_access_key', None)
        self.base_url = "https://api.unsplash.com"
    
    def get_image_for_category(self, category: str, keywords: Optional[list] = None) -> Optional[str]:
        """Get a relevant image URL for the given category.
        
        Args:
            category: Article category
            keywords: Optional list of keywords for more specific search
            
        Returns:
            Image URL or None if not found
        """
        # Try to get category-specific images
        search_terms = self.CATEGORY_IMAGES.get(category, ["news", "journalism"])
        
        # Add keywords if provided
        if keywords:
            search_terms = keywords[:2] + search_terms
        
        # Pick a random search term
        search_term = random.choice(search_terms)
        
        # If we have API key, use it; otherwise return curated image
        if self.api_key:
            return self._fetch_from_api(search_term)
        
        # Return a random generic image with category hint in URL
        return self._get_curated_image(category, search_term)
    
    def _fetch_from_api(self, query: str) -> Optional[str]:
        """Fetch image from Unsplash API."""
        try:
            url = f"{self.base_url}/photos/random"
            headers = {"Authorization": f"Client-ID {self.api_key}"}
            params = {
                "query": query,
                "orientation": "landscape",
                "content_filter": "high",
            }
            
            import httpx
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("urls", {}).get("regular")
                else:
                    logger.warning(f"Unsplash API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching from Unsplash API: {e}")
            return None
    
    def _get_curated_image(self, category: str, search_term: str) -> str:
        """Return a curated image URL based on category."""
        # Category-specific curated images
        curated = {
            "Technology": [
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
            ],
            "Business": [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
            ],
            "Science": [
                "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
                "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            ],
            "Health": [
                "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
                "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
                "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&q=80",
            ],
            "Environment": [
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
                "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
                "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
            ],
            "Education": [
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
                "https://images.unsplash.com/photo-1427504740700-9785e978f31f?w=800&q=80",
            ],
            "World": [
                "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
                "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
            ],
            "Sports": [
                "https://images.unsplash.com/photo-1461896836934-60f30b670092?w=800&q=80",
                "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
            ],
            "Politics": [
                "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80",
                "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
            ],
            "Entertainment": [
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
                "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
            ],
        }
        
        # Get category-specific images or fall back to generic
        images = curated.get(category, self.GENERIC_IMAGES)
        return random.choice(images)


# Singleton instance
_unsplash_client = None


def get_unsplash_client() -> UnsplashClient:
    """Get or create Unsplash client singleton."""
    global _unsplash_client
    if _unsplash_client is None:
        _unsplash_client = UnsplashClient()
    return _unsplash_client
