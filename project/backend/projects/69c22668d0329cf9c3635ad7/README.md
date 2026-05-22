# ONLINE LIBRARY MANAGMENT WEBSITEE...
## Project Details
- Status: Auto-Generated via Antigravity Titan Engine
- Category: GRADUATION
- Backend: Core PHP
- Frontend: HTML, CSS & JS

## Architecture Diagram (Mermaid)
```mermaid
erDiagram
    USER ||--o{ LIBRARY : manages
    LIBRARY ||--|{ RECORD : contains
    USER {
      string id
      string name
      string email
    }
    LIBRARY {
      string id
      string title
      date created_at
    }
```

## System Flow (Context DFD)
```mermaid
graph TD
    A["HTML, CSS & JS"] -->|"REST API"| B["API Service"]
    B --> C{"API Gateway"}
    C --> D(("Controllers"))
    D --> E[("MySQL / MariaDB")]
```
