@echo off
echo ==========================================
echo      LOADING TASKS FOR %1
echo ==========================================

if "%1"=="" (
    echo Error: No module specified. Usage: LOAD_TASKS.cmd MODULE-X
    exit /b 1
)

if not exist "..\modules\%1" (
    echo Error: Module directory "..\modules\%1" does not exist.
    exit /b 1
)

echo Copying UI Task...
copy /Y "..\modules\%1\UI_TASK.txt" "..\agents\UI_AGENT\task_input.txt"

echo Copying Backend Task...
copy /Y "..\modules\%1\BACKEND_TASK.txt" "..\agents\BACKEND_AGENT\task_input.txt"

echo Copying Docs Task...
copy /Y "..\modules\%1\DOC_TASK.txt" "..\agents\DOC_AGENT\task_input.txt"

echo Copying QA Task...
copy /Y "..\modules\%1\QA_TASK.txt" "..\agents\QA_AGENT\task_input.txt"

echo.
echo [SUCCESS] Tasks loaded for %1.
echo ==========================================
