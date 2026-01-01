# BACKEND_AGENT OUTPUT V1
**Task:** Create backend foundation structure

## 1. API Endpoints
**Base URL:** `/api/v1`

### Auth & User
- **POST** `/auth/register`
    - **Input:** `{ email, password, name }`
    - **Output:** `{ token, user: { id, name, role, stage } }`
- **POST** `/auth/login`
    - **Input:** `{ email, password }`
    - **Output:** `{ token, user: { id, name, role, stage } }`
- **PUT** `/user/updateRole`
    - **Headers:** `Authorization: Bearer <token>`
    - **Input:** `{ role: "STUDENT" | "JOB" | "STARTUP" }`
    - **Output:** `{ success: true, user: { ... } }`
- **PUT** `/user/updateStage`
    - **Headers:** `Authorization: Bearer <token>`
    - **Input:** `{ stage_value: number, log_message: string }`
    - **Output:** `{ success: true, new_stage: number }`

## 2. Database Schema (Relational/SQL)

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Not Null | Unique User ID |
| `email` | VARCHAR(255) | Unique, Not Null | User Email |
| `password_hash` | VARCHAR | Not Null | Hashed Password |
| `name` | VARCHAR(100) | | Display Name |
| `role` | ENUM | Default NULL | 'STUDENT', 'JOB', 'STARTUP' |
| `stage` | INTEGER | Default 0 | Current progress stage (0-100) |
| `created_at` | TIMESTAMP | Default NOW() | |

### Table: `stage_log`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Log ID |
| `user_id` | UUID | FK -> users.id | User reference |
| `stage_value` | INTEGER | Not Null | The stage value recorded |
| `timestamp` | TIMESTAMP | Default NOW() | When the change happened |
| `meta_data` | JSONB | | Optional extra details |

## 3. Business Logic Notes
- **Role Validation:** User cannot change role after initial selection without admin reset (optional rule).
- **Stage Logic:** Stage updates should trigger an entry in `stage_log` for audit trails.
- **Security:** Passwords must be salted and hashed (e.g., bcrypt).
