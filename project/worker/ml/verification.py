def verify_structure(result: dict) -> bool:
    """
    Verifies that the output result has the required structure.
    """
    required_keys = ["extracted_text", "result"]
    for key in required_keys:
        if key not in result:
            return False
    return True

def is_junk_output(text: str) -> bool:
    """
    Detects if the output is likely junk (empty, gibberish).
    """
    if not text or len(text.strip()) == 0:
        return True
    return False
