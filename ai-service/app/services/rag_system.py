# ai-service/app/services/rag_system.py

"""
RAG (Retrieval-Augmented Generation) system for TruthGuard AI
Handles similarity search against a persistent vector database (pgvector)
"""

import numpy as np
from typing import List, Dict, Any
import asyncio
import logging
import os
from supabase import create_client, Client

try:
    from sentence_transformers import SentenceTransformer
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    logging.warning("Sentence transformers not available. RAG system will not function.")

logger = logging.getLogger(__name__)

class RAGSystem:
    """RAG system for retrieving relevant information from a persistent knowledge base"""
    
    def __init__(self):
        """Initialize RAG system with a sentence transformer model"""
        if not EMBEDDINGS_AVAILABLE:
            self.embeddings_enabled = False
            self.embedding_model = None
            logger.error("RAG System disabled: sentence-transformers library not found.")
            return

        try:
            # Load the model name from an environment variable
            model_name = os.getenv("EMBEDDING_MODEL", 'sentence-transformers/all-mpnet-base-v2')
            self.embedding_model = SentenceTransformer(model_name)
            self.embeddings_enabled = True
            
            # Initialize a Supabase client to interact with the vector database
            supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            if not supabase_url or not supabase_key:
                raise ValueError("Supabase credentials not found for RAG system.")
            self.supabase: Client = create_client(supabase_url, supabase_key)

        except Exception as e:
            logger.error(f"Failed to initialize RAGSystem: {e}")
            self.embeddings_enabled = False
    
    async def search_similar(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Encodes a query and searches for similar articles in the vector database.
        
        Args:
            query: Query text to search for.
            top_k: Number of top results to return.
            
        Returns:
            A list of similar articles with their similarity scores.
        """
        if not self.embeddings_enabled:
            logger.warning("Search failed: Embeddings are not enabled.")
            return []

        try:
            # Generate embedding for the query
            loop = asyncio.get_event_loop()
            query_embedding = await loop.run_in_executor(
                None,
                self.embedding_model.encode,
                query
            )
            
            # Call the database function to find matching articles
            result = self.supabase.rpc('match_articles', {
                'query_embedding': query_embedding.tolist(),
                'match_threshold': 0.7,  # Adjust this threshold as needed
                'match_count': top_k
            }).execute()

            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Vector search failed: {str(e)}")
            return []
    
    async def add_article(self, article: Dict[str, Any]) -> bool:
        """
        Adds a new article to the knowledge base, calculating its embedding.
        
        Args:
            article: Dictionary with title, content, etc.
            
        Returns:
            True if successful, False otherwise.
        """
        if not self.embeddings_enabled:
            logger.warning("Could not add article: Embeddings are not enabled.")
            return False

        try:
            # Combine title and content for a richer embedding
            text_to_embed = f"{article['title']} {article['content']}"
            
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                None,
                self.embedding_model.encode,
                text_to_embed
            )
            
            # Prepare data for insertion into the database
            db_record = {
                'title': article['title'],
                'content': article['content'],
                'source_url': article.get('source_url'),
                'source_type': article.get('source_type'),
                'verified': article.get('verified', False),
                'embedding': embedding.tolist()
            }
            
            self.supabase.table('knowledge_base').insert(db_record).execute()
            
            logger.info(f"Successfully added and indexed article: {article['title']}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add article to knowledge base: {str(e)}")
            return False
