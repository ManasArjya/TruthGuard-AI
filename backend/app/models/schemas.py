# backend/app/models/schemas.py

"""
Pydantic models for TruthGuard AI Backend
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class ContentType(str, Enum):
    TEXT = "text"
    URL = "url"
    IMAGE = "image"
    VIDEO = "video"

class ClaimStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Verdict(str, Enum):
    TRUE = "true"
    FALSE = "false"
    MISLEADING = "misleading"
    UNCERTAIN = "uncertain"

class VoteType(str, Enum):
    UP = "up"
    DOWN = "down"

class RTIStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    RESPONDED = "responded"
    CLOSED = "closed"

# Request Models
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    claim_id: uuid.UUID
    parent_comment_id: Optional[uuid.UUID] = None

class CommentVote(BaseModel):
    vote_type: VoteType

class RTIRequestCreate(BaseModel):
    claim_id: uuid.UUID
    reason: str

# Response Models
class UserProfile(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    is_expert: bool = False
    expert_domain: Optional[str]
    created_at: datetime

class ClaimResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    content: str
    content_type: ContentType
    original_url: Optional[str]
    file_path: Optional[str]
    status: ClaimStatus
    created_at: datetime
    updated_at: datetime

class EvidenceItem(BaseModel):
    source: str
    excerpt: str
    credibility_score: Optional[float]
    url: Optional[str]

class ClaimAnalysis(BaseModel):
    id: uuid.UUID
    claim_id: uuid.UUID
    verdict: Verdict
    confidence_score: float
    summary: str
    evidence: List[EvidenceItem]
    sources: List[Dict[str, Any]]
    ai_reasoning: str
    created_at: datetime

class ClaimDetail(BaseModel):
    claim: ClaimResponse
    analysis: Optional[ClaimAnalysis]
    comment_count: int

class CommentResponse(BaseModel):
    id: uuid.UUID
    claim_id: uuid.UUID
    user_id: uuid.UUID
    user: UserProfile
    content: str
    upvotes: int
    downvotes: int
    is_expert_response: bool
    parent_comment_id: Optional[uuid.UUID]
    replies: Optional[List['CommentResponse']] = []
    user_vote: Optional[VoteType] = None
    created_at: datetime
    updated_at: datetime

class RTIRequest(BaseModel):
    id: uuid.UUID
    claim_id: uuid.UUID
    user_id: uuid.UUID
    reason: str
    status: RTIStatus
    created_at: datetime
    updated_at: datetime

class DashboardStats(BaseModel):
    total_claims: int
    pending_claims: int
    completed_claims: int
    rti_requests: int
    recent_claims: List[ClaimResponse]

class SearchResult(BaseModel):
    claims: List[ClaimDetail]
    total_count: int
    page: int
    per_page: int

# --- ADD THE FOLLOWING MODELS ---

# AI Service Models (for communication between backend and ai-service)
class AIAnalysisRequest(BaseModel):
    claim_id: str
    content: str
    content_type: ContentType
    file_url: Optional[str] = None # Using URL instead of path

# Update forward references
CommentResponse.model_rebuild()