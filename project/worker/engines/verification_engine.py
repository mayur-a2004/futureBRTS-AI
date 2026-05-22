from utils.text_similarity import similarity_score

def verify_task(payload):
    score = similarity_score(payload.userAnswer, payload.expected)

    return {
        "status": "PASS" if score > 0.6 else "FAIL",
        "score": score
    }
