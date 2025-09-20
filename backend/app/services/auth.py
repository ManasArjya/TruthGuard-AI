"""
Authentication service for TruthGuard AI
Handles JWT token verification and user authentication with Supabase
"""

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
import os
from typing import Optional, Dict, Any
from pydantic import BaseModel

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

security = HTTPBearer()

class User(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_expert: bool = False
    expert_domain: Optional[str] = None

async def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token from Supabase
    """
    try:
        # For Supabase tokens, we can verify using their built-in method
        user = supabase.auth.get_user(token)
        if user and user.user:
            return {
                "id": user.user.id,
                "email": user.user.email,
                "user_metadata": user.user.user_metadata or {}
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user from token in a single call"""
    token = credentials.credentials
    user_data = await verify_token(token) # verify_token already fetches user_metadata

    metadata = user_data.get("user_metadata", {})

    return User(
        id=user_data["id"],
        email=user_data["email"],
        full_name=metadata.get("full_name"),
        is_expert=metadata.get("is_expert", False),
        expert_domain=metadata.get("expert_domain")
    )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None