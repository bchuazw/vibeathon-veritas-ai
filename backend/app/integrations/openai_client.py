# app/integrations/openai_client.py
import json
import logging
from typing import Dict, List, Optional

import httpx
from openai import AsyncOpenAI

from app.config import get_settings
from app.models.article import Article, Source

logger = logging.getLogger(__name__)


class OpenAIClient:
    """Client for OpenAI API integration."""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        self.model = self.settings.openai_model
        self.max_tokens = self.settings.openai_max_tokens
        self.temperature = self.settings.openai_temperature
    
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
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a thorough news researcher. Provide factual, well-sourced information."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.3,  # Lower temperature for factual content
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
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
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an experienced journalist and editor. Write in AP Style. Be factual and objective."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
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
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a meticulous fact-checker. Verify claims against available evidence."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
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
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an SEO expert. Create compelling, search-optimized metadata."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Error optimizing SEO: {e}")
            return {
                "meta_title": headline[:60],
                "meta_description": body[:160],
                "url_slug": "",
                "additional_keywords": []
            }
