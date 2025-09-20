# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException
import uuid

# Use the centralized Supabase client and schemas
from app.db import supabase
from app.models.schemas import DashboardStats
from app.services.auth import get_current_user, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    """
    Get dashboard statistics for the current user in a single, efficient query.
    NOTE: This requires a SQL function named 'get_user_dashboard_stats' in your Supabase DB.
    """
    result = supabase.rpc(
        "get_user_dashboard_stats",
        {"user_id_param": str(current_user.id)}
    ).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats.")
        
    return DashboardStats(**result.data)