Remove-Item -Path ".env" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

Write-Host "Root Cleaned Successfully."
