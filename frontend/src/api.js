// Capa de acceso a la API de LabDesk.
// Centraliza las peticiones, el manejo de errores y los tiempos de respuesta.

export const BASE_API = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/incidencias/'
).replace(/\/?$/, '/')

function formatearDetalle(detalle, status) {
  if (!detalle) return `Error HTTP ${status}`
  if (typeof detalle === 'string') return detalle
  if (Array.isArray(detalle)) return detalle.join(' ')
  return Object.entries(detalle)
    .map(([campo, mensajes]) => {
      const texto = Array.isArray(mensajes) ? mensajes.join(' ') : mensajes
      return campo === 'detail' || campo === 'non_field_errors'
        ? texto
        : `${campo}: ${texto}`
    })
    .join(' · ')
}

async function solicitar(url, opciones = {}) {
  const inicio = performance.now()
  let respuesta
  try {
    respuesta = await fetch(url, opciones)
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Verifica que Django esté activo en el puerto 8000.',
    )
  }
  const ms = Math.round(performance.now() - inicio)
  const texto = await respuesta.text()
  const cuerpo = texto ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    const error = new Error(formatearDetalle(cuerpo, respuesta.status))
    error.status = respuesta.status
    error.detalle = cuerpo
    throw error
  }
  return { datos: cuerpo, ms, status: respuesta.status }
}

const cabecerasJson = { 'Content-Type': 'application/json' }

export const api = {
  listar: () => solicitar(BASE_API),

  crear: (datos) =>
    solicitar(BASE_API, {
      method: 'POST',
      headers: cabecerasJson,
      body: JSON.stringify(datos),
    }),

  actualizar: (id, datos) =>
    solicitar(`${BASE_API}${id}/`, {
      method: 'PUT',
      headers: cabecerasJson,
      body: JSON.stringify(datos),
    }),

  cambiarEstado: (id, estado) =>
    solicitar(`${BASE_API}${id}/`, {
      method: 'PATCH',
      headers: cabecerasJson,
      body: JSON.stringify({ estado }),
    }),

  eliminar: (id) => solicitar(`${BASE_API}${id}/`, { method: 'DELETE' }),

  ping: () => solicitar(BASE_API),
}
