# backend/app/main.py

"""
TruthGuard AI Backend
Main FastAPI application for handling claims, authentication, and coordination
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Import the centralized Supabase client
from app.db import supabase

# Import routers
from app.routers import claims, users, comments, rti, dashboard

# Initialize FastAPI app
app = FastAPI(
    title="TruthGuard AI Backend",
    description="Backend API for TruthGuard AI fact-checking platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js frontend (3000/3001)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(claims.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(rti.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "TruthGuard AI Backend is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/v1/health")
async def health_check():
    """Detailed health check"""
    ai_healthy = False
    db_healthy = False

    try:
        # Check AI service
        ai_service_url = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
        async with httpx.AsyncClient() as client:
            ai_response = await client.get(f"{ai_service_url}/health", timeout=5)
            ai_healthy = ai_response.status_code == 200
    except httpx.RequestError:
        ai_healthy = False

    try:
        # Check database connection (uses the imported supabase client)
        result = supabase.table("user_profiles").select("id", count="exact", head=True).limit(1).execute()
        db_healthy = True
    except Exception:
        db_healthy = False
    
    status = "healthy" if ai_healthy and db_healthy else "degraded"
    
    return {
        "status": status,
        "services": {
            "ai_service": "healthy" if ai_healthy else "unhealthy",
            "database": "healthy" if db_healthy else "unhealthy"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)