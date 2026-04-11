$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$backendEnv = Join-Path $root "backend/.env"
$engineEnv = Join-Path $root "engine/.env"

if (-not (Test-Path $backendEnv)) {
    throw "Missing backend/.env. Run workspace installer first."
}

if (-not (Test-Path $engineEnv)) {
    throw "Missing engine/.env. Run workspace installer first."
}

Write-Host "Starting backend dev server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\backend'; pnpm dev"

Write-Host "Starting web dev server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\\web'; pnpm dev"

Write-Host "Started backend and web in separate terminals."
Write-Host "Note: Ensure your Python engine service is running on the URL configured in backend/.env (default: http://localhost:8000)."
