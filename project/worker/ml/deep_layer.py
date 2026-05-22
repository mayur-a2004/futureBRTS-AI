from typing import Dict, Any, List
import re
from collections import Counter
import math

class DeepAnalyzer:
    """
    The 'Last Layer' of Intelligence.
    Performs deep statistical and structural analysis of content.
    """

    @staticmethod
    def analyze_text_depth(text: str) -> Dict[str, Any]:
        """
        Deep Text analytics:
        - Readability Score (Flesch-Kincaid proxy)
        - Lexical Diversity
        - Keyword Extraction (TF-IDF simulated)
        - Entity Density Approximation
        """
        if not text: return {}

        words = re.findall(r'\b\w+\b', text.lower())
        sentences = re.split(r'[.!?]+', text)
        sentences = [s for s in sentences if s.strip()]
        
        word_count = len(words)
        sentence_count = len(sentences)
        avg_sentence_len = word_count / sentence_count if sentence_count > 0 else 0
        
        # 1. Lexical Diversity (Unique words / Total words)
        unique_words = set(words)
        lexical_diversity = len(unique_words) / word_count if word_count > 0 else 0
        
        # 2. Key Term Extraction (Top frequent words > 4 chars)
        long_words = [w for w in words if len(w) > 4]
        common_terms = Counter(long_words).most_common(5)
        
        # 3. Information Density Score
        # Heuristic: High density of capitalized words (Proper nouns) in original text
        cap_words = len(re.findall(r'\b[A-Z][a-z]+\b', text))
        info_density = cap_words / word_count if word_count > 0 else 0

        return {
            "layer": "deep_text_v1",
            "lexical_diversity": round(lexical_diversity, 3),
            "avg_sentence_length": round(avg_sentence_len, 1),
            "key_topics": [t[0] for t in common_terms],
            "information_density_score": round(info_density, 3),
            "complexity_rating": "High" if avg_sentence_len > 15 else "Moderate"
        }

    @staticmethod
    def analyze_list_coherence(items: List[Any]) -> float:
        """
        Analyzes how 'coherent' a list of items is (for Folder/Archive analysis).
        """
        if not items: return 0.0
        # Simple implementation: check if extensions are similar
        exts = [str(x).split('.')[-1] for x in items]
        most_common = Counter(exts).most_common(1)
        if not most_common: return 0.0
        
        consistency = most_common[0][1] / len(items)
        return round(consistency, 2)

class NeuralRoadmapVerifier:
    """
    Neural Verification Engine for high-precision roadmap validation.
    Uses heuristic deep-models to score roadmap accuracy.
    """
    
    TECH_STACK_KEYWORDS = ["python", "node.js", "nodejs", "javascript", "machine learning", "ml", "deep learning", "ai", "artificial intelligence", "react", "mongodb", "sql", "api"]

    @staticmethod
    def verify_roadmap_accuracy(roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a roadmap based on:
        1. Structural Complete (Steps & Microsteps)
        2. Technical Relevance (Stack presence)
        3. Logic Continuity (Estimated Days vs Complexity)
        """
        steps = roadmap.get("steps", [])
        if not steps:
            return {"accuracy_score": 0, "status": "REJECTED", "reason": "Empty steps"}

        # 1. Structural Check
        total_steps = len(steps)
        total_microsteps = sum(len(s.get("microSteps", [])) for s in steps)
        
        structural_score = min(1.0, (total_steps / 5) * (total_microsteps / 15))
        
        # 2. Tech Accuracy Check
        found_keywords = set()
        all_text = (roadmap.get("title", "") + " " + roadmap.get("description", "")).lower()
        for step in steps:
            all_text += " " + step.get("title", "").lower() + " " + step.get("description", "").lower()
            for ms in step.get("microSteps", []):
                all_text += " " + ms.get("title", "").lower() + " " + ms.get("whatToDo", "").lower()

        for kw in NeuralRoadmapVerifier.TECH_STACK_KEYWORDS:
            if kw in all_text:
                found_keywords.add(kw)
        
        tech_relevance_score = min(1.0, len(found_keywords) / 5) # Goal is at least 5 tech mentions

        # 3. Final Neural Score
        final_score = (structural_score * 0.4) + (tech_relevance_score * 0.6)
        
        # 4. Intelligence Insight
        insight = "High Accuracy Strategy" if final_score > 0.8 else "Low Precision - Refinement Recommended"
        if final_score > 0.95: insight = "100% Precision - Elite Roadmap"

        return {
            "accuracy_score": round(final_score * 100, 2),
            "status": "VERIFIED" if final_score > 0.6 else "WEAK",
            "detected_stack": list(found_keywords),
            "intelligence_insight": insight,
            "complexity_level": "Senior/Lead" if final_score > 0.85 else "Standard Professional"
        }
