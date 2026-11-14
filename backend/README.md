# LabDesk — Backend (Django + DRF)

API REST para el sistema de gestión de incidencias del laboratorio.

## Puesta en marcha

```powershell
cd backend

# 1. Crear y activar el entorno virtual (solo la primera vez)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
python -m pip install -r requirements.txt

# 3. Aplicar migraciones y cargar datos de prueba
python manage.py migrate
python manage.py seed_demo

# 4. Ejecutar el servidor
python manage.py runserver
```

API disponible en <http://127.0.0.1:8000/api/incidencias/>

Si PowerShell bloquea la activación del entorno, usa la ruta directa:

```powershell
.\.venv\Scripts\python.exe manage.py runserver
```
