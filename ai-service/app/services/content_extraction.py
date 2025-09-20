# ai-service/app/services/content_extraction.py

"""
Content extraction services for TruthGuard AI
Handles OCR and transcription tasks by downloading files from URLs
"""

import easyocr
import cv2
# Import VideoFileClip from moviepy.video.io to avoid editor subpackage issues
from moviepy.video.io.VideoFileClip import VideoFileClip
import os
import tempfile
import asyncio
import logging
import httpx # Required for downloading files

logger = logging.getLogger(__name__)

class OCRService:
    """Service for extracting text from images using EasyOCR"""
    
    def __init__(self):
        """Initialize OCR reader with English support"""
        self.reader = easyocr.Reader(['en'], gpu=False) # Use gpu=True if you have a compatible GPU
    
    async def extract_text(self, image_url: str) -> str:
        """
        Downloads an image from a URL and extracts text from it.
        
        Args:
            image_url: Publicly accessible URL of the image file.
            
        Returns:
            Extracted text as a string.
        """
        try:
            # 1. Download the image from the URL
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url, follow_redirects=True, timeout=30.0)
                response.raise_for_status() # Raises an exception for 4xx/5xx errors
            
            # 2. Save to a temporary file to be processed
            with tempfile.NamedTemporaryFile(delete=True, suffix=".jpg") as temp_file:
                temp_file.write(response.content)
                
                # 3. Run the blocking OCR process in a separate thread
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(
                    None, 
                    self._extract_text_sync, 
                    temp_file.name
                )
        except Exception as e:
            logger.error(f"OCR failed for URL {image_url}: {str(e)}")
            return ""
    
    def _extract_text_sync(self, image_path: str) -> str:
        """Synchronous OCR extraction"""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        results = self.reader.readtext(image)
        
        extracted_text = [text for (bbox, text, confidence) in results if confidence > 0.4]
        return " ".join(extracted_text)

class TranscriptionService:
    """Service for transcribing audio from video files"""
    
    def __init__(self):
        """Initialize transcription service (e.g., Whisper)"""
        # For a real implementation, you would load a model like Whisper here
        pass
    
    async def transcribe(self, video_url: str) -> str:
        """
        Downloads a video from a URL, extracts audio, and transcribes it.
        
        Args:
            video_url: Publicly accessible URL of the video file.
            
        Returns:
            Transcribed text as a string.
        """
        temp_video_path = None
        temp_audio_path = None
        try:
            # 1. Download the video from the URL
            async with httpx.AsyncClient() as client:
                response = await client.get(video_url, follow_redirects=True, timeout=120.0)
                response.raise_for_status()

            # 2. Save to a temporary video file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
                temp_video.write(response.content)
                temp_video_path = temp_video.name

            # 3. Extract audio from the temporary video file
            temp_audio_path = await self._extract_audio(temp_video_path)
            
            # 4. Transcribe the audio
            return await self._transcribe_audio(temp_audio_path)
            
        except Exception as e:
            logger.error(f"Transcription failed for URL {video_url}: {str(e)}")
            return ""
        finally:
            # 5. Clean up temporary files
            if temp_video_path and os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
    
    async def _extract_audio(self, video_path: str) -> str:
        """Extracts audio from a local video file to a temporary audio file"""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio_path = temp_audio.name

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            self._extract_audio_sync,
            video_path,
            temp_audio_path
        )
        return temp_audio_path
    
    def _extract_audio_sync(self, video_path: str, audio_path: str):
        """Synchronous audio extraction using moviepy"""
        with VideoFileClip(video_path) as video:
            if video.audio is not None:
                video.audio.write_audiofile(audio_path, verbose=False, logger=None)
    
    async def _transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribes an audio file to text.
        
        This is where you would integrate a real transcription model like Whisper.
        The current implementation is a simulation for demo purposes.
        """
        if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
            return "No audio was found in the video."
            
        await asyncio.sleep(1) # Simulate processing time
        
        import hashlib
        simulated_transcriptions = [
            "This is a simulated transcription. The speaker discusses current events.",
            "In this video, claims are made about government policies and their impact.",
            "The video contains commentary on social media trends and public opinion.",
        ]
        hash_object = hashlib.md5(audio_path.encode())
        index = int(hash_object.hexdigest(), 16) % len(simulated_transcriptions)
        return simulated_transcriptions[index]