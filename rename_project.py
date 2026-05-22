import os

def replace_in_file(file_path, replacements):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

replacements = {
    "FutureBSRTS": "FutureBRTS",
    "Future BSRTS": "Future BRTS",
    "BSRTS": "BRTS"
}

# Directories to search
base_dir = r"c:\Users\Admin\.gemini\antigravity\futurebuilderlatest\project"

for root, dirs, files in os.walk(base_dir):
    if ".git" in root or "node_modules" in root or "__pycache__" in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.py', '.md', '.json', '.html', '.css', '.txt')):
            file_path = os.path.join(root, file)
            replace_in_file(file_path, replacements)
