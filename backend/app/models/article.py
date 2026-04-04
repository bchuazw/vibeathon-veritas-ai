# app/models/article.py
from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ArticleStatus(str, Enum):
    """Status of article generation."""
    PENDING = "pending"
    SCOUTING = "scouting"
    RESEARCHING = "researching"
    WRITING = "writing"
    EDITING = "editing"
    PUBLISHING = "publishing"
    COMPLETED = "completed"
    FAILED = "failed"


class Source(BaseModel):
    """News source reference."""
    name: str
    url: str
    published_at: Optional[datetime] = None


class NewsTopic(BaseModel):
    """Discovered news topic from scouting."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    description: Optional[str] = None
    sources: List[Source] = []
    relevance_score: float = 0.0
    keywords: List[str] = []
    image_url: Optional[str] = None


class Article(BaseModel):
    """Complete article model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    headline: str
    body: str
    summary: Optional[str] = None
    sources: List[Source] = []
    keywords: List[str] = []
    image_url: Optional[str] = None
    
    # SEO fields
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    
    # Virlo optimization fields
    virlo_optimized: bool = False
    virlo_score: Optional[int] = None  # Viral potential score (0-100)
    virlo_original_headline: Optional[str] = None
    virlo_suggested_hashtags: List[str] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    # Original topic reference
    topic_id: Optional[str] = None
    
    # Credibility score (0-100)
    credibility_score: int = Field(default=85, ge=0, le=100)


class ArticleRequest(BaseModel):
    """Request to generate an article from a topic."""
    topic: str
    keywords: List[str] = []
    target_length: int = Field(default=400, ge=200, le=1000)


class ArticleResponse(BaseModel):
    """Response containing a generated article."""
    success: bool
    article: Optional[Article] = None
    error: Optional[str] = None
    processing_time_ms: Optional[int] = None


class GenerationStatus(BaseModel):
    """Status of an article generation job."""
    id: str
    status: ArticleStatus
    progress: float = Field(ge=0.0, le=1.0)
    message: Optional[str] = None
    article_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    error: Optional[str] = None
