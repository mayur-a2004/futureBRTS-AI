MAX_RETRIES = 2

def should_retry(confidence: float, retries_done: int) -> bool:
    """
    Decides if a pipeline should retry based on confidence score.
    Honest logic: Only retry if confidence is low and we have attempts left.
    """
    if confidence < 0.6 and retries_done < MAX_RETRIES:
        return True
    return False
