# app/integrations/supabase_client.py
"""Supabase client for storing and retrieving articles."""

import logging
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from supabase import create_client, Client

from app.config import get_settings
from app.db.sqlite_client import get_sqlite_client
from app.models.article import Article, ArticleStatus, GenerationStatus

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Client for Supabase database operations."""
    
    _instance: Optional["SupabaseClient"] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        """Singleton pattern to ensure single client instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Supabase client."""
        if self._client is not None:
            return
            
        settings = get_settings()
        
        # Always initialize SQLite fallback (in case Supabase fails or is not configured)
        self._sqlite_fallback = get_sqlite_client()
        
        if not settings.supabase_url or not settings.supabase_key:
            logger.warning("Supabase credentials not configured - using SQLite fallback")
            self._client = None
            return
        
        try:
            self._client = create_client(settings.supabase_url, settings.supabase_key)
            logger.info("Supabase client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}, using SQLite fallback")
            self._client = None
    
    @property
    def is_connected(self) -> bool:
        """Check if Supabase client is connected."""
        return self._client is not None
    
    async def store_article(self, article: Article) -> Optional[str]:
        """Store a generated article in Supabase.
        
        Args:
            article: The article to store
            
        Returns:
            The article ID if successful, None otherwise
        """
        if not self.is_connected:
            logger.info("Supabase not connected - using SQLite fallback for store_article")
            return await self._sqlite_fallback.store_article(article)
        
        try:
            # Convert article to dict for Supabase
            article_data = {
                "id": article.id,
                "headline": article.headline,
                "body": article.body,
                "summary": article.summary,
                "keywords": article.keywords,
                "meta_title": article.meta_title,
                "meta_description": article.meta_description,
                "topic_id": article.topic_id,
                "created_at": article.created_at.isoformat() if article.created_at else datetime.utcnow().isoformat(),
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "sources": [
                    {
                        "name": s.name,
                        "url": s.url,
                        "published_at": s.published_at.isoformat() if s.published_at else None,
                    }
                    for s in article.sources
                ],
                "credibility_score": article.credibility_score,
            }
            
            result = self._client.table("articles").upsert(article_data).execute()
            
            if result.data:
                logger.info(f"Article stored in Supabase: {article.id}")
                return article.id
            else:
                logger.error("Failed to store article - no data returned")
                return None
                
        except Exception as e:
            logger.error(f"Error storing article: {e}")
            return None
    
    async def get_article(self, article_id: str) -> Optional[Article]:
        """Fetch an article by ID.
        
        Args:
            article_id: The article ID to fetch
            
        Returns:
            Article if found, None otherwise
        """
        if not self.is_connected:
            logger.info("Supabase not connected - using SQLite fallback for get_article")
            return await self._sqlite_fallback.get_article(article_id)
        
        try:
            result = self._client.table("articles").select("*").eq("id", article_id).execute()
            
            if not result.data:
                return None
            
            data = result.data[0]
            return self._dict_to_article(data)
            
        except Exception as e:
            logger.error(f"Error fetching article {article_id}: {e}")
            return None
    
    async def list_recent_articles(
        self,
        limit: int = 10,
        offset: int = 0,
    ) -> List[Article]:
        """List recent articles.
        
        Args:
            limit: Maximum number of articles to return
            offset: Number of articles to skip
            
        Returns:
            List of articles
        """
        if not self.is_connected:
            logger.info("Supabase not connected - using SQLite fallback for list_recent_articles")
            return await self._sqlite_fallback.list_recent_articles(limit, offset)
        
        try:
            result = (
                self._client.table("articles")
                .select("*")
                .order("created_at", desc=True)
                .limit(limit)
                .offset(offset)
                .execute()
            )
            
            return [self._dict_to_article(data) for data in result.data]
            
        except Exception as e:
            logger.error(f"Error listing articles: {e}")
            return []
    
    async def update_article_status(
        self,
        article_id: str,
        status: str,
        error_message: Optional[str] = None,
    ) -> bool:
        """Update article status.
        
        Args:
            article_id: The article ID to update
            status: New status value
            error_message: Optional error message
            
        Returns:
            True if successful, False otherwise
        """
        if not self.is_connected:
            logger.info("Supabase not connected - using SQLite fallback for update_article_status")
            return await self._sqlite_fallback.update_article_status(article_id, status, error_message)
        
        try:
            update_data = {"status": status}
            if error_message:
                update_data["error_message"] = error_message
            
            result = (
                self._client.table("articles")
                .update(update_data)
                .eq("id", article_id)
                .execute()
            )
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Error updating article status: {e}")
            return False
    
    def _dict_to_article(self, data: dict) -> Article:
        """Convert Supabase dict to Article model.
        
        Args:
            data: Dictionary from Supabase
            
        Returns:
            Article model
        """
        from app.models.article import Source
        
        sources = []
        for s in data.get("sources", []):
            source = Source(
                name=s.get("name", ""),
                url=s.get("url", ""),
                published_at=datetime.fromisoformat(s["published_at"].replace("Z", "+00:00")) if s.get("published_at") else None,
            )
            sources.append(source)
        
        created_at = data.get("created_at")
        if created_at:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        published_at = data.get("published_at")
        if published_at:
            published_at = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        
        return Article(
            id=data.get("id", str(uuid4())),
            headline=data.get("headline", ""),
            body=data.get("body", ""),
            summary=data.get("summary"),
            sources=sources,
            keywords=data.get("keywords", []),
            meta_title=data.get("meta_title"),
            meta_description=data.get("meta_description"),
            created_at=created_at or datetime.utcnow(),
            published_at=published_at,
            topic_id=data.get("topic_id"),
            credibility_score=data.get("credibility_score", 85),
        )


# Global client instance
_supabase_client: Optional[SupabaseClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client instance."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client
