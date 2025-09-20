# ai-service/app/services/claim_classifier.py

from bs4 import BeautifulSoup
import httpx
import asyncio
import os
from typing import List, Dict, Any, Optional
import logging
import json
import re

logger = logging.getLogger(__name__)

class ClaimClassifier:
    """Service for analyzing and classifying fact-checking claims."""
    
    # The __init__ method should be first for clarity.
    def __init__(self):
        """Initialize claim classifier, loading credentials from environment."""
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.model_name = os.getenv("MODEL_NAME", "openai/gpt-4o")
        # Key for Serper.dev live web search integration
        self.serper_api_key = os.getenv("SERPER_API_KEY")


    # This is the main public method of the class.
    async def analyze_claim(self, claim_text: str, retrieved_context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Orchestrates the full analysis of a claim, performing a live web search if needed.
        """
        try:
            final_context = retrieved_context

            # Check if the context from the internal DB is sufficient.
            if self._is_context_weak(retrieved_context):
                logger.info(f"Internal context is weak for claim '{claim_text}'. Performing live web search...")
                web_context = await self._perform_live_web_search(claim_text)
                # Combine internal and web results.
                final_context = retrieved_context + web_context

            context_text = self._prepare_context(final_context)
            analysis_result = await self._call_llm_for_analysis(claim_text, context_text)
            
            evidence = self._extract_evidence(final_context)
            sources = self._prepare_sources(final_context)
            
            # Combine all parts into the final response
            final_result = analysis_result.copy()
            final_result["evidence"] = evidence
            final_result["sources"] = sources
            return final_result
            
        except Exception as e:
            logger.error(f"Claim analysis pipeline failed: {str(e)}", exc_info=True)
            return self._get_fallback_analysis()

    # --- All helper methods below are correctly indented to be part of the class ---

    def _is_context_weak(self, context: List[Dict[str, Any]]) -> bool:
        """Checks if the retrieved context is sufficient."""
        if not context or len(context) < 2:
            return True
        
        scores = [article.get('similarity', 0) for article in context]
        average_similarity = sum(scores) / len(scores) if scores else 0
        
        return average_similarity < 0.75

    async def _perform_live_web_search(self, claim_text: str) -> List[Dict[str, Any]]:
        """Performs a real web search using Serper API and scrapes the content."""
        if not self.serper_api_key:
            logger.warning("SERPER_API_KEY not found. Skipping live web search.")
            return []

        search_headers = {'X-API-KEY': self.serper_api_key, 'Content-Type': 'application/json'}
        search_payload = json.dumps({"q": claim_text})
        
        try:
            async with httpx.AsyncClient() as client:
                search_response = await client.post("https://google.serper.dev/search", headers=search_headers, content=search_payload, timeout=10.0)
                search_response.raise_for_status()
                search_results = search_response.json().get("organic", [])

                scrape_tasks = [self._scrape_url(client, result) for result in search_results[:3] if 'link' in result]
                scraped_pages = await asyncio.gather(*scrape_tasks)
                
                return [page for page in scraped_pages if page]
        except Exception as e:
            logger.error(f"Live web search failed: {e}")
            return []

    async def _scrape_url(self, client: httpx.AsyncClient, search_result: Dict) -> Optional[Dict[str, Any]]:
        """Helper to scrape content from a single URL."""
        url = search_result.get("link")
        title = search_result.get("title", "Unknown Source")
        try:
            scrape_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = await client.get(url, headers=scrape_headers, follow_redirects=True, timeout=15.0)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'lxml')
            for tag in soup(['script', 'style', 'header', 'footer', 'nav', 'aside']):
                tag.decompose()
            body_text = soup.get_text(separator='\n', strip=True)
            
            return {
                "title": title, "content": body_text, "source_url": url,
                "source_type": "web_search", "verified": False
            }
        except Exception as e:
            logger.warning(f"Failed to scrape URL {url}: {e}")
            return None

    def _prepare_context(self, retrieved_articles: List[Dict[str, Any]]) -> str:
        # ... (This method and others below are the same as before, just correctly indented)
        if not retrieved_articles:
            return "No relevant context was found."
        context_parts = []
        for i, article in enumerate(retrieved_articles[:5], 1):
            content_snippet = article.get('content', '')[:500]
            context_parts.append(
                f"Source {i} (Similarity: {article.get('similarity', 0):.3f}):\n"
                f"Title: {article.get('title', 'N/A')}\n"
                f"Content Snippet: {content_snippet}...\n"
            )
        return "\n---\n".join(context_parts)
    
    async def _call_llm_for_analysis(self, claim: str, context: str) -> Dict[str, Any]:
        if self.openrouter_api_key:
            return await self._real_llm_analysis(claim, context)
        else:
            logger.warning("OPENROUTER_API_KEY not set. Using simulated LLM analysis.")
            return await self._simulate_llm_analysis(claim)
    
    async def _real_llm_analysis(self, claim: str, context: str) -> Dict[str, Any]:
        try:
            prompt = self._build_analysis_prompt(claim, context)
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.openrouter_api_key}"},
                    json={
                        "model": self.model_name,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.2,
                        "max_tokens": 1500
                    },
                    timeout=90.0
                )
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return self._parse_llm_response(content)
        except Exception as e:
            logger.error(f"Real LLM analysis failed, falling back to simulation: {str(e)}")
            return await self._simulate_llm_analysis(claim)
    
    async def _simulate_llm_analysis(self, claim: str) -> Dict[str, Any]:
        await asyncio.sleep(1)
        return {
            "verdict": "uncertain", "confidence_score": 0.55,
            "summary": "This is a simulated analysis as the LLM API key is missing.",
            "reasoning": "This response was generated by the simulation as a fallback."
        }
    
    def _build_analysis_prompt(self, claim: str, context: str) -> str:
        return f"""
You are an expert, unbiased fact-checker. Your task is to analyze the provided claim based ONLY on the given context from various sources.

**Claim:**
"{claim}"

**Context from Retrieved Sources:**
---
{context}
---

**Your Task:**
Respond with a JSON object that strictly follows this structure:
{{
    "verdict": "true" | "false" | "misleading" | "uncertain",
    "confidence_score": <a float between 0.0 and 1.0>,
    "summary": "<A brief, one-sentence explanation of your verdict.>",
    "reasoning": "<A detailed, neutral reasoning for your verdict based on the context. Cite the sources (e.g., 'Source 1') you used from the context.>"
}}
"""
    
    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        try:
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            return json.loads(response_text)
        except (json.JSONDecodeError, AttributeError):
            logger.error("Failed to parse LLM JSON response.")
            return {
                "verdict": "uncertain", "confidence_score": 0.3,
                "summary": "AI analysis completed but the response format was invalid.",
                "reasoning": "Could not parse the structured response from the AI model."
            }

    def _extract_evidence(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        evidence = []
        for article in articles[:3]:
            evidence.append({
                "source": article.get('title', 'Unknown Source'),
                "excerpt": article.get('content', '')[:250] + "...",
                "url": article.get('source_url'),
                "credibility_score": article.get('similarity', 0.0)
            })
        return evidence
    
    def _prepare_sources(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            {
                "title": article.get('title', 'Unknown Source'),
                "url": article.get('source_url'),
                "type": article.get('source_type', 'generic'),
                "verified": article.get('verified', False)
            } for article in articles
        ]
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        return {
            "verdict": "uncertain", "confidence_score": 0.1,
            "summary": "An internal error occurred during analysis.",
            "reasoning": "The AI service was unable to complete the analysis due to a technical issue.",
            "evidence": [],
            "sources": []
        }