"""Persistent rate limiting with SQLite backing for production use."""

import hashlib
import logging
import time
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from fastapi import Request, HTTPException

from app.db.sqlite_client import get_sqlite_client

logger = logging.getLogger(__name__)

# Rate limit configuration
RATE_LIMIT_REQUESTS = 3  # requests per window
RATE_LIMIT_WINDOW_SECONDS = 3600  # 1 hour


@dataclass
class RateLimitEntry:
    """Entry for tracking rate limit state."""
    requests: int = 0
    window_start: float = field(default_factory=time.time)
    
    def reset(self):
        """Reset the entry for a new window."""
        self.requests = 0
        self.window_start = time.time()


class PersistentRateLimiter:
    """Rate limiter with SQLite persistence for production use.
    
    Uses in-memory cache for speed, but persists to SQLite for:
    - Surviving server restarts
    - Sharing rate limits across multiple server instances (if using shared SQLite)
    - Audit trails and monitoring
    """
    
    def __init__(
        self,
        max_requests: int = RATE_LIMIT_REQUESTS,
        window_seconds: int = RATE_LIMIT_WINDOW_SECONDS,
        use_persistent_storage: bool = True
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.use_persistent_storage = use_persistent_storage
        self._cache: Dict[str, RateLimitEntry] = {}
        self._cache_hits = 0
        self._db_hits = 0
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client.
        
        Uses X-Forwarded-For header if behind a proxy, otherwise uses client host.
        Falls back to a hash of the User-Agent if no IP is available.
        """
        # Try to get real IP from forwarded headers (common for Render, etc.)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain (client IP)
            ip = forwarded_for.split(",")[0].strip()
        else:
            # Try other forwarded headers
            real_ip = request.headers.get("X-Real-IP")
            if real_ip:
                ip = real_ip
            elif request.client and request.client.host:
                ip = request.client.host
            else:
                # Last resort: hash of user agent
                user_agent = request.headers.get("User-Agent", "unknown")
                ip = f"ua_{hashlib.sha256(user_agent.encode()).hexdigest()[:16]}"
        
        # Hash the IP for privacy
        return hashlib.sha256(ip.encode()).hexdigest()[:32]
    
    async def _load_from_db(self, client_id: str) -> Optional[RateLimitEntry]:
        """Load rate limit entry from database."""
        if not self.use_persistent_storage:
            return None
        
        try:
            db = get_sqlite_client()
            data = await db.get_rate_limit(client_id)
            
            if data is None:
                return None
            
            return RateLimitEntry(
                requests=data["requests"],
                window_start=datetime.fromisoformat(data["window_start"]).timestamp()
            )
        except Exception as e:
            logger.error(f"Error loading rate limit from DB: {e}")
            return None
    
    async def _save_to_db(self, client_id: str, entry: RateLimitEntry):
        """Save rate limit entry to database."""
        if not self.use_persistent_storage:
            return
        
        try:
            db = get_sqlite_client()
            await db.update_rate_limit(
                client_id,
                entry.requests,
                datetime.fromtimestamp(entry.window_start)
            )
        except Exception as e:
            logger.error(f"Error saving rate limit to DB: {e}")
    
    def _clean_expired_cache_entries(self):
        """Remove expired entries from memory cache."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self._cache.items()
            if current_time - entry.window_start > self.window_seconds * 2
        ]
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.debug(f"Cleaned {len(expired_keys)} expired cache entries")
    
    async def is_allowed(self, request: Request) -> Tuple[bool, int, float]:
        """Check if the request is allowed under rate limiting rules.
        
        Args:
            request: The incoming request
            
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time)
        """
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        # Clean expired cache entries periodically (1% chance per request)
        if hash(str(current_time)) % 100 == 0:
            self._clean_expired_cache_entries()
        
        # Try cache first
        entry = self._cache.get(client_id)
        
        # If not in cache, try database
        if entry is None and self.use_persistent_storage:
            entry = await self._load_from_db(client_id)
            if entry:
                self._cache[client_id] = entry
                self._db_hits += 1
        
        # Create new entry if needed
        if entry is None:
            entry = RateLimitEntry()
            self._cache[client_id] = entry
        else:
            self._cache_hits += 1
        
        # Check if window has expired
        if current_time - entry.window_start > self.window_seconds:
            entry.reset()
        
        # Check if limit exceeded
        if entry.requests >= self.max_requests:
            reset_time = entry.window_start + self.window_seconds
            remaining = 0
            return False, remaining, reset_time
        
        # Request is allowed
        entry.requests += 1
        remaining = self.max_requests - entry.requests
        reset_time = entry.window_start + self.window_seconds
        
        # Persist to database (async fire-and-forget)
        if self.use_persistent_storage:
            import asyncio
            asyncio.create_task(self._save_to_db(client_id, entry))
        
        logger.debug(f"Rate limit for {client_id[:8]}...: {entry.requests}/{self.max_requests}")
        
        return True, remaining, reset_time
    
    def get_limit_info(self, request: Request) -> Tuple[int, float]:
        """Get current rate limit info without incrementing.
        
        Returns:
            Tuple of (remaining_requests, reset_time)
        """
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        entry = self._cache.get(client_id)
        
        if entry is None:
            return self.max_requests, current_time + self.window_seconds
        
        # Check if window has expired
        if current_time - entry.window_start > self.window_seconds:
            return self.max_requests, current_time + self.window_seconds
        
        remaining = max(0, self.max_requests - entry.requests)
        reset_time = entry.window_start + self.window_seconds
        
        return remaining, reset_time
    
    def get_stats(self) -> dict:
        """Get rate limiter statistics."""
        return {
            "cache_size": len(self._cache),
            "cache_hits": self._cache_hits,
            "db_hits": self._db_hits,
            "max_requests": self.max_requests,
            "window_seconds": self.window_seconds,
        }


# Global rate limiter instance
_rate_limiter: Optional[PersistentRateLimiter] = None


def get_rate_limiter() -> PersistentRateLimiter:
    """Get or create the global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        # Use persistent storage in production
        use_persistent = __import__('os').getenv('VERITAS_ENV', 'development') == 'production'
        _rate_limiter = PersistentRateLimiter(use_persistent_storage=use_persistent)
    return _rate_limiter
