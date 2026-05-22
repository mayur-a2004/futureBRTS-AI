@echo off
TITLE FutureBuilder Orchestrator
echo ===================================================
echo   FUTUREBUILDER: TURBO START SYSTEM (WINDOWS)
echo ===================================================
echo.
echo [1/3] Starting API Gateway (Unified Core)...
start "FB: API Gateway" cmd /k "cd backend\api_gateway && npm run dev"

echo [2/3] Starting Unified AI Frontend...
start "FB: Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Starting AI Worker (Python)...
start "FB: AI Worker" cmd /k "cd worker && uvicorn main:app --port 8000 --reload"

echo.
echo ===================================================
echo   FUTURE BRTS: SYSTEMS ONLINE (GENESIS CORE)
echo   - Main App:  http://localhost:5173
echo   - Admin URL: http://localhost:5173/admin
echo ===================================================
pause
