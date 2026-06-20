import os
import json
import hashlib
from typing import List, Dict, Any

class AdvancedVectorStore:
    """
    RAG Continuous Context Store for Omega Pipeline.
    In a real production environment, this integrates with ChromaDB or Pinecone.
    For local development and the Omega Pipeline, we use an in-memory chunked retrieval
    to feed exactly the right context to the FIM generation step.
    """

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root
        self.embeddings_db = {}
        self.metadata_db = {}

    def _hash_content(self, content: str) -> str:
        return hashlib.md5(content.encode()).hexdigest()

    def index_file(self, file_path: str, content: str, exports: List[str]):
        """Indexes a generated file into the Vector Store so future files can read it."""
        file_hash = self._hash_content(content)
        
        # Simple chunking by classes/functions would happen here via AST
        # For now, we store file-level metadata for RAG retrieval
        self.metadata_db[file_path] = {
            "hash": file_hash,
            "exports": exports,
            "content_preview": content[:500] # store preview for fast context injection
        }
        
        # Mock embedding storage
        self.embeddings_db[file_path] = [0.0] * 1536 

    def search_context(self, required_imports: List[str]) -> str:
        """
        Retrieves context for the Coder Agent based on what it needs to import.
        If the Coder is writing a file that imports 'UserModel', this returns the actual
        source code or structural signature of UserModel to inject into the FIM prompt.
        """
        context_snippets = []
        for imp in required_imports:
            # Find which file exports this
            for file_path, meta in self.metadata_db.items():
                if imp in meta.get("exports", []):
                    context_snippets.append(f"// Context from {file_path}:\n{meta['content_preview']}...\n")
                    
        return "\n".join(context_snippets)

# Singleton
_vector_store_instance = None
def get_vector_store(root_path: str):
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = AdvancedVectorStore(root_path)
    return _vector_store_instance
