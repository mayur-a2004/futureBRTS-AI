from typing import List, Dict

class ContextBuilder:
    def build_context(self, documents: List[Dict], max_chars: int = 2000) -> str:
        """
        Constructs a context string from retrieved documents.
        """
        if not documents:
            return ""
            
        context_parts = []
        current_len = 0
        
        for doc in documents:
            content = doc.get("content", "")
            if current_len + len(content) > max_chars:
                # Truncate if needed
                remaining = max_chars - current_len
                context_parts.append(content[:remaining])
                break
            
            context_parts.append(content)
            current_len += len(content)
            
        return "\n\n".join(context_parts)

context_builder = ContextBuilder()
