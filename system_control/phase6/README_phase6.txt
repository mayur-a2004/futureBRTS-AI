# bootstrap runner for phase6
param([string]\YOUR_SECRET_ADMIN_TOKEN)
pwsh -ExecutionPolicy Bypass -File "\C:\Users\Admin\.gemini\antigravity\futurebilder_tool\system_control\phase6\security_guard.ps1" -Token "\YOUR_SECRET_ADMIN_TOKEN"
