import ast
import re
import os
from typing import List, Dict, Any

class ASTAnalyzer:
    """
    AST Analyzer for the Omega Pipeline.
    Reads Python, JS, TS, and TSX files to extract imports, exports, and function definitions
    without using the LLM, drastically reducing hallucination and context length.
    """

    def __init__(self, workspace_root: str):
        self.workspace_root = workspace_root

    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Analyzes a file and returns its AST metadata (imports, exports, functions)."""
        full_path = os.path.join(self.workspace_root, file_path)
        if not os.path.exists(full_path):
            return {"error": "File not found"}

        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.py':
            return self._analyze_python(content)
        elif ext in ['.js', '.jsx', '.ts', '.tsx']:
            return self._analyze_js_ts(content)
        else:
            return {"error": f"Unsupported file type {ext}"}

    def _analyze_python(self, content: str) -> Dict[str, Any]:
        try:
            tree = ast.parse(content)
            imports = []
            functions = []
            classes = []

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module if node.module else ""
                    for alias in node.names:
                        imports.append(f"{module}.{alias.name}")
                elif isinstance(node, ast.FunctionDef):
                    functions.append(node.name)
                elif isinstance(node, ast.ClassDef):
                    classes.append(node.name)

            return {
                "imports": imports,
                "exports": functions + classes,  # In python, mostly everything top-level is exportable
                "functions": functions,
                "classes": classes
            }
        except SyntaxError as e:
            return {"error": f"Syntax error: {str(e)}"}

    def _analyze_js_ts(self, content: str) -> Dict[str, Any]:
        """
        Regex-based fallback for JS/TS until tree-sitter is fully integrated.
        Extracts 'import X from Y' and 'export const/function Z'.
        """
        imports = []
        exports = []

        # Find imports: import { X } from 'Y' OR import X from 'Y'
        import_pattern = r"import\s+(?:\{[^}]+\}|\w+)\s+from\s+['\"]([^'\"]+)['\"]"
        for match in re.finditer(import_pattern, content):
            imports.append(match.group(1))

        # Find exports: export const X, export function Y, export class Z, export default W
        export_pattern = r"export\s+(?:const|let|var|function|class|default)\s+(\w+)"
        for match in re.finditer(export_pattern, content):
            exports.append(match.group(1))

        return {
            "imports": list(set(imports)),
            "exports": list(set(exports)),
            "functions": [], # Requires deeper AST to reliably map
            "classes": []
        }

# Singleton instance
analyzer_instance = None
def get_analyzer(root_path: str):
    global analyzer_instance
    if analyzer_instance is None:
        analyzer_instance = ASTAnalyzer(root_path)
    return analyzer_instance
