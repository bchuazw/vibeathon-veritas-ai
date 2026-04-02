#!/usr/bin/env python3
"""Standalone test script for MiniMax API."""

import asyncio
import json
import os
import sys

import httpx


MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
BASE_URL = "https://api.minimaxi.chat/v1"
MODEL = "MiniMax-M2.7"


def get_headers():
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {MINIMAX_API_KEY}"
    }


def strip_think_tags(content: str) -> str:
    """Remove <think>...</think> tags from content."""
    if not content:
        return content
    import re
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
    return content.strip()


async def test_basic_connection():
    """Test basic connection to MiniMax API."""
    print("🧪 Testing MiniMax API Connection...")
    print("=" * 50)
    
    if not MINIMAX_API_KEY:
        print("❌ Error: MINIMAX_API_KEY not set!")
        return False
    
    print(f"✓ API Key configured (starts with: {MINIMAX_API_KEY[:15]}...)")
    print(f"✓ Model: {MODEL}")
    print()
    
    try:
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello from MiniMax!' and nothing else."}
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BASE_URL}/text/chatcompletion_v2",
                headers=get_headers(),
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            print(f"✓ Response received:")
            print(f"  Status: {response.status_code}")
            
            if "choices" in data and data["choices"]:
                content = data["choices"][0]["message"]["content"]
                content = strip_think_tags(content)
                print(f"  Content: {content}")
                return True
            else:
                print(f"⚠ No choices in response: {data}")
                return False
            
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP Error: {e.response.status_code}")
        print(f"  Response: {e.response.text[:500]}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_news_generation():
    """Test news article generation."""
    print("\n📰 Testing news article generation...")
    
    try:
        prompt = """Write a short news article (200 words) about AI in healthcare.

Respond in this exact JSON format:
{
    "headline": "Compelling headline",
    "body": "Full article text",
    "summary": "2-3 sentence summary"
}"""
        
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are a professional journalist. Write in AP Style."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1500,
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BASE_URL}/text/chatcompletion_v2",
                headers=get_headers(),
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" in data and data["choices"]:
                content = data["choices"][0]["message"]["content"]
                content = strip_think_tags(content)
                
                # Try to extract JSON
                try:
                    json_start = content.find('{')
                    json_end = content.rfind('}')
                    if json_start != -1 and json_end != -1:
                        json_str = content[json_start:json_end+1]
                        article = json.loads(json_str)
                        print(f"✓ Article generated:")
                        print(f"  Headline: {article.get('headline', 'N/A')[:60]}...")
                        print(f"  Body length: {len(article.get('body', ''))} chars")
                        print(f"  Summary: {article.get('summary', 'N/A')[:60]}...")
                        
                        with open("/tmp/test_article.txt", "w") as f:
                            f.write(json.dumps(article, indent=2))
                        print(f"  Saved to /tmp/test_article.txt")
                        return True
                    else:
                        print(f"⚠ No JSON found in content")
                        return False
                except json.JSONDecodeError as e:
                    print(f"⚠ JSON decode error: {e}")
                    print(f"  Content: {content[:500]}...")
                    return False
            else:
                print(f"⚠ No choices in response")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    print("\n" + "=" * 50)
    print("🚀 MiniMax API Integration Tests")
    print("=" * 50 + "\n")
    
    tests = [
        ("Basic Connection", test_basic_connection),
        ("News Generation", test_news_generation),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = await test_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Test '{name}' failed: {e}")
            results.append((name, False))
        print()
    
    # Summary
    print("=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, r in results if r)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {name}")
    
    print()
    print(f"Results: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! MiniMax integration is working.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
