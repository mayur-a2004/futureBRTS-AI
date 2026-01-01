@echo off
echo ==========================================
echo      FUTUREBILDER AGENT ORCHESTRATOR
echo ==========================================
echo.
echo [1] Reading Module Queue...
type "..\project_flow\module_queue.txt"
echo.
echo.

echo [2] Executing UI_AGENT...
echo ------------------------------------------
echo (Simulating AI processing for UI_AGENT...)
echo Task: Reading task_input.txt
echo Output: Generating output_v8.md...
type "..\agents\UI_AGENT\task_input.txt" > "..\agents\UI_AGENT\output_v8.md"
echo [DONE] UI_AGENT finished.
echo.

echo [3] Executing BACKEND_AGENT...
echo ------------------------------------------
echo (Simulating AI processing for BACKEND_AGENT...)
echo Task: Reading task_input.txt
echo Output: Generating output_v8.md...
type "..\agents\BACKEND_AGENT\task_input.txt" > "..\agents\BACKEND_AGENT\output_v8.md"
echo [DONE] BACKEND_AGENT finished.
echo.

echo [4] Executing DOC_AGENT...
echo ------------------------------------------
echo (Simulating AI processing for DOC_AGENT...)
echo Task: Reading task_input.txt
echo Output: Generating output_v8.md...
type "..\agents\DOC_AGENT\task_input.txt" > "..\agents\DOC_AGENT\output_v8.md"
echo [DONE] DOC_AGENT finished.
echo.

echo [5] Executing QA_AGENT...
echo ------------------------------------------
echo (Simulating AI processing for QA_AGENT...)
echo Task: Reading task_input.txt
echo Output: Generating output_v8.md...
type "..\agents\QA_AGENT\task_input.txt" > "..\agents\QA_AGENT\output_v8.md"
echo [DONE] QA_AGENT finished.
echo.

echo ==========================================
echo      ALL AGENTS FINISHED SUCCESSFULLY
echo ==========================================
pause
# ================== FUTUREBILDER AUTO AGENT EXECUTION ==================
# 📍 MASTER COMMAND FOR MODULE UPDATES + AGENT TASK DEPLOYMENT + RUN

MODULE=$1

echo "⚡ Starting Auto-Agent Execution for $MODULE..."

# 1) Inject New Task Input to All Agents
cp "modules/$MODULE/UI_TASK.txt" agents/UI_AGENT/task_input.txt
cp "modules/$MODULE/BACKEND_TASK.txt" agents/BACKEND_AGENT/task_input.txt
cp "modules/$MODULE/DOC_TASK.txt" agents/DOC_AGENT/task_input.txt
cp "modules/$MODULE/QA_TASK.txt" agents/QA_AGENT/task_input.txt

echo "✔ Tasks injected successfully into all agents"

# 2) Execute Antigravity 4-Agent Parallel Run
RUN orchestrator/run_all_tasks.md

echo "⚡ Agents executed → output generated"

# 3) Auto Save Output to History
DATE=$(date "+%d-%m-%y_%H-%M")

mv agents/UI_AGENT/output_v*.md agents/UI_AGENT/output_history/output_$DATE.md
mv agents/BACKEND_AGENT/output_v*.md agents/BACKEND_AGENT/output_history/output_$DATE.md
mv agents/DOC_AGENT/output_v*.md agents/DOC_AGENT/output_history/output_$DATE.md
mv agents/QA_AGENT/output_v*.md agents/QA_AGENT/test_reports/test_$DATE.md

echo "📁 Output archived with timestamp → MODULE COMPLETE"
echo "====================================================="
