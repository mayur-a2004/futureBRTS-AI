import os
import logging
from typing import List, Dict
import numpy as np
from embeddings.embedder import embedder

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        # Placeholder for Chroma/Qdrant
        # For small scale, we use a simple numpy-based index
        self.index = [] # List of { "vector": np.array, "content": str, "metadata": dict }
        logger.info("Local Vector Store Active (Hybrid Mode)")

    def add_document(self, content: str, metadata: dict = None):
        vector = embedder.embed(content)
        self.index.append({
            "vector": vector,
            "content": content,
            "metadata": metadata or {}
        })

    def query(self, text: str, k: int = 3) -> List[Dict]:
        if not self.index: return []
        
        query_vector = embedder.embed(text)
        
        # Simple cosine similarity
        results = []
        for item in self.index:
            vec = item["vector"]
            similarity = np.dot(query_vector, vec) / (np.linalg.norm(query_vector) * np.linalg.norm(vec))
            results.append({
                "content": item["content"],
                "metadata": item["metadata"],
                "score": float(similarity)
            })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:k]

vector_store = VectorStore()
