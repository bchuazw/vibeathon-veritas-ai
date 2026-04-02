# app/main.py
import logging
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.api.routes import router
from app.api.persistent_rate_limiter import get_rate_limiter

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

# Add CORS middleware - MUST be before router
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Include routers
app.include_router(router)


# Global exception handler for rate limiting
@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    """Handle rate limit errors with user-friendly response."""
    retry_after = exc.detail.get("retry_after", 3600) if isinstance(exc.detail, dict) else 3600
    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Too many requests. Please try again in {retry_after} seconds.",
            "retry_after": retry_after,
            "limit": 2,
            "window": "1 hour",
        },
        headers={
            "Retry-After": str(retry_after),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        },
    )
    return response


# Global exception handler for all errors - ensures CORS headers are present
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions with CORS headers."""
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    response = JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        },
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


# Global exception handler for HTTP exceptions
from fastapi.exceptions import HTTPException

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with CORS headers."""
    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail if isinstance(exc.detail, str) else exc.detail.get("error", "Error"),
            "message": exc.detail if isinstance(exc.detail, str) else exc.detail.get("message", str(exc.detail)),
        },
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger = logging.getLogger(__name__)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    
    # Validate configuration
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set - article generation will fail")
    else:
        logger.info("OPENAI_API_KEY is configured")
    
    if not settings.newsapi_key:
        logger.warning("NEWSAPI_KEY not set - using placeholder")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger = logging.getLogger(__name__)
    logger.info(f"Shutting down {settings.app_name}")
