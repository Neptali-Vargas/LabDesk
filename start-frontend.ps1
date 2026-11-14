$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $raiz 'frontend')

$npm = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
if (-not (Test-Path $npm)) { $npm = 'npm.cmd' }

if (-not (Test-Path 'node_modules')) {
    Write-Host 'Instalando dependencias del frontend...' -ForegroundColor Cyan
    & $npm install
}

Write-Host 'Frontend en http://localhost:5173' -ForegroundColor Green
& $npm run dev
