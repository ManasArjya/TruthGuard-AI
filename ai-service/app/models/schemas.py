# ai-service/app/models/schemas.py

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AnalysisRequest(BaseModel):
    claim_id: str
    content: str
    content_type: str  # 'text', 'url', 'image', 'video'
    file_url: Optional[str] = None # Changed from file_path

class EvidenceItem(BaseModel):
    source: str
    excerpt: str
    credibility_score: Optional[float]
    url: Optional[str]

class AnalysisResponse(BaseModel):
    verdict: str
    confidence_score: float
    summary: str
    evidence: List[EvidenceItem]
    sources: List[Dict[str, Any]]
    reasoning: str

class OCRRequest(BaseModel):
    image_url: str # Changed from image_path

class TranscriptionRequest(BaseModel):
    video_url: str # Changed from video_path

class RAGRequest(BaseModel):
    query: str
    top_k: int = 5