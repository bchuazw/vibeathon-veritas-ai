# app/integrations/minimax_client.py
import json
import logging
import re
from typing import Dict, List, Optional, AsyncGenerator

import httpx

from app.config import get_settings
from app.models.article import Article, Source

logger = logging.getLogger(__name__)


class MiniMaxClient:
    """Client for MiniMax API integration (replacing OpenAI)."""
    
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.minimax_api_key
        self.model = self.settings.minimax_model
        self.max_tokens = self.settings.minimax_max_tokens
        self.temperature = self.settings.minimax_temperature
        self.base_url = "https://api.minimaxi.chat/v1"
        
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for MiniMax API requests."""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
    
    def _extract_content(self, data: Dict) -> str:
        """Extract content from MiniMax response."""
        content = ""
        
        if "choices" in data and data["choices"] and len(data["choices"]) > 0:
            choice = data["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                content = choice["message"]["content"]
            elif "text" in choice:
                content = choice["text"]
        elif "output" in data:
            content = data["output"]
        elif "content" in data:
            content = data["content"]
        
        # Strip <think> tags if present (reasoning models)
        content = self._strip_think_tags(content)
        
        return content
    
    def _strip_think_tags(self, content: str) -> str:
        """Remove <think>...</think> tags from content."""
        if not content:
            return content
        # Remove <think> tags and their content
        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        # Clean up any extra whitespace
        content = content.strip()
        return content
    
    async def _chat_completion(
        self,
        messages: List[Dict[str, str]],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        response_format: Optional[Dict] = None
    ) -> str:
        """Make a chat completion request to MiniMax API."""
        
        # Note: MiniMax requires temperature and max_tokens to be set
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens or self.max_tokens or 2000,
            "temperature": temperature if temperature is not None else self.temperature if self.temperature is not None else 0.7,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/text/chatcompletion_v2",
                    headers=self._get_headers(),
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract content from MiniMax response
                content = self._extract_content(data)
                
                if not content:
                    logger.error(f"No content in response: {data}")
                    return ""
                
                return content
                    
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error from MiniMax: {e.response.status_code} - {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Error calling MiniMax API: {e}")
                raise
    
    async def research_topic(self, topic: str, sources: List[Source]) -> Dict:
        """Research a topic using available sources."""
        sources_text = "\n\n".join([
            f"Source: {s.name}\nURL: {s.url}" 
            for s in sources[:5]  # Limit to top 5 sources
        ])
        
        prompt = f"""Research the following news topic thoroughly:

Topic: {topic}

Available Sources:
{sources_text}

Please provide:
1. Key facts and details about this topic
2. Different perspectives or angles
3. Any conflicting information that needs verification
4. Important context or background

Respond in JSON format:
{{
    "key_facts": ["fact 1", "fact 2", ...],
    "perspectives": ["perspective 1", "perspective 2", ...],
    "conflicts": ["conflict 1", ...],
    "context": "background information"
}}"""

        try:
            messages = [
                {"role": "system", "content": "You are a thorough news researcher. Provide factual, well-sourced information. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                temperature=0.3,  # Lower temperature for factual content
                max_tokens=1500
            )
            
            # Try to extract JSON from the content
            try:
                # Find JSON in the content
                json_start = content.find('{')
                json_end = content.rfind('}')
                if json_start != -1 and json_end != -1:
                    json_str = content[json_start:json_end+1]
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Could not parse research response as JSON: {content[:200]}")
                return {
                    "key_facts": [],
                    "perspectives": [],
                    "conflicts": [],
                    "context": content[:500]
                }
            
        except Exception as e:
            logger.error(f"Error researching topic: {e}")
            return {
                "key_facts": [],
                "perspectives": [],
                "conflicts": [],
                "context": ""
            }
    
    async def write_article(
        self,
        topic: str,
        research: Dict,
        target_length: int = 400,
    ) -> Dict:
        """Write a news article based on research."""
        
        key_facts = "\n".join([f"- {fact}" for fact in research.get("key_facts", [])])
        perspectives = "\n".join([f"- {p}" for p in research.get("perspectives", [])])
        
        prompt = f"""Write a professional news article about: {topic}

Key Facts to Include:
{key_facts}

Perspectives to Consider:
{perspectives}

Context:
{research.get('context', '')}

Requirements:
- Length: {target_length} words (aim for {target_length-50} to {target_length+50})
- Style: Professional journalism, AP Style
- Tone: Objective, informative, engaging
- Structure: Strong headline, compelling lead paragraph, body with supporting details
- Include attribution where appropriate

Respond in JSON format:
{{
    "headline": "Compelling headline here",
    "body": "Full article text here...",
    "summary": "2-3 sentence summary"
}}"""

        try:
            messages = [
                {"role": "system", "content": "You are an experienced journalist and editor. Write in AP Style. Be factual and objective. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                temperature=self.temperature or 0.7,
                max_tokens=2000
            )
            
            # Try to extract JSON from the content
            try:
                json_start = content.find('{')
                json_end = content.rfind('}')
                if json_start != -1 and json_end != -1:
                    json_str = content[json_start:json_end+1]
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Could not parse article response as JSON: {content[:200]}")
                return {
                    "headline": f"Error: Could not parse article about {topic}",
                    "body": content,
                    "summary": ""
                }
            
        except Exception as e:
            logger.error(f"Error writing article: {e}")
            return {
                "headline": f"Error: Could not write article about {topic}",
                "body": "An error occurred during article generation.",
                "summary": ""
            }
    
    async def fact_check(self, article_text: str, sources: List[Source]) -> Dict:
        """Fact-check article claims against sources."""
        
        prompt = f"""Fact-check the following news article:

Article:
{article_text}

Available Sources:
{chr(10).join([f"- {s.name}: {s.url}" for s in sources])}

Check for:
1. Factual accuracy
2. Unsupported claims
3. Potential bias
4. Missing context

Respond in JSON format:
{{
    "verified_claims": ["claim 1", ...],
    "needs_verification": ["claim needing more sources", ...],
    "suggested_corrections": ["correction 1", ...],
    "accuracy_score": 0.95  // 0.0 to 1.0
}}"""

        try:
            messages = [
                {"role": "system", "content": "You are a meticulous fact-checker. Verify claims against available evidence. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                max_tokens=1500,
                temperature=0.2
            )
            
            # Try to extract JSON from the content
            try:
                json_start = content.find('{')
                json_end = content.rfind('}')
                if json_start != -1 and json_end != -1:
                    json_str = content[json_start:json_end+1]
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Could not parse fact-check response as JSON: {content[:200]}")
                return {
                    "verified_claims": [],
                    "needs_verification": [],
                    "suggested_corrections": [],
                    "accuracy_score": 0.0
                }
            
        except Exception as e:
            logger.error(f"Error fact-checking: {e}")
            return {
                "verified_claims": [],
                "needs_verification": [],
                "suggested_corrections": [],
                "accuracy_score": 0.0
            }
    
    async def optimize_seo(
        self,
        headline: str,
        body: str,
        keywords: List[str],
    ) -> Dict:
        """Optimize article for SEO."""
        
        prompt = f"""Optimize this article for SEO:

Headline: {headline}

Body (first 200 chars): {body[:200]}...

Keywords: {', '.join(keywords)}

Provide:
1. SEO-optimized meta title (50-60 chars)
2. Meta description (150-160 chars)
3. Suggested URL slug
4. Additional keywords to target

Respond in JSON format:
{{
    "meta_title": "...",
    "meta_description": "...",
    "url_slug": "...",
    "additional_keywords": ["keyword1", "keyword2"]
}}"""

        try:
            messages = [
                {"role": "system", "content": "You are an SEO expert. Create compelling, search-optimized metadata. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                max_tokens=800,
                temperature=0.4
            )
            
            # Try to extract JSON from the content
            try:
                json_start = content.find('{')
                json_end = content.rfind('}')
                if json_start != -1 and json_end != -1:
                    json_str = content[json_start:json_end+1]
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Could not parse SEO response as JSON: {content[:200]}")
                return {
                    "meta_title": headline[:60],
                    "meta_description": body[:160],
                    "url_slug": "",
                    "additional_keywords": []
                }
            
        except Exception as e:
            logger.error(f"Error optimizing SEO: {e}")
            return {
                "meta_title": headline[:60],
                "meta_description": body[:160],
                "url_slug": "",
                "additional_keywords": []
            }
    
    async def edit_for_ap_style(self, draft: Dict, corrections: List[str]) -> Dict:
        """Edit article for AP style compliance."""
        
        corrections_text = "\n".join([f"- {c}" for c in corrections]) if corrections else "None"
        
        prompt = f"""Edit the following article for AP Style compliance:

Original Headline:
{draft.get('headline', '')}

Original Body:
{draft.get('body', '')}

Fact-check corrections to address:
{corrections_text}

AP Style guidelines to follow:
- Use numerals for numbers 10 and above, spell out one through nine
- Use % instead of "percent"
- Use title case for headlines
- Use said, not stated or commented
- Datelines in AP format (CITY (AP) --)
- No Oxford comma
- State abbreviations (not postal codes)
- Titles capitalized only before names
- Dates: Month Day, Year (no "on" before date)
- Times: use a.m./p.m. (lowercase with periods)

Return the edited article in the same format:
{{
    "headline": "...",
    "body": "...",
    "summary": "..."
}}"""

        try:
            messages = [
                {"role": "system", "content": "You are a copy editor specializing in AP Style. Edit articles to meet strict AP Style guidelines. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                max_tokens=self.max_tokens or 2000,
                temperature=0.3
            )
            
            # Try to extract JSON from the content
            try:
                json_start = content.find('{')
                json_end = content.rfind('}')
                if json_start != -1 and json_end != -1:
                    json_str = content[json_start:json_end+1]
                    edited = json.loads(json_str)
                else:
                    edited = json.loads(content)
                
                # Ensure all fields exist
                return {
                    "headline": edited.get("headline", draft.get("headline", "")),
                    "body": edited.get("body", draft.get("body", "")),
                    "summary": edited.get("summary", draft.get("summary", "")),
                }
            except json.JSONDecodeError:
                logger.error(f"Could not parse AP style edit response as JSON: {content[:200]}")
                return draft
            
        except Exception as e:
            logger.error(f"Error editing for AP style: {e}")
            return draft
    
    async def summarize(self, text: str, max_sentences: int = 3) -> str:
        """Create a summary of given text."""
        
        prompt = f"""Summarize the following text in {max_sentences} sentences:

{text[:2000]}  # Limit input length

Summary:"""

        try:
            messages = [
                {"role": "system", "content": "You are a summarization expert. Create concise, accurate summaries."},
                {"role": "user", "content": prompt}
            ]
            
            content = await self._chat_completion(
                messages=messages,
                max_tokens=200,
                temperature=0.3
            )
            
            return content.strip()
            
        except Exception as e:
            logger.error(f"Error summarizing: {e}")
            return text[:200] + "..." if len(text) > 200 else text
