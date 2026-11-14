import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Toasts from './components/Toasts'
import ConfirmDialog from './components/ConfirmDialog'
import IncidenciaForm from './components/IncidenciaForm'

import Dashboard from './views/Dashboard'
import Incidencias from './views/Incidencias'
import Configuracion from './views/Configuracion'

import { api } from './api'
import { ETIQUETAS } from './utils'

const PREFERENCIAS_INICIALES = {
  porPagina: 8,
  autoRefresh: 0,
  animaciones: true,
}

const CLAVE_PREFERENCIAS = 'labdesk:preferencias'

function leerPreferencias() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS) || '{}')
    return { ...PREFERENCIAS_INICIALES, ...guardadas }
  } catch {
    return PREFERENCIAS_INICIALES
  }
}

const VISTAS = ['dashboard', 'incidencias', 'configuracion']

function vistaDesdeHash() {
  const hash = window.location.hash.replace('#', '').trim()
  return VISTAS.includes(hash) ? hash : 'dashboard'
}

const TITULOS = {
  dashboard: {
    titulo: 'Dashboard',
    descripcion: 'Resumen general del laboratorio',
  },
  incidencias: {
    titulo: 'Incidencias',
    descripcion: 'Administra los reportes de soporte técnico',
  },
  configuracion: {
    titulo: 'Configuración',
    descripcion: 'Conexión, preferencias e información del sistema',
  },
}

export default function App() {
  const [vista, setVista] = useState(vistaDesdeHash)
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [conexion, setConexion] = useState('comprobando')
  const [errorConexion, setErrorConexion] = useState('')
  const [preferencias, setPreferencias] = useState(leerPreferencias)
  const [toasts, setToasts] = useState([])
  const [modal, setModal] = useState({ abierto: false, incidencia: null })
  const [guardando, setGuardando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const contadorToasts = useRef(0)

  const notificar = useCallback((tipo, mensaje) => {
    contadorToasts.current += 1
    const id = contadorToasts.current
    setToasts((previos) => [...previos.slice(-2), { id, tipo, mensaje }])
    setTimeout(() => {
      setToasts((previos) => previos.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true)
    try {
      const { datos: lista } = await api.listar()
      setDatos(Array.isArray(lista) ? lista : lista?.results || [])
      setConexion('online')
      setErrorConexion('')
    } catch (error) {
      setConexion('offline')
      setErrorConexion(error.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PREFERENCIAS, JSON.stringify(preferencias))
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }, [preferencias])

  // Actualización automática opcional
  useEffect(() => {
    if (!preferencias.autoRefresh) return undefined
    const intervalo = setInterval(() => cargar(true), preferencias.autoRefresh * 1000)
    return () => clearInterval(intervalo)
  }, [preferencias.autoRefresh, cargar])

  // Cerrar el menú móvil con Escape
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape') setSidebarAbierto(false)
    }
    document.addEventListener('keydown', alPresionar)
    return () => document.removeEventListener('keydown', alPresionar)
  }, [])

  // Mantener la vista sincronizada con el hash de la URL
  useEffect(() => {
    const alCambiarHash = () => setVista(vistaDesdeHash())
    window.addEventListener('hashchange', alCambiarHash)
    return () => window.removeEventListener('hashchange', alCambiarHash)
  }, [])

  const pendientes = datos.filter((x) => x.estado === 'pendiente').length

  function navegar(destino) {
    setVista(destino)
    setSidebarAbierto(false)
    if (window.location.hash !== `#${destino}`) {
      window.history.replaceState(null, '', `#${destino}`)
    }
    window.scrollTo({ top: 0, behavior: preferencias.animaciones ? 'smooth' : 'auto' })
  }

  function abrirNueva() {
    setErrorFormulario('')
    setModal({ abierto: true, incidencia: null })
  }

  function abrirEdicion(incidencia) {
    setErrorFormulario('')
    setModal({ abierto: true, incidencia })
  }

  function cerrarModal() {
    if (guardando) return
    setModal({ abierto: false, incidencia: null })
    setErrorFormulario('')
  }

  async function guardar(formulario) {
    setGuardando(true)
    setErrorFormulario('')
    try {
      if (modal.incidencia) {
        await api.actualizar(modal.incidencia.id, formulario)
        notificar('exito', 'Incidencia actualizada correctamente.')
      } else {
        await api.crear(formulario)
        notificar('exito', 'Incidencia registrada correctamente.')
      }
      setModal({ abierto: false, incidencia: null })
      await cargar(true)
    } catch (error) {
      setErrorFormulario(error.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(id, estado) {
    const previos = datos
    setDatos((lista) =>
      lista.map((item) => (item.id === id ? { ...item, estado } : item)),
    )
    try {
      await api.cambiarEstado(id, estado)
      notificar('exito', `Estado actualizado a “${ETIQUETAS[estado]}”.`)
      setConexion('online')
    } catch (error) {
      setDatos(previos)
      notificar('error', error.message)
    }
  }

  async function eliminarIncidencia() {
    if (!porEliminar) return
    setEliminando(true)
    try {
      await api.eliminar(porEliminar.id)
      setDatos((lista) => lista.filter((item) => item.id !== porEliminar.id))
      notificar('exito', `“${porEliminar.titulo}” fue eliminada.`)
      setPorEliminar(null)
    } catch (error) {
      notificar('error', error.message)
    } finally {
      setEliminando(false)
    }
  }

  function cambiarPreferencia(clave, valor) {
    setPreferencias((previas) => ({ ...previas, [clave]: valor }))
  }

  function restablecerPreferencias() {
    setPreferencias(PREFERENCIAS_INICIALES)
    notificar('info', 'Preferencias restablecidas.')
  }

  const cabecera = TITULOS[vista]

  return (
    <div className={`app ${preferencias.animaciones ? '' : 'sin-animaciones'}`}>
      <Sidebar
        vista={vista}
        onNavegar={navegar}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
        total={datos.length}
        pendientes={pendientes}
        conexion={conexion}
      />

      <div className="contenido">
        <Topbar
          titulo={cabecera.titulo}
          descripcion={cabecera.descripcion}
          onMenu={() => setSidebarAbierto(true)}
          onNueva={abrirNueva}
          onRefrescar={() => cargar()}
          cargando={cargando}
        />

        <main className="vista">
          {errorConexion && (
            <div className="alerta error banner" role="alert">
              <IconoAlerta />
              <div>
                <strong>Sin conexión con la API</strong>
                <p>{errorConexion}</p>
              </div>
              <button type="button" className="boton secundario mini" onClick={() => cargar()}>
                Reintentar
              </button>
            </div>
          )}

          {vista === 'dashboard' && (
            <Dashboard
              datos={datos}
              cargando={cargando}
              onNueva={abrirNueva}
              onVerTodas={() => navegar('incidencias')}
            />
          )}

          {vista === 'incidencias' && (
            <Incidencias
              datos={datos}
              cargando={cargando}
              porPagina={preferencias.porPagina}
              onNueva={abrirNueva}
              onEditar={abrirEdicion}
              onEliminar={setPorEliminar}
              onCambiarEstado={cambiarEstado}
              onExportado={(total) =>
                notificar('exito', `CSV generado con ${total} incidencia(s).`)
              }
            />
          )}

          {vista === 'configuracion' && (
            <Configuracion
              preferencias={preferencias}
              onCambiar={cambiarPreferencia}
              onRestablecer={restablecerPreferencias}
            />
          )}
        </main>
      </div>

      {modal.abierto && (
        <IncidenciaForm
          incidencia={modal.incidencia}
          onGuardar={guardar}
          onCerrar={cerrarModal}
          guardando={guardando}
          errorExterno={errorFormulario}
        />
      )}

      {porEliminar && (
        <ConfirmDialog
          titulo="Eliminar incidencia"
          mensaje={`Se eliminará “${porEliminar.titulo}” de forma permanente. Esta acción no se puede deshacer.`}
          onConfirmar={eliminarIncidencia}
          onCancelar={() => !eliminando && setPorEliminar(null)}
          procesando={eliminando}
        />
      )}

      <Toasts items={toasts} onCerrar={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}

function IconoAlerta() {
  return (
    <span className="alerta-icono" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 3.9 2.4 17.4A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3.1L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    </span>
  )
}
