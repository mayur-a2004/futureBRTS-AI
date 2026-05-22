# ONLINE LIBRARY WEBSITE...
## Project Details
- Status: Auto-Generated via Antigravity Titan Engine
- Category: GRADUATION
- Backend: Core PHP
- Frontend: HTML, CSS & JS

## Architecture Diagram (Mermaid)
```mermaid
erDiagram
  "USER" {
    int id
    string name
    string email
  }
  "BOOK" {
    int id
    string title
    string author
  }
  "BORROW" {
    int id
    int user_id
    int book_id
    date borrow_date
    date return_date
  }
  "USER" ||--o|> "BORROW" : borrows
  "BOOK" ||--o|> "BORROW" : borrowed_by
```

## System Flow (Context DFD)
```mermaid
graph TD
  A["User"] -->|requests|> B["Web Server"]
  B -->|sends request|> C["API Service"]
  C -->|processes request|> D["Database"]
  D -->|sends response|> C
  C -->|sends response|> B
  B -->|sends response|> A
```
