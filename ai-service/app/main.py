# ai-service/app/main.py

"""
TruthGuard AI Service
AI microservice for content analysis, OCR, transcription, and fact-checking
"""

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

# Load environment variables first
load_dotenv()

# 1. Models are now imported from a central schemas file
from app.models.schemas import (
    AnalysisRequest, AnalysisResponse, OCRRequest,
    TranscriptionRequest, RAGRequest
)

# Import services
from app.services.content_extraction import OCRService, TranscriptionService
from app.services.rag_system import RAGSystem
from app.services.claim_classifier import ClaimClassifier


# Initialize FastAPI app
app = FastAPI(
    title="TruthGuard AI Service",
    description="AI microservice for content analysis and fact-checking",
    version="1.0.0"
)

# 2. A dictionary to hold the services once they are loaded on startup
services = {}

@app.on_event("startup")
async def startup_event():
    """Load heavy AI models when the application starts."""
    print("AI Service: Loading AI models...")
    services["ocr"] = OCRService()
    services["transcription"] = TranscriptionService()
    services["rag"] = RAGSystem()
    services["classifier"] = ClaimClassifier()
    print("AI Service: Models loaded successfully.")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "TruthGuard AI Service is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check to confirm models are loaded"""
    return {
        "status": "healthy",
        "services": {
            "ocr": "loaded" if "ocr" in services else "unavailable",
            "transcription": "loaded" if "transcription" in services else "unavailable",
            "rag": "loaded" if "rag" in services else "unavailable",
            "classifier": "loaded" if "classifier" in services else "unavailable"
        }
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_claim(request: AnalysisRequest):
    """Main analysis endpoint - processes claims through the full AI pipeline"""
    try:
        content = request.content
        
        # 3. CRITICAL CHANGE: Use file_url instead of file_path
        if request.content_type == "image" and request.file_url:
            extracted_text = await services["ocr"].extract_text(request.file_url)
            content = f"{content}\n\nExtracted text from image: {extracted_text}"
            
        elif request.content_type == "video" and request.file_url:
            transcription = await services["transcription"].transcribe(request.file_url)
            content = f"{content}\n\nTranscription from video: {transcription}"
        
        # Step 2: Retrieve relevant information using RAG
        relevant_articles = await services["rag"].search_similar(content)
        
        # Step 3: Classify and analyze the claim
        analysis_result = await services["classifier"].analyze_claim(
            claim_text=content,
            retrieved_context=relevant_articles
        )
        
        return AnalysisResponse(**analysis_result)
        
    except Exception as e:
        print(f"ERROR in /analyze: {e}") 
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

class AddArticleRequest(BaseModel):
    title: str
    content: str
    source_url: Optional[str] = None
    source_type: str = "fact-check"
    verified: bool = True

@app.post("/add-article")
async def add_knowledge_base_article(request: AddArticleRequest):
    """Adds a new article to the RAG system's knowledge base."""
    try:
        success = await services["rag"].add_article(request.model_dump())
        if not success:
            # Let FastAPI propagate a clear error instead of swallowing it later
            raise HTTPException(status_code=500, detail="Failed to add article to knowledge base.")
        return {"status": "success", "message": "Article added to knowledge base."}
    except HTTPException as he:
        # Preserve original HTTPException details (avoids empty detail)
        raise he
    except Exception as e:
        # Include the actual error message for easier debugging
        raise HTTPException(status_code=500, detail=f"Add article failed: {e}")
@app.post("/ocr")
async def extract_text_from_image(request: OCRRequest):
    """Extract text from image using a public URL"""
    try:
        text = await services["ocr"].extract_text(request.image_url)
        return {"extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@app.post("/transcribe")
async def transcribe_video(request: TranscriptionRequest):
    """Transcribe audio from a video file using a public URL"""
    try:
        transcription = await services["transcription"].transcribe(request.video_url)
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/search")
async def search_knowledge_base(request: RAGRequest):
    """Search knowledge base for similar content"""
    try:
        results = await services["rag"].search_similar(request.query, request.top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
    
if __name__ == "__main__":
    import uvicorn
    # Use the app string for Uvicorn to allow for startup events
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
    