# app/main.py
import logging
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings
from app.api.routes import router
from app.api.persistent_rate_limiter import PersistentRateLimiter, get_rate_limiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered news automation system",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Custom CORS middleware that adds headers to ALL responses including errors
class CORSMiddlewareWithErrors(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Handle preflight requests
        if request.method == "OPTIONS":
            response = JSONResponse(content={})
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "600"
            return response
        
        try:
            response = await call_next(request)
        except Exception as exc:
            # Handle uncaught exceptions with CORS headers
            logger.error(f"Unhandled exception: {exc}")
            response = JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred. Please try again later."
                }
            )
        
        # Add CORS headers to all responses
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response

# Add custom CORS middleware first (it needs to wrap everything)
app.add_middleware(CORSMiddlewareWithErrors)

# Add standard CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


# Global exception handler for rate limiting
@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    """Handle rate limit errors with user-friendly response."""
    retry_after = exc.detail.get("retry_after", 3600) if isinstance(exc.detail, dict) else 3600
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Please try again in {retry_after} seconds.",
            "retry_after": retry_after,
            "limit": 5,
            "window": "1 hour",
        },
        headers={"Retry-After": str(retry_after)},
    )


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger = logging.getLogger(__name__)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    
    # Validate configuration
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set - article generation will fail")
    
    if not settings.newsapi_key:
        logger.warning("NEWSAPI_KEY not set - using placeholder")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger = logging.getLogger(__name__)
    logger.info(f"Shutting down {settings.app_name}")
