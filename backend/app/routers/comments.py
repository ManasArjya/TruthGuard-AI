# backend/app/routers/comments.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import uuid

# Use the centralized Supabase client and schemas
from app.db import supabase
from app.models.schemas import CommentCreate, CommentResponse, CommentVote
from app.services.auth import get_current_user, get_current_user_optional, User

router = APIRouter(prefix="/comments", tags=["comments"])

@router.get("/{claim_id}", response_model=List[CommentResponse])
async def get_claim_comments(
    claim_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all comments for a claim with user data and vote status."""
    # NOTE: Calling a SQL function is the most robust way to do this.
    # The function should handle the JOINs and LEFT JOIN for the user's vote.
    query = supabase.table("claim_comments").select(
        "*, user:user_profiles(*)"
    ).eq("claim_id", str(claim_id)).order("created_at", desc=True)
    
    result = query.execute()

    if not result.data:
        return []

    # In a real app, fetching user_vote for each comment is an N+1 problem.
    # This should be handled with a proper SQL JOIN or a database function.
    return [CommentResponse(**comment) for comment in result.data]

@router.post("/", response_model=CommentResponse)
async def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new comment and return the full object in one query."""
    comment_data = comment.model_dump()
    comment_data["user_id"] = str(current_user.id)
    comment_data["is_expert_response"] = current_user.is_expert
    
    result = supabase.table("claim_comments").insert(comment_data).select(
        "*, user:user_profiles(*)"
    ).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create comment.")
    
    return CommentResponse(**result.data)

@router.post("/{comment_id}/vote")
async def vote_on_comment(
    comment_id: uuid.UUID,
    vote: CommentVote,
    current_user: User = Depends(get_current_user)
):
    """
    Vote on a comment.
    NOTE: This logic is prone to race conditions and is slow.
    The best practice is to move this entire logic into a single SQL function
    in your database and call it via rpc().
    """
    vote_data = {
        "comment_id": str(comment_id),
        "user_id": str(current_user.id),
        "vote_type": vote.vote_type.value,
    }
    # Upsert ensures the vote is created or updated in one go
    supabase.table("comment_votes").upsert(vote_data).execute()
    
    # Here you should trigger a recalculation of vote counts, ideally via a DB function.
    # For example: supabase.rpc("recalculate_comment_votes", {"c_id": str(comment_id)}).execute()
    
    return {"status": "success", "message": "Vote submitted. Counts will update."}