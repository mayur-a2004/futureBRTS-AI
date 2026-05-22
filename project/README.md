# 🚀 FutureBuilder - Next-Gen AI Project Architect

Welcome to **FutureBuilder**, an advanced autonomous AI platform designed to architect careers, projects, and strategies. This repository contains the complete ecosystem including the User Frontend, Admin Panel, API Gateway, and Python AI Workers.

---

## ⚡ Quick Start (The "One Command")

We have simplified the startup process into a single script.

### For Windows Users:
1. Double-click **`turbo_start.bat`** in this directory.
2. That's it. It will automatically open 5 terminal windows and start every service.

---

## 🏗️ Project Architecture

The system is composed of 5 distinct microservices:

| Service | Path | Port | Description |
| :--- | :--- | :--- | :--- |
| **Main Frontend** | `/frontend` | `5173` | User-facing React application (The Builder). |
| **API Gateway** | `/backend/api_gateway` | `5000` | Main Node.js backend orchestrator. |
| **AI Worker** | `/worker` | `8000` | Python/FastAPI service for heavy AI lifting. |
| **Admin Panel** | `/admin-panel/frontend` | `5174` | Dashboard for system management. |
| **Admin Backend** | `/admin-panel/backend` | `5001` | Dedicated backend for simple admin tasks. |

---

## 🛠️ Manual Startup (Fallback)

If you prefer to run services manually, open distinct terminals and run:

1.  **API Gateway**:
    ```bash
    cd backend/api_gateway
    npm run dev
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

3.  **AI Worker**:
    ```bash
    cd worker
    uvicorn main:app --port 8000 --reload
    ```

4.  **Admin Backend**:
    ```bash
    cd admin-panel/backend
    npm run dev
    ```

5.  **Admin Panel**:
    ```bash
    cd admin-panel/frontend
    npm run dev
    ```

---

## 🔑 Environment Variables

Ensure your `.env` files are set up in `backend/api_gateway` and `worker` with the following key keys:
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `MONGO_URI`

---

*Architected by Future V.2.0* 🚀
