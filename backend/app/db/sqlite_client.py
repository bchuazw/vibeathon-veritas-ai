"""SQLite client for storing and retrieving articles."""

import json
import logging
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from app.config import get_settings
from app.models.article import Article, ArticleStatus

logger = logging.getLogger(__name__)


class SQLiteClient:
    """Client for SQLite database operations."""
    
    _instance: Optional["SQLiteClient"] = None
    _connection: Optional[sqlite3.Connection] = None
    
    def __new__(cls):
        """Singleton pattern to ensure single client instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize SQLite client."""
        if self._connection is not None:
            return
            
        settings = get_settings()
        
        # Parse database URL (format: sqlite:///path/to/db.sqlite)
        db_url = settings.database_url or "sqlite:///./data/veritas.db"
        
        if db_url.startswith("sqlite:///"):
            db_path = db_url[10:]  # Remove 'sqlite:///' prefix
        elif db_url.startswith("sqlite://"):
            db_path = db_url[9:]   # Remove 'sqlite://' prefix
        else:
            db_path = db_url
        
        # Convert relative paths
        if db_path.startswith("./"):
            # Get the project root (parent of app directory)
            project_root = Path(__file__).parent.parent.parent
            db_path = project_root / db_path[2:]
        
        self.db_path = Path(db_path)
        
        # Create data directory if it doesn't exist
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            self._connection = sqlite3.connect(str(self.db_path), check_same_thread=False)
            self._connection.row_factory = sqlite3.Row
            self._create_tables()
            logger.info(f"SQLite client initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize SQLite client: {e}")
            self._connection = None
    
    def _create_tables(self):
        """Create necessary tables if they don't exist."""
        cursor = self._connection.cursor()
        
        # Articles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id TEXT PRIMARY KEY,
                headline TEXT NOT NULL,
                body TEXT NOT NULL,
                summary TEXT,
                keywords TEXT,  -- JSON array
                meta_title TEXT,
                meta_description TEXT,
                topic_id TEXT,
                status TEXT DEFAULT 'completed',
                error_message TEXT,
                sources TEXT,  -- JSON array
                created_at TEXT NOT NULL,
                published_at TEXT,
                updated_at TEXT NOT NULL
            )
        """)
        
        # Create index on created_at for efficient sorting
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_articles_created_at 
            ON articles(created_at DESC)
        """)
        
        self._connection.commit()
        cursor.close()
    
    @property
    def is_connected(self) -> bool:
        """Check if SQLite client is connected."""
        return self._connection is not None
    
    async def store_article(self, article: Article) -> Optional[str]:
        """Store a generated article in SQLite.
        
        Args:
            article: The article to store
            
        Returns:
            The article ID if successful, None otherwise
        """
        if not self.is_connected:
            logger.warning("SQLite not connected - article not persisted")
            return article.id
        
        try:
            cursor = self._connection.cursor()
            
            now = datetime.utcnow().isoformat()
            created_at = article.created_at.isoformat() if article.created_at else now
            published_at = article.published_at.isoformat() if article.published_at else None
            
            # Convert sources to JSON
            sources_json = json.dumps([
                {
                    "name": s.name,
                    "url": s.url,
                    "published_at": s.published_at.isoformat() if s.published_at else None,
                }
                for s in article.sources
            ])
            
            # Convert keywords to JSON
            keywords_json = json.dumps(article.keywords) if article.keywords else "[]"
            
            cursor.execute("""
                INSERT OR REPLACE INTO articles (
                    id, headline, body, summary, keywords, meta_title, meta_description,
                    topic_id, status, sources, created_at, published_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                article.id,
                article.headline,
                article.body,
                article.summary,
                keywords_json,
                article.meta_title,
                article.meta_description,
                article.topic_id,
                "completed",  # Default status for new articles
                sources_json,
                created_at,
                published_at,
                now,
            ))
            
            self._connection.commit()
            cursor.close()
            
            logger.info(f"Article stored in SQLite: {article.id}")
            return article.id
            
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
            logger.warning("SQLite not connected - cannot fetch article")
            return None
        
        try:
            cursor = self._connection.cursor()
            cursor.execute(
                "SELECT * FROM articles WHERE id = ?",
                (article_id,)
            )
            row = cursor.fetchone()
            cursor.close()
            
            if row is None:
                return None
            
            return self._row_to_article(row)
            
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
            logger.warning("SQLite not connected - cannot list articles")
            return []
        
        try:
            cursor = self._connection.cursor()
            cursor.execute(
                """
                SELECT * FROM articles 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
                """,
                (limit, offset)
            )
            rows = cursor.fetchall()
            cursor.close()
            
            return [self._row_to_article(row) for row in rows]
            
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
            logger.warning("SQLite not connected - cannot update status")
            return False
        
        try:
            cursor = self._connection.cursor()
            now = datetime.utcnow().isoformat()
            
            cursor.execute(
                """
                UPDATE articles 
                SET status = ?, error_message = ?, updated_at = ?
                WHERE id = ?
                """,
                (status, error_message, now, article_id)
            )
            
            self._connection.commit()
            updated = cursor.rowcount > 0
            cursor.close()
            
            return updated
            
        except Exception as e:
            logger.error(f"Error updating article status: {e}")
            return False
    
    def _row_to_article(self, row: sqlite3.Row) -> Article:
        """Convert database row to Article model.
        
        Args:
            row: SQLite row
            
        Returns:
            Article model
        """
        from app.models.article import Source
        
        # Parse sources from JSON
        sources = []
        sources_json = row["sources"]
        if sources_json:
            try:
                sources_data = json.loads(sources_json)
                for s in sources_data:
                    source = Source(
                        name=s.get("name", ""),
                        url=s.get("url", ""),
                        published_at=datetime.fromisoformat(s["published_at"].replace("Z", "+00:00")) if s.get("published_at") else None,
                    )
                    sources.append(source)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse sources JSON for article {row['id']}")
        
        # Parse keywords from JSON
        keywords = []
        keywords_json = row["keywords"]
        if keywords_json:
            try:
                keywords = json.loads(keywords_json)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse keywords JSON for article {row['id']}")
        
        # Parse timestamps
        created_at = row["created_at"]
        if created_at:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        
        published_at = row["published_at"]
        if published_at:
            published_at = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        
        return Article(
            id=row["id"],
            headline=row["headline"],
            body=row["body"],
            summary=row["summary"],
            sources=sources,
            keywords=keywords,
            meta_title=row["meta_title"],
            meta_description=row["meta_description"],
            created_at=created_at or datetime.utcnow(),
            published_at=published_at,
            topic_id=row["topic_id"],
        )


# Global client instance
_sqlite_client: Optional[SQLiteClient] = None


def get_sqlite_client() -> SQLiteClient:
    """Get or create SQLite client instance."""
    global _sqlite_client
    if _sqlite_client is None:
        _sqlite_client = SQLiteClient()
    return _sqlite_client
