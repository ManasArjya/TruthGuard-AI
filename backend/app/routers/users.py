# backend/app/routers/users.py

from fastapi import APIRouter, Depends, HTTPException, status
import uuid

# Use the centralized Supabase client and schemas
from app.db import supabase
from app.models.schemas import UserProfile, UserProfileUpdate
from app.services.auth import get_current_user, User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get or create the current user's profile."""
    result = supabase.table("user_profiles").select("*").eq("id", str(current_user.id)).maybe_single().execute()
    
    if not result.data:
        # Create profile if it doesn't exist
        profile_data = {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name, # Comes from JWT
        }
        insert_result = supabase.table("user_profiles").insert(profile_data).select("*").single().execute()
        if not insert_result.data:
            raise HTTPException(status_code=500, detail="Could not create user profile.")
        return UserProfile(**insert_result.data)
    
    return UserProfile(**result.data)

@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile using a Pydantic model."""
    update_data = profile_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    
    result = supabase.table("user_profiles").update(update_data).eq("id", str(current_user.id)).select("*").single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found.")
    
    return UserProfile(**result.data)