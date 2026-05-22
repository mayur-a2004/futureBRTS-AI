import difflib

class DiffChecker:
    @staticmethod
    def get_diff_ratio(str1, str2):
        return difflib.SequenceMatcher(None, str1, str2).ratio()
