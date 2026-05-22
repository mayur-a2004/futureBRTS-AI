import logging
from typing import List, Dict
from embeddings.vector_store import vector_store

logger = logging.getLogger(__name__)

class Retriever:
    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieves relevant documents from the vector store.
        """
        return vector_store.query(query, k=top_k)

    def add(self, text: str, metadata: dict = None):
        vector_store.add_document(text, metadata)

retriever = Retriever()
