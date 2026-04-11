$ErrorActionPreference = "Stop"

function Ensure-Command {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not installed or not in PATH."
    }
}

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Ensure-Command -Name pnpm
Ensure-Command -Name uv

$backendEnv = Join-Path $root "backend/.env"
$backendEnvExample = Join-Path $root "backend/.env.example"
if (-not (Test-Path $backendEnv) -and (Test-Path $backendEnvExample)) {
    Copy-Item $backendEnvExample $backendEnv
    Write-Host "Created backend/.env from .env.example"
}

$engineEnv = Join-Path $root "engine/.env"
$engineEnvExample = Join-Path $root "engine/.env.example"
if (-not (Test-Path $engineEnv) -and (Test-Path $engineEnvExample)) {
    Copy-Item $engineEnvExample $engineEnv
    Write-Host "Created engine/.env from .env.example"
}

Write-Host "Installing backend dependencies..."
pnpm --dir backend install

Write-Host "Installing web dependencies..."
pnpm --dir web install

Write-Host "Syncing engine dependencies..."
uv sync --project engine

Write-Host "Workspace installation completed."
