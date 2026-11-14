import { useCallback, useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { BASE_API, api } from '../api'

const INTERVALOS = [
  { valor: 0, etiqueta: 'Desactivada' },
  { valor: 15, etiqueta: 'Cada 15 segundos' },
  { valor: 30, etiqueta: 'Cada 30 segundos' },
  { valor: 60, etiqueta: 'Cada minuto' },
]

const FILAS = [5, 8, 10, 15, 25]

export default function Configuracion({ preferencias, onCambiar, onRestablecer }) {
  const [prueba, setPrueba] = useState({ estado: 'cargando', ms: null, total: null, mensaje: '' })

  const probarConexion = useCallback(async () => {
    setPrueba({ estado: 'cargando', ms: null, total: null, mensaje: '' })
    try {
      const { datos, ms } = await api.ping()
      setPrueba({
        estado: 'ok',
        ms,
        total: Array.isArray(datos) ? datos.length : 0,
        mensaje: 'El backend respondió correctamente.',
      })
    } catch (error) {
      setPrueba({
        estado: 'error',
        ms: null,
        total: null,
        mensaje: error.message,
      })
    }
  }, [])

  useEffect(() => {
    probarConexion()
  }, [probarConexion])

  return (
    <div className="vista-config">
      <section className="panel">
        <div className="panel-cabecera">
          <div>
            <h3>Conexión con el backend</h3>
            <p>Estado de la API de Django REST Framework</p>
          </div>
          <button
            type="button"
            className="boton secundario mini"
            onClick={probarConexion}
            disabled={prueba.estado === 'cargando'}
          >
            <Icon
              nombre="actualizar"
              size={15}
              className={prueba.estado === 'cargando' ? 'girando' : ''}
            />
            Probar conexión
          </button>
        </div>

        <div className="config-grid">
          <div className="config-item ancho">
            <span className="campo-etiqueta">Endpoint de la API</span>
            <code className="codigo-endpoint">{BASE_API}</code>
          </div>

          <div className="config-item">
            <span className="campo-etiqueta">Estado</span>
            <span className={`estado-conexion ${prueba.estado}`}>
              <span className="punto" />
              {prueba.estado === 'ok'
                ? 'Conectado'
                : prueba.estado === 'error'
                  ? 'Sin conexión'
                  : 'Comprobando…'}
            </span>
          </div>

          <div className="config-item">
            <span className="campo-etiqueta">Latencia</span>
            <strong className="config-valor">
              {prueba.ms !== null ? `${prueba.ms} ms` : '—'}
            </strong>
          </div>

          <div className="config-item">
            <span className="campo-etiqueta">Registros en SQLite</span>
            <strong className="config-valor">
              {prueba.total !== null ? prueba.total : '—'}
            </strong>
          </div>
        </div>

        {prueba.mensaje && (
          <p className={`config-mensaje ${prueba.estado}`}>
            <Icon nombre={prueba.estado === 'error' ? 'alerta' : 'checkCirculo'} size={16} />
            {prueba.mensaje}
          </p>
        )}
      </section>

      <section className="panel">
        <div className="panel-cabecera">
          <div>
            <h3>Preferencias de la interfaz</h3>
            <p>Se guardan en este navegador</p>
          </div>
          <span className="panel-icono">
            <Icon nombre="ajustes" size={18} />
          </span>
        </div>

        <div className="preferencias">
          <div className="preferencia">
            <div>
              <strong>Filas por página</strong>
              <p>Cuántas incidencias mostrar en la tabla.</p>
            </div>
            <select
              value={preferencias.porPagina}
              onChange={(e) => onCambiar('porPagina', Number(e.target.value))}
              aria-label="Filas por página"
            >
              {FILAS.map((n) => (
                <option key={n} value={n}>
                  {n} filas
                </option>
              ))}
            </select>
          </div>

          <div className="preferencia">
            <div>
              <strong>Actualización automática</strong>
              <p>Vuelve a consultar la API cada cierto tiempo.</p>
            </div>
            <select
              value={preferencias.autoRefresh}
              onChange={(e) => onCambiar('autoRefresh', Number(e.target.value))}
              aria-label="Actualización automática"
            >
              {INTERVALOS.map((i) => (
                <option key={i.valor} value={i.valor}>
                  {i.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div className="preferencia">
            <div>
              <strong>Animaciones</strong>
              <p>Transiciones y microinteracciones sutiles.</p>
            </div>
            <label className="interruptor">
              <input
                type="checkbox"
                checked={preferencias.animaciones}
                onChange={(e) => onCambiar('animaciones', e.target.checked)}
              />
              <span className="interruptor-pista">
                <span className="interruptor-bola" />
              </span>
              <span className="interruptor-texto">
                {preferencias.animaciones ? 'Activadas' : 'Desactivadas'}
              </span>
            </label>
          </div>
        </div>

        <div className="config-acciones">
          <button type="button" className="boton secundario mini" onClick={onRestablecer}>
            <Icon nombre="actualizar" size={15} />
            Restablecer preferencias
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-cabecera">
          <div>
            <h3>Acerca de LabDesk</h3>
            <p>Sistema de gestión de incidencias del laboratorio</p>
          </div>
          <span className="panel-icono">
            <Icon nombre="escudo" size={18} />
          </span>
        </div>

        <div className="stack-grid">
          <div className="stack-item">
            <span className="stack-icono react">
              <Icon nombre="monitor" size={18} />
            </span>
            <div>
              <strong>React + Vite</strong>
              <span>Interfaz, estado y consumo de la API</span>
            </div>
          </div>
          <div className="stack-item">
            <span className="stack-icono django">
              <Icon nombre="servidor" size={18} />
            </span>
            <div>
              <strong>Django REST Framework</strong>
              <span>Modelos, validaciones y endpoints CRUD</span>
            </div>
          </div>
          <div className="stack-item">
            <span className="stack-icono sqlite">
              <Icon nombre="barras" size={18} />
            </span>
            <div>
              <strong>SQLite</strong>
              <span>Persistencia local de las incidencias</span>
            </div>
          </div>
        </div>

        <p className="config-nota">
          Este entorno es académico y local. Para producción harían falta autenticación,
          permisos por rol, validaciones adicionales y despliegue seguro.
        </p>
      </section>
    </div>
  )
}
