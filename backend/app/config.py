from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    minimax_api_key: str = ""
    newsapi_key: str = ""
    
    # Legacy OpenAI key (deprecated, kept for backwards compatibility)
    openai_api_key: str = ""
    
    # Supabase settings
    supabase_url: str = ""
    supabase_key: str = ""
    
    # Database settings
    database_url: str = "sqlite:///./data/veritas.db"
    
    # Application settings
    app_name: str = "Veritas AI"
    app_version: str = "1.0.0"
    debug: bool = False
    backend_port: int = 8000
    
    # NewsAPI settings
    newsapi_base_url: str = "https://newsapi.org/v2"
    newsapi_page_size: int = 20
    
    # MiniMax settings (replaces OpenAI)
    minimax_model: str = "MiniMax-M2.7"
    minimax_max_tokens: int = 2000
    minimax_temperature: float = 0.7
    
    # Legacy OpenAI settings (deprecated, kept for backwards compatibility)
    openai_model: str = "gpt-4"
    openai_max_tokens: int = 2000
    openai_temperature: float = 0.7
    
    # Pipeline settings
    max_retries: int = 3
    retry_delay: float = 1.0
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
