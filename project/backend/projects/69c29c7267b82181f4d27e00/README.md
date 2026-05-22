# ONLINE LIBRARY WEBSITE...
## Project Details
- Status: Auto-Generated via Antigravity Titan Engine
- Category: GRADUATION
- Backend: Core PHP
- Frontend: HTML, CSS & JS

## Architecture Diagram (Mermaid)
```mermaid
erDiagram
  "BOOK" ||--o{ "BOOK_REVIEW" : "reviews"
  "BOOK" {
    int id
    string title
    string author
  }
  "BOOK_REVIEW" {
    int id
    string review
    int rating
  }
  "USER" ||--o{ "BOOK_RENTAL" : "rentals"
  "USER" {
    int id
    string name
    string email
  }
  "BOOK_RENTAL" {
    int id
    int book_id
    int user_id
    date rental_date
    date return_date
  }
```

## System Flow (Context DFD)
```mermaid
graph TD
  A["User"] -->|access|> B["Online Library Website"]
  B -->|request|> C["Database"]
  C -->|response|> B
  B -->|response|> A
```
