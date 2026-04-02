"""Rate limiting middleware and utilities for the API."""

import logging
import time
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, field
from functools import wraps
import hashlib

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Rate limit configuration
RATE_LIMIT_REQUESTS = 5  # requests per window
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


class RateLimiter:
    """In-memory rate limiter with IP-based tracking."""
    
    def __init__(self, max_requests: int = RATE_LIMIT_REQUESTS, window_seconds: int = RATE_LIMIT_WINDOW_SECONDS):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._storage: Dict[str, RateLimitEntry] = {}
        self._lock = None  # For thread safety if needed
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client.
        
        Uses X-Forwarded-For header if behind a proxy, otherwise uses client host.
        Falls back to a hash of the User-Agent if no IP is available.
        """
        # Try to get real IP from forwarded headers (common for Render, etc.)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain (client IP)
            return forwarded_for.split(",")[0].strip()
        
        # Try other forwarded headers
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to direct client
        if request.client and request.client.host:
            return request.client.host
        
        # Last resort: hash of user agent (not ideal but better than nothing)
        user_agent = request.headers.get("User-Agent", "unknown")
        return hashlib.sha256(user_agent.encode()).hexdigest()[:16]
    
    def _clean_expired_entries(self):
        """Remove expired rate limit entries to prevent memory bloat."""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self._storage.items()
            if current_time - entry.window_start > self.window_seconds * 2  # Keep for 2x window
        ]
        for key in expired_keys:
            del self._storage[key]
        
        if expired_keys:
            logger.debug(f"Cleaned {len(expired_keys)} expired rate limit entries")
    
    def is_allowed(self, request: Request) -> Tuple[bool, int, float]:
        """Check if the request is allowed under rate limiting rules.
        
        Args:
            request: The incoming request
            
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time)
        """
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        # Clean expired entries periodically (1% chance per request)
        if hash(str(current_time)) % 100 == 0:
            self._clean_expired_entries()
        
        # Get or create entry
        if client_id not in self._storage:
            self._storage[client_id] = RateLimitEntry()
        
        entry = self._storage[client_id]
        
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
        
        logger.debug(f"Rate limit check for {client_id}: {entry.requests}/{self.max_requests}")
        
        return True, remaining, reset_time
    
    def get_limit_info(self, request: Request) -> Tuple[int, float]:
        """Get current rate limit info without incrementing.
        
        Returns:
            Tuple of (remaining_requests, reset_time)
        """
        client_id = self._get_client_identifier(request)
        current_time = time.time()
        
        if client_id not in self._storage:
            return self.max_requests, current_time + self.window_seconds
        
        entry = self._storage[client_id]
        
        # Check if window has expired
        if current_time - entry.window_start > self.window_seconds:
            return self.max_requests, current_time + self.window_seconds
        
        remaining = max(0, self.max_requests - entry.requests)
        reset_time = entry.window_start + self.window_seconds
        
        return remaining, reset_time


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to apply rate limiting to all requests."""
    
    async def dispatch(self, request: Request, call_next):
        """Process the request with rate limiting."""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        limiter = get_rate_limiter()
        is_allowed, remaining, reset_time = limiter.is_allowed(request)
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_REQUESTS)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(reset_time))
        
        return response


def rate_limited(max_requests: int = RATE_LIMIT_REQUESTS, window_seconds: int = RATE_LIMIT_WINDOW_SECONDS):
    """Decorator to apply rate limiting to specific endpoints.
    
    Args:
        max_requests: Maximum requests allowed in the window
        window_seconds: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            limiter = get_rate_limiter()
            is_allowed, remaining, reset_time = limiter.is_allowed(request)
            
            if not is_allowed:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "message": f"Too many requests. Please try again after {int(reset_time - time.time())} seconds.",
                        "retry_after": int(reset_time - time.time()),
                    }
                )
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
