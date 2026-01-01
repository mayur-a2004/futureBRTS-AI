$ErrorActionPreference = "Stop"
# admin_check.ps1
# Usage: . .\admin_check.ps1 inside another script

# Resolve .env path relative to this script
# Assuming this script is in .../phase5/ or similar, and we want .../phase5/.env
# existing logic: Join-Path $PSScriptRoot "..\phase5\.env"
# If we are in phase5, ..\phase5 is phase5.
$envFile = Join-Path $PSScriptRoot "..\phase5\.env"

if (Test-Path $envFile) {
    # Use -Raw to ensure multi-line files are parsed as a single hash table
    $env = Get-Content $envFile -Raw | ConvertFrom-StringData
    
    if (-not $env.ContainsKey("ADMIN_TOKEN")) { 
        Write-Host "Admin token missing in .env. Exit." -ForegroundColor Red
        exit 1 
    }
    
    $provided = Read-Host "Enter admin token" -AsSecureString
    
    # SecureString to PlainText
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($provided)
    try {
        $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    
    if ($plain -ne $env.ADMIN_TOKEN) { 
        Write-Host "❌ Invalid token. Access Denied." -ForegroundColor Red
        exit 1 
    }
    
    Write-Host "✅ Admin Access Granted." -ForegroundColor Green
}
else {
    Write-Host "❌ .env not found at $envFile. Create it and set ADMIN_TOKEN." -ForegroundColor Red
    exit 1
}
