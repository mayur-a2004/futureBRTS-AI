$ErrorActionPreference = "SilentlyContinue"

# 1. Delete project/backend/src
$backendSrc = "project\backend\src"
if (Test-Path $backendSrc) {
    Remove-Item -Path $backendSrc -Recurse -Force
    Write-Host "Deleted $backendSrc"
} else {
    Write-Host "$backendSrc not found (good)."
}

# 2. Clean up root backend files (orphaned)
$orphans = @(
    "project\backend\.env",
    "project\backend\package.json",
    "project\backend\package-lock.json",
    "project\backend\tsconfig.json"
)

foreach ($item in $orphans) {
    if (Test-Path $item) {
        Remove-Item -Path $item -Force
        Write-Host "Removed orphaned file: $item"
    }
}

# 3. Validate api_gateway structure
$gatewaySrc = "project\backend\api_gateway\src"
$required = @("routes", "controllers", "models", "middleware", "utils", "config", "services")
foreach ($dir in $required) {
    $p = Join-Path $gatewaySrc $dir
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "Created missing directory: $p"
    }
}

# 4. Validate tsconfig.json
$tsConfigPath = "project\backend\api_gateway\tsconfig.json"
if (Test-Path $tsConfigPath) {
    $content = Get-Content $tsConfigPath -Raw
    if ($content -match '"rootDir":\s*"\./src"') {
        Write-Host "tsconfig.json rootDir is correct."
    } else {
        Write-Host "Updating tsconfig.json rootDir..."
        # We'll just overwrite it with the correct content to be safe
        $tsJson = @{
            compilerOptions = @{
                target = "es2020"
                module = "commonjs"
                outDir = "./dist"
                rootDir = "./src"
                strict = $true
                esModuleInterop = $true
                skipLibCheck = $true
                forceConsistentCasingInFileNames = $true
            }
            include = @("src/**/*")
            exclude = @("node_modules")
        } | ConvertTo-Json -Depth 4
        $tsJson | Out-File $tsConfigPath -Encoding UTF8 -Force
    }
} else {
    Write-Host "Creating tsconfig.json..."
    # Create if missing
     $tsJson = @{
        compilerOptions = @{
            target = "es2020"
            module = "commonjs"
            outDir = "./dist"
            rootDir = "./src"
            strict = $true
            esModuleInterop = $true
            skipLibCheck = $true
            forceConsistentCasingInFileNames = $true
        }
        include = @("src/**/*")
        exclude = @("node_modules")
    } | ConvertTo-Json -Depth 4
    $tsJson | Out-File $tsConfigPath -Encoding UTF8 -Force
}

# 5. Validate package.json
$pkgPath = "project\backend\api_gateway\package.json"
if (Test-Path $pkgPath) {
    $pkgContent = Get-Content $pkgPath -Raw | ConvertFrom-Json
    if ($pkgContent.main -ne "dist/index.js") {
        Write-Host "Updating package.json main entry..."
        $pkgContent.main = "dist/index.js"
        $pkgContent | ConvertTo-Json -Depth 4 | Out-File $pkgPath -Encoding UTF8 -Force
    } else {
        Write-Host "package.json main is correct."
    }
}

Write-Host "CLEAN_BACKEND_READY"
