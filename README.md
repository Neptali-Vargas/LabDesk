# LabDesk

Sistema de gestión de incidencias para un laboratorio de cómputo.
**Django REST Framework + React (Vite) + SQLite.**

Proyecto del taller: CRUD completo, filtros, panel de estadísticas y datos
persistidos en la base de datos.

---

## Requisitos

| Herramienta | Versión usada |
| --- | --- |
| Python | 3.12 |
| Node.js | 18 o superior (probado con 24) |
| Django | 6.1 |
| Django REST Framework | 3.18 |
| React + Vite | 18 / 5 |

---

## Arranque rápido (dos terminales)

### Terminal A — Backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

O sin activar el entorno:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py runserver
```

API: <http://127.0.0.1:8000/api/incidencias/>

### Terminal B — Frontend

```powershell
cd frontend
npm run dev
```

Interfaz: <http://localhost:5173>

> También puedes usar los lanzadores `start-backend.ps1` y
> `start-frontend.ps1` desde la raíz del proyecto (doble clic con clic derecho →
> "Ejecutar con PowerShell").

---

## Instalación desde cero

```powershell
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py seed_demo

# Frontend
cd ..\frontend
npm install
```

`seed_demo` crea las cinco incidencias de prueba de la guía si aún no existen.

---

## Estructura

```
LabDesk/
├── backend/
│   ├── .venv/                 (entorno virtual, no se entrega)
│   ├── config/
│   │   ├── settings.py        apps, CORS, SQLite
│   │   ├── urls.py            router de la API bajo /api/
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── incidencias/
│   │   ├── models.py          modelo Incidencia
│   │   ├── serializers.py     IncidenciaSerializer
│   │   ├── views.py           IncidenciaViewSet (ModelViewSet)
│   │   ├── admin.py           registro en el admin de Django
│   │   ├── migrations/
│   │   └── management/commands/seed_demo.py
│   ├── db.sqlite3             (se crea con migrate)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            estado, fetch, CRUD, filtros y KPIs
│       ├── App.css            estilos de la interfaz
│       └── index.css          base y variables de diseño
├── start-backend.ps1
├── start-frontend.ps1
└── README.md
```

---

## Contrato de la API

URL base: `http://127.0.0.1:8000/api/incidencias/`

| Método | URL | Operación | Respuesta |
| --- | --- | --- | --- |
| GET | `/api/incidencias/` | Listar | `200` + arreglo JSON |
| POST | `/api/incidencias/` | Crear | `201` + registro |
| PUT | `/api/incidencias/1/` | Editar completo | `200` + registro |
| PATCH | `/api/incidencias/1/` | Cambiar estado | `200` + registro |
| DELETE | `/api/incidencias/1/` | Eliminar | `204` |

### Campos

| Campo | Tipo / valores | Obligatorio |
| --- | --- | --- |
| `titulo` | texto, máximo 120 | Sí |
| `descripcion` | texto libre | Sí |
| `categoria` | `hardware` \| `software` \| `red` | Sí |
| `prioridad` | `baja` \| `media` \| `alta` | Sí |
| `estado` | `pendiente` \| `en_proceso` \| `resuelto` | Sí |
| `creado_en` | fecha y hora automática | Solo lectura |
| `*_display` | etiquetas legibles (extra) | Solo lectura |

### Ejemplo con curl

```bash
curl -X POST http://127.0.0.1:8000/api/incidencias/ ^
  -H "Content-Type: application/json" ^
  -d "{\"titulo\":\"PC no enciende\",\"descripcion\":\"No responde\",\"categoria\":\"hardware\",\"prioridad\":\"alta\",\"estado\":\"pendiente\"}"
```

---

## Funcionalidades implementadas

- Crear incidencia con título, descripción, categoría, prioridad y estado.
- Listar todas las incidencias guardadas en SQLite (ordenadas por fecha).
- Editar cualquier registro con el formulario (modo edición + cancelar).
- Cambiar estado con un clic: pendiente, en proceso o resuelto (`PATCH`).
- Eliminar con confirmación del navegador (`DELETE`).
- Buscar por título o descripción.
- Filtrar por estado y por prioridad (combinables con la búsqueda).
- Ordenar por fecha, prioridad o título, con paginación configurable.
- Cuatro contadores: total, pendientes, en proceso y resueltas.
- Contador adicional de incidencias de **prioridad alta** (reto adicional de la guía).
- **Exportación a CSV** de las incidencias filtradas (reto adicional de la guía).
- Panel con distribución por estado, reparto por categoría y actividad reciente.
- Mensajes de éxito y de error (incluye el detalle que devuelve la API).
- Preferencias persistentes (filas por página, actualización automática, animaciones).
- Diseño adaptable a móvil, tableta y escritorio.

---

## Diseño de la interfaz

Estilo de software empresarial minimalista, construido solo con React y CSS
(sin librerías de UI):

| Color | Uso |
| --- | --- |
| `#FFFFFF` | Superficies: tarjetas, paneles, tabla, modales |
| `#F4F5F7` | Fondo de la aplicación |
| `#111111` | Texto principal, elementos activos |
| `#F5C518` | Amarillo de marca: botón primario, selección, estados pendientes |
| `#E3E5E9` / `#D3D7DE` | Bordes y separadores |
| `#8A9099` / `#4B5563` | Texto secundario y terciario |

Principios aplicados:

- Sin degradados, neones ni superficies translúcidas (verificado: cero
  `gradient` y cero `backdrop-filter` en el CSS).
- Sombras mínimas: solo bordes de 1 px y una sombra discreta en modales.
- Jerarquía clara: bordes definidos, radios de 8-10 px y espacios generosos.
- Iconos de línea propios en SVG (`src/components/Icon.jsx`).
- Animaciones cortas (150-180 ms) y desactivables desde Configuración.
- En pantallas pequeñas la tabla se transforma en tarjetas apiladas.

Estructura del frontend:

```
frontend/src/
├── api.js                  # cliente HTTP de la API
├── utils.js                # formato de fechas, etiquetas y resúmenes
├── components/
│   ├── Icon.jsx            # set de iconos SVG
│   ├── Sidebar.jsx         # menú lateral de navegación
│   ├── Topbar.jsx          # barra superior
│   ├── StatCard.jsx        # tarjetas KPI
│   ├── IncidenciaForm.jsx  # modal de alta/edición
│   ├── ConfirmDialog.jsx   # confirmación de eliminación
│   └── Toasts.jsx          # notificaciones
└── views/
    ├── Dashboard.jsx
    ├── Incidencias.jsx
    └── Configuracion.jsx
```

Las vistas también se pueden abrir directamente por URL:
`/#dashboard`, `/#incidencias`, `/#configuracion`.

---

## Datos de prueba

`python manage.py seed_demo` genera:

| Incidencia | Categoría | Prioridad | Estado |
| --- | --- | --- | --- |
| PC no enciende | hardware | alta | pendiente |
| Python no abre | software | media | en_proceso |
| Wi-Fi lento | red | alta | pendiente |
| Teclado defectuoso | hardware | baja | resuelto |
| Navegador desactualizado | software | media | resuelto |

---

## Plan de pruebas

| Prueba | Acción | Aprobación |
| --- | --- | --- |
| Crear | Registrar una incidencia | Aparece en la lista y en la API |
| Leer | Recargar la página | Los datos siguen ahí (SQLite) |
| Editar | Modificar título o prioridad | Se refleja el nuevo valor |
| Estado | Cambiar a resuelto | Cambia el contador |
| Eliminar | Eliminar con confirmación | Desaparece y baja el total |
| Filtros | Buscar "Wi-Fi" o prioridad alta | Solo coincidencias |

---

## Configuración relevante

`backend/config/settings.py`:

```python
INSTALLED_APPS = [..., 'rest_framework', 'corsheaders', 'incidencias']

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',   # antes de CommonMiddleware
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

Zona horaria: `America/Lima`, idioma `es-pe` (iguales que el paquete base, para
que ambos proyectos muestren las mismas fechas).

`frontend/vite.config.js` sirve el frontend en `127.0.0.1:5173`.

Si cambias el puerto o el host de la API, edita la constante `BASE_API` en
`frontend/src/api.js` o define `VITE_API_URL` en un archivo `.env`.

---

## Solución de problemas

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `ModuleNotFoundError` | `.venv` inactivo | Activar el entorno o usar `.venv\Scripts\python.exe` |
| `No module named incidencias` | App no registrada | Revisar `INSTALLED_APPS` |
| `no such table` | Falta migrar | `python manage.py migrate` |
| `Failed to fetch` | Django apagado | Levantar el servidor en el puerto 8000 |
| Bloqueo CORS | Origen no permitido | Revisar `CORS_ALLOWED_ORIGINS` |
| `404` en la API | Falta `/api/` o la barra final | Usar `/api/incidencias/` |
| `400 Bad Request` | Campos inválidos | Ver la respuesta JSON en Network |
| `npm` no se reconoce | Node no instalado o PowerShell bloquea `npm.ps1` | Instalar Node y usar `npm.cmd` |

---

## Nota académica

Proyecto para desarrollo **local**. Para un entorno real harían falta
autenticación, permisos por rol, validaciones adicionales, manejo de secretos,
`DEBUG = False` y un despliegue adecuado.
