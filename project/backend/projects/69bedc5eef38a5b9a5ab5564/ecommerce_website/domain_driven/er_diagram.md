mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        string user_id PK
        string email
        string password_hash
        string role
    }
    
    PRODUCT ||--o{ ORDER_ITEM : contains
    PRODUCT {
        string product_id PK
        string name
        decimal price
        integer stock
    }
    
    ORDER ||--o{ ORDER_ITEM : has
    ORDER {
        string order_id PK
        timestamp created_at
        string status
    }
    
    ORDER_ITEM {
        string item_id PK
        integer quantity
    }
