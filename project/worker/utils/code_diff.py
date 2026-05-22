import difflib

class CodeDiff:
    @staticmethod
    def diff(code1, code2):
        print("💻 Checking Code Diff...")
        return difflib.unified_diff(code1.splitlines(), code2.splitlines())
