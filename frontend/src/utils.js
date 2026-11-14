// Utilidades compartidas de formato y etiquetas.

export const ETIQUETAS = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red / Internet',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}

export const ESTADOS = ['pendiente', 'en_proceso', 'resuelto']
export const PRIORIDADES = ['alta', 'media', 'baja']
export const CATEGORIAS = ['hardware', 'software', 'red']

export const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 }

export function formatearFecha(iso, conHora = true) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' }
  if (conHora) {
    opciones.hour = '2-digit'
    opciones.minute = '2-digit'
  }
  return fecha.toLocaleString('es-MX', opciones)
}

export function fechaRelativa(iso) {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return '—'
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000)
  if (minutos < 1) return 'ahora mismo'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias < 7) return `hace ${dias} d`
  return formatearFecha(iso, false)
}

export function porcentaje(parte, total) {
  if (!total) return 0
  return Math.round((parte / total) * 100)
}

export function resumirIncidencia(item) {
  const texto = (item.descripcion || '').trim()
  return texto.length > 90 ? `${texto.slice(0, 90).trimEnd()}…` : texto
}

/**
 * Exporta la lista de incidencias a un archivo CSV descargable.
 * Incluye BOM para que Excel respete los acentos.
 */
export function exportarCSV(items, nombreArchivo = 'labdesk-incidencias') {
  const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`
  const cabeceras = ['ID', 'Título', 'Descripción', 'Categoría', 'Prioridad', 'Estado', 'Registrada']
  const filas = items.map((item) =>
    [
      item.id,
      item.titulo,
      item.descripcion,
      ETIQUETAS[item.categoria],
      ETIQUETAS[item.prioridad],
      ETIQUETAS[item.estado],
      formatearFecha(item.creado_en),
    ]
      .map(escapar)
      .join(','),
  )
  const csv = `﻿${[cabeceras.map(escapar).join(','), ...filas].join('\r\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
  return filas.length
}
