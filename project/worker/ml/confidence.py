from ml.deep_layer import DeepAnalyzer

def calculate_confidence(result: dict) -> float:
    """
    Calculates a confidence score based on the extraction result.
    Last Layer Boost: Uses deep metrics if available.
    """
    if not result:
        return 0.0
    
    score = 0.5 # Base
    
    # Check for Deep Analysis signals
    deep_analysis = result.get("result", {}).get("deep_analysis", {})
    if deep_analysis:
        # If we successfully ran deep analysis, confidence goes up
        score += 0.2
        
        # If lexical diversity is good (not repeating same word), boost
        if deep_analysis.get("lexical_diversity", 0) > 0.3:
            score += 0.1
            
    # Text length check
    extracted_text = result.get("extracted_text", "")
    if len(extracted_text) > 100:
        score += 0.15
        
    return round(min(score, 0.99), 2)
