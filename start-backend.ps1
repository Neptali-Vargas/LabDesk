$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $raiz 'backend')

$py = '.\.venv\Scripts\python.exe'

if (-not (Test-Path $py)) {
    Write-Host 'Creando entorno virtual...' -ForegroundColor Cyan
    python -m venv .venv
    & $py -m pip install -r requirements.txt
}

if (-not (Test-Path 'db.sqlite3')) {
    Write-Host 'Aplicando migraciones y datos de prueba...' -ForegroundColor Cyan
    & $py manage.py migrate
    & $py manage.py seed_demo
}

Write-Host 'Backend en http://127.0.0.1:8000/api/incidencias/' -ForegroundColor Green
& $py manage.py runserver
