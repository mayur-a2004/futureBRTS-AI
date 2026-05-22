# 🚀 Future BRTS - System Documentation & Deployment Guide

**Future BRTS** is a sophisticated, AI-enhanced career architect.
**Architecture:** Frontend (React) + Backend (Node.js) + **Worker (Python Brain)**.

---

## 🛠️ 1. Directory Structure

```plaintext
futurebuilderlatest/
├── project/
│   ├── frontend/           # React Client (Vite)
│   ├── backend/
│   │   └── api_gateway/    # Node.js API + Orchestrator
│   └── worker/             # [NEW] Python AI Brain (FastAPI)
```

---

## 💻 2. Local Development Commands

Use these commands to run the project on your local machine.

### **Backend (Node.js API)**
*Runs on Port 7000*
```bash
cd project/backend/api_gateway
npm install
npm run dev
```

### **Python Worker (AI Engine)**
*Runs on Port 8000*
*(Make sure Python 3.10+ is installed)*
```bash
cd project/worker
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### **Frontend (React)**
*Runs on Port 5173*
```bash
cd project/frontend
npm install
npm run dev
```

---

## 🚀 3. Hostinger / VPS Deployment Guide

Since your **Frontend & Backend are already live**, you strictly need to:
1.  **Deploy the NEW Python Worker.**
2.  **Update the Backend** to talk to this Python Worker.

Follow these steps exactly.

### 🟢 step 1: Deploy Python Worker (The "Brain")

This is a **new service**. You need to set it up once.

1.  **Upload Code:**
    *   Upload the entire `project/worker` folder to your server (e.g., `/var/www/futurebuilder/worker`).

2.  **Install Python Dependencies:**
    *   Login to your server terminal (SSH).
    *   Navigate to the worker folder:
        ```bash
        cd /path/to/project/worker
        ```
    *   Create a virtual environment (Recommended):
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   Install libraries:
        ```bash
        pip install -r requirements.txt
        ```
    *   *Note: If you get errors with `Graphviz`, install system package: `sudo apt-get install graphviz`*

3.  **Run Python Worker (Production Mode):**
    *   Use `nohup` to keep it running in the background OR use a process manager like `pm2`.
    *   **Option A (PM2 - Easiest):**
        ```bash
        pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name "fb-python-worker"
        ```
    *   **Option B (Nohup):**
        ```bash
        nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
        ```

### 🟡 Step 2: Update Backend (Node.js)

Your backend has new logic to communicate with the Python worker.

1.  **Upload Updates:**
    *   Upload the latest code from `project/backend/api_gateway` to your server.

2.  **Update Dependencies:**
    ```bash
    cd /path/to/project/backend/api_gateway
    npm install
    ```

3.  **Configure Environment (.env):**
    *   Open your backend `.env` file.
    *   Add/Verify this line:
        ```env
        PYTHON_WORKER_URL=http://localhost:8000
        ```

4.  **Restart Backend:**
    ```bash
    pm2 restart all
    # OR if you use a specific name:
    pm2 restart futurebuilder-backend
    ```

### 🔵 Step 3: Deployment Check

1.  **Check Python Status:**
    ```bash
    pm2 status
    # Look for 'fb-python-worker' -> Status should be 'online'
    ```

2.  **Check Logs (If errors occur):**
    ```bash
    pm2 logs fb-python-worker
    pm2 logs futurebuilder-backend
    ```

---

## 📋 Common Management Commands

| Action | Command |
| :--- | :--- |
| **Stop Python Worker** | `pm2 stop fb-python-worker` |
| **Restart Python Worker** | `pm2 restart fb-python-worker` |
| **Update Python Deps** | `pip install -r requirements.txt` |
| **View Backend Logs** | `pm2 logs` |

---
*System is now fully architected for Database-First & Verification-First execution.*
