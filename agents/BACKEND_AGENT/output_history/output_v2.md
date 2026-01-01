# BACKEND_AGENT OUTPUT V2
**Task:** Auto Project Generation Backend

## 1. API Endpoints

### POST `/project/generate`
- **Description:** Generates a full project structure based on input parameters.
- **Input (JSON):**
  ```json
  {
    "name": "MyProject",
    "domain": "Fintech",
    "difficulty": "Medium"
  }
  ```
- **Output (JSON):**
  ```json
  {
    "success": true,
    "data": {
      "overview": "Markdown string...",
      "er_diagram_text": "Mermaid/PlantUML string...",
      "dfd_text": "Text description of flow...",
      "database_schema": "SQL or JSON schema...",
      "report_document_markdown": "Full report content..."
    }
  }
  ```

## 2. Internal Logic (Pseudo-code)

```python
def generate_project(name, domain, difficulty):
    # 1. Select Template based on Domain
    template = load_template(domain) # e.g., Fintech template has 'User', 'Transaction', 'Wallet'

    # 2. Adjust Complexity based on Difficulty
    if difficulty == 'Easy':
        features = template.basic_features
    elif difficulty == 'Hard':
        features = template.advanced_features + template.microservices

    # 3. Generate Artifacts
    overview = create_overview(name, features)
    er_diagram = generate_er(features)
    dfd = generate_dfd(features)
    schema = generate_schema(features)
    report = compile_report(overview, er_diagram, dfd, schema)

    return { ... }
```

## 3. Data Structures
- **Templates:** Pre-defined JSON files for each domain (Web, App, AI, etc.) containing standard entities and relationships.
- **Response Format:** Strictly JSON as requested.

## 4. Notes
- No PDF generation in backend yet (client-side or separate service later).
- Outputting raw markdown/text for the frontend to render.
