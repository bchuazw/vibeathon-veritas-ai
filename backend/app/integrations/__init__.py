# app/integrations/__init__.py
from .newsapi import NewsAPIClient
from .minimax_client import MiniMaxClient

__all__ = ["NewsAPIClient", "MiniMaxClient"]
