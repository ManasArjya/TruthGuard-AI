# backend/app/services/claim_processor.py

import os
import httpx
from uuid import UUID

# Use the centralized Supabase client
from app.db import supabase
from app.models.schemas import ClaimStatus, ContentType, AIAnalysisRequest
import logging

logger = logging.getLogger(__name__)

async def add_analysis_to_knowledge_base(claim: dict, analysis: dict):
    """Formats an analysis and sends it to the AI service to be learned."""
    try:
        ai_service_url = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
        
        # Format the analysis into a new "article" for the knowledge base
        new_article = {
            "title": f"Fact-Check for claim: '{claim['content'][:50]}...'",
            "content": analysis["summary"] + "\n\nReasoning: " + analysis["ai_reasoning"],
            "source_url": f"http://localhost:3000/claims/{claim['id']}", # Link back to the claim
            "source_type": "fact-check",
            "verified": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{ai_service_url}/add-article", json=new_article)
            response.raise_for_status()
            logger.info(f"Successfully added analysis for claim {claim['id']} to knowledge base.")

    except Exception as e:
        logger.error(f"Could not add analysis for claim {claim['id']} to knowledge base: {e}")


async def process_claim_async(claim_id: UUID):
    """
    Asynchronously process a claim and add the result to the knowledge base.
    """
    claim_id_str = str(claim_id)
    try:
        supabase.table("claims").update(
            {"status": ClaimStatus.PROCESSING.value}
        ).eq("id", claim_id_str).execute()
        
        claim_result = supabase.table("claims").select("*").eq("id", claim_id_str).single().execute()
        
        if not claim_result.data:
            logger.error(f"Claim {claim_id_str} not found after marking as processing.")
            return
        
        claim = claim_result.data
        
        file_url = None
        if claim.get("file_path"):
            file_url = supabase.storage.from_("claim_files").get_public_url(claim["file_path"])

        ai_request = AIAnalysisRequest(
            claim_id=claim_id_str,
            content=claim["content"],
            content_type=ContentType(claim["content_type"]),
            file_url=file_url
        )
        
        ai_service_url = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{ai_service_url}/analyze",
                json=ai_request.model_dump(mode='json')
            )
            response.raise_for_status()
            ai_result = response.json()
        
        analysis_data = {
            "claim_id": claim_id_str,
            "verdict": ai_result["verdict"],
            "confidence_score": ai_result["confidence_score"],
            "summary": ai_result["summary"],
            "evidence": ai_result["evidence"],
            "sources": ai_result["sources"],
            "ai_reasoning": ai_result["reasoning"]
        }
        
        supabase.table("claim_analyses").insert(analysis_data).execute()
        
        supabase.table("claims").update(
            {"status": ClaimStatus.COMPLETED.value}
        ).eq("id", claim_id_str).execute()
        
        logger.info(f"Successfully processed claim {claim_id_str}")
        
        # --- NEW STEP: ADD RESULT TO KNOWLEDGE BASE ---
        # After successfully processing, add the result back for future reference.
        await add_analysis_to_knowledge_base(claim, analysis_data)
        
    except Exception as e:
        logger.error(f"Error processing claim {claim_id_str}: {e}", exc_info=True)
        try:
            supabase.table("claims").update(
                {"status": ClaimStatus.FAILED.value}
            ).eq("id", claim_id_str).execute()
        except Exception as db_e:
            logger.error(f"Could not even update claim {claim_id_str} to FAILED status: {db_e}")