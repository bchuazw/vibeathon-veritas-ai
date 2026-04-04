# app/tests/test_basic.py
"""Basic tests for Veritas AI backend."""

import pytest
from fastapi.testclient import TestClient


def test_imports():
    """Test that all main modules can be imported."""
    from app.main import app
    from app.agents.content_creator import ContentCreatorAgent
    from app.agents.scout import ScoutAgent
    from app.integrations.unsplash import UnsplashClient
    assert True


def test_unsplash_client():
    """Test Unsplash client initialization and image fetching."""
    from app.integrations.unsplash import UnsplashClient
    
    client = UnsplashClient()
    
    # Test getting image for a category
    image_url = client.get_image_for_category("Technology")
    assert image_url is not None
    assert image_url.startswith("https://")
    
    # Test getting image for different categories
    categories = ["Business", "Science", "Health", "Environment"]
    for category in categories:
        url = client.get_image_for_category(category)
        assert url is not None
        assert url.startswith("https://")


def test_unsplash_category_keywords():
    """Test that all categories have image mappings."""
    from app.integrations.unsplash import UnsplashClient
    
    client = UnsplashClient()
    
    # Check that all defined categories return images
    for category in client.CATEGORY_IMAGES.keys():
        url = client.get_image_for_category(category)
        assert url is not None, f"Category {category} should return an image URL"


# Mark tests that need the full app (for future expansion)
pytestmark = pytest.mark.asyncio
