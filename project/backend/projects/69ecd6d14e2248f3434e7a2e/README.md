# ecommerce website 🔱
> **TITAN SUPREME FRONTEND BUILD v6.0 (ANTIGRAVITY EDITION)**

## 📊 Mission Overview
- **Project Vision:** {
  "status": "COMPLETE",
  "actors": [
    "Admin",
    "Customer",
    "Vendor",
    "Manager"
  ],
  "features": [
    "Product Management",
    "Order Management",
    "Payment Gateway",
    "Shipping Options",
    "Analytics & Reports"
  ],
  "techDecisions": {
    "auth": "JWT",
    "payment": "Secure Payment Gateway"
  },
  "summary": "Ecommerce website with order management, payment gateway, product management, shipping options, and analytics & reports. The website will have four user roles: Admin, Customer, Vendor, and Manager. Each role will have different responsibilities and permissions. The website will be built using a Solid SaaS Solution with secure payment processing, efficient order management, and effective customer support."
}
- **High-Fidelity Stack:** HTML, CSS & JS
- **Tier:** GRADUATION
- **Status:** Frontend Fully Operational | Backend/DB Preserved as Comments

## 🚀 Deployment Strategy (Frontend Only)
1. **Frontend:**
      cd frontend && npm install && npm run dev
   
## 📂 Industrial Architecture
- `/frontend`: High-Fidelity Responsive UI Components (Complete & Ready).
- `/backend`: [INACTIVE] Backend skeletons and API protocols preserved for future development.
- `/docs`: Project vision and technical specs.

##  Architecture
erDiagram
    Product {
        int id PK
        string name
        decimal price
        int stockQuantity
        string description
        string category
    }
    User {
        int id PK
        string username
        string password
        string email
        string role
    }
    Order {
        int id PK
        int userId FK
        datetime orderDate
        decimal totalAmount
        string status
    }
    OrderItem {
        int id PK
        int orderId FK
        int productId FK
        int quantity
        decimal price
    }
    Payment {
        int id PK
        int orderId FK
        string paymentMethod
        string paymentStatus
        decimal amount
    }
    Shipping {
        int id PK
        int orderId FK
        string address
        string shippingMethod
        decimal shippingCost
        datetime shippingDate
    }
    User ||--o{ Order : places
    Order ||--o{ OrderItem : contains
    Order ||--o{ Payment : has
    Order ||--o{ Shipping : ships
    Product ||--o{ OrderItem : partOf

