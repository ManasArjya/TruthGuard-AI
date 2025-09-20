# backend/app/routers/claims.py

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Form
from typing import List, Optional
import uuid

# Use the centralized Supabase client and schemas
from app.db import supabase
from app.models.schemas import (
    ClaimResponse, ClaimDetail, ClaimAnalysis, SearchResult, 
    ContentType, ClaimStatus
)
from app.services.auth import get_current_user, User
from app.services.claim_processor import process_claim_async

router = APIRouter(prefix="/claims", tags=["claims"])
STORAGE_BUCKET_NAME = "claim_files"

# The /submit endpoint is already correct from the previous fix
@router.post("/submit", response_model=ClaimResponse)
async def submit_claim(
    background_tasks: BackgroundTasks,
    content: str = Form(...),
    content_type: ContentType = Form(...),
    original_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    storage_file_path = None
    if file:
        try:
            content_bytes = await file.read()
            file_extension = file.filename.split(".")[-1]
            unique_filename = f"{current_user.id}/{uuid.uuid4()}.{file_extension}"
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload(
                path=unique_filename, file=content_bytes, file_options={"content-type": file.content_type}
            )
            storage_file_path = unique_filename
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    claim_data = {
        "user_id": str(current_user.id), "content": content, "content_type": content_type.value,
        "original_url": original_url, "file_path": storage_file_path, "status": ClaimStatus.PENDING.value
    }
    
    result = supabase.table("claims").insert(claim_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create claim record in database.")
        
    claim = result.data[0]
    
    background_tasks.add_task(process_claim_async, claim["id"])
    
    return ClaimResponse(**claim)


@router.get("/{claim_id}", response_model=ClaimDetail)
async def get_claim(claim_id: uuid.UUID):
    """Get claim details with analysis and comment count in a single query"""
    result = supabase.table("claims").select(
        "*, claim_analyses(*), claim_comments(count)"
    ).eq("id", str(claim_id)).single().execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")
        
    claim_data = result.data
    
    # --- THIS IS THE CORRECTED SECTION ---
    analysis_data_list = claim_data.get("claim_analyses")
    analysis = None
    # Check if the list exists and is not empty before accessing the first element
    if analysis_data_list:
        analysis = ClaimAnalysis(**analysis_data_list[0])
    # --- END OF CORRECTION ---

    comment_count = claim_data.get("claim_comments", [{}])[0].get("count", 0)

    return ClaimDetail(
        claim=ClaimResponse(**claim_data),
        analysis=analysis,
        comment_count=comment_count
    )


@router.get("/", response_model=SearchResult)
async def search_claims(
    q: Optional[str] = None,
    status: Optional[ClaimStatus] = None,
    page: int = 1,
    per_page: int = 20
):
    """Search and filter claims with optimized single-query fetching"""
    offset = (page - 1) * per_page
    query = supabase.table("claims").select(
        "*, claim_analyses(*), claim_comments(count)",
        count="exact"
    )
    
    if q:
        query = query.ilike("content", f"%{q}%")
    
    if status:
        query = query.eq("status", status.value)
    
    result = query.order("created_at", desc=True).range(offset, offset + per_page - 1).execute()
    
    claim_details = []
    for item in result.data:
        # --- THIS IS THE CORRECTED SECTION ---
        analysis_data_list = item.get("claim_analyses")
        analysis = None
        if analysis_data_list:
            analysis = ClaimAnalysis(**analysis_data_list[0])
        # --- END OF CORRECTION ---

        comment_count = item.get("claim_comments", [{}])[0].get("count", 0)
        
        claim_details.append(ClaimDetail(
            claim=ClaimResponse(**item),
            analysis=analysis,
            comment_count=comment_count
        ))
    
    return SearchResult(
        claims=claim_details,
        total_count=result.count or 0,
        page=page,
        per_page=per_page
    )

@router.get("/{claim_id}/status")
async def get_claim_status(claim_id: uuid.UUID):
    """Get current processing status of a claim"""
    try:
        result = supabase.table("claims").select("status").eq("id", str(claim_id)).single().execute()
        return {"status": result.data["status"]}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found"
        )