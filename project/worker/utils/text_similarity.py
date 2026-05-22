from difflib import SequenceMatcher

def similarity_score(a, b):
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()
