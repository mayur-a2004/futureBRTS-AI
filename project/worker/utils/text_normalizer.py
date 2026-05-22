import re

class TextNormalizer:
    @staticmethod
    def normalize(text):
        return re.sub(r'\s+', ' ', text).strip().lower()
