# backend/app/routers/rti.py

from fastapi import APIRouter, Depends, HTTPException
import uuid

# Use the centralized Supabase client and schemas
from app.db import supabase
from app.models.schemas import RTIRequestCreate, RTIRequest
from app.services.auth import get_current_user, User

router = APIRouter(prefix="/rti", tags=["rti"])

@router.post("/", response_model=RTIRequest)
async def create_rti_request(
    rti_request: RTIRequestCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new RTI request for a claim."""
    request_data = {
        "claim_id": str(rti_request.claim_id),
        "user_id": str(current_user.id),
        "reason": rti_request.reason,
        "status": "draft"  # Default status
    }
    
    result = supabase.table("rti_requests").insert(request_data).select("*").single().execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create RTI request.")
        
    return RTIRequest(**result.data)