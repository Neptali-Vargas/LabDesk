import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import {
  ESTADOS,
  ETIQUETAS,
  ORDEN_PRIORIDAD,
  exportarCSV,
  formatearFecha,
  resumirIncidencia,
} from '../utils'

const ORDENES = [
  { valor: 'recientes', etiqueta: 'Más recientes' },
  { valor: 'antiguas', etiqueta: 'Más antiguas' },
  { valor: 'prioridad', etiqueta: 'Prioridad alta' },
  { valor: 'titulo', etiqueta: 'Título (A-Z)' },
]

export default function Incidencias({
  datos,
  cargando,
  porPagina,
  onNueva,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onExportado,
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [orden, setOrden] = useState('recientes')
  const [pagina, setPagina] = useState(1)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return datos.filter((item) => {
      const coincideTexto =
        !texto ||
        `${item.titulo} ${item.descripcion}`.toLowerCase().includes(texto)
      const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado
      const coincidePrioridad =
        filtroPrioridad === 'todas' || item.prioridad === filtroPrioridad
      return coincideTexto && coincideEstado && coincidePrioridad
    })
  }, [datos, busqueda, filtroEstado, filtroPrioridad])

  const ordenadas = useMemo(() => {
    const copia = [...filtradas]
    switch (orden) {
      case 'antiguas':
        return copia.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en))
      case 'prioridad':
        return copia.sort(
          (a, b) =>
            ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad] ||
            new Date(b.creado_en) - new Date(a.creado_en),
        )
      case 'titulo':
        return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
      default:
        return copia.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
    }
  }, [filtradas, orden])

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * porPagina
  const visibles = ordenadas.slice(inicio, inicio + porPagina)

  useEffect(() => {
    setPagina(1)
  }, [busqueda, filtroEstado, filtroPrioridad, orden, porPagina])

  const hayFiltros =
    busqueda !== '' || filtroEstado !== 'todos' || filtroPrioridad !== 'todas'

  function limpiar() {
    setBusqueda('')
    setFiltroEstado('todos')
    setFiltroPrioridad('todas')
    setOrden('recientes')
  }

  function exportar() {
    const total = exportarCSV(ordenadas)
    onExportado?.(total)
  }

  return (
    <div className="vista-incidencias">
      <section className="toolbar panel">
        <div className="buscador">
          <Icon nombre="buscar" size={18} />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título o descripción…"
            aria-label="Buscar incidencias"
          />
          {busqueda && (
            <button
              type="button"
              className="buscador-limpiar"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
            >
              <Icon nombre="cerrar" size={15} />
            </button>
          )}
        </div>

        <div className="filtros">
          <label className="select-envoltorio">
            <Icon nombre="filtro" size={16} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETAS[estado]}
                </option>
              ))}
            </select>
          </label>

          <label className="select-envoltorio">
            <Icon nombre="alerta" size={16} />
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              aria-label="Filtrar por prioridad"
            >
              <option value="todas">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </label>

          <label className="select-envoltorio">
            <Icon nombre="abajo" size={16} />
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              aria-label="Ordenar incidencias"
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          {hayFiltros && (
            <button type="button" className="boton secundario mini" onClick={limpiar}>
              <Icon nombre="cerrar" size={15} />
              Limpiar
            </button>
          )}

          <button
            type="button"
            className="boton secundario mini"
            onClick={exportar}
            disabled={ordenadas.length === 0}
            title="Descargar las incidencias filtradas en formato CSV"
          >
            <Icon nombre="descargar" size={15} />
            Exportar CSV
          </button>
        </div>
      </section>

      <section className="panel tabla-panel">
        <div className="panel-cabecera tabla-cabecera">
          <div>
            <h3>Listado de incidencias</h3>
            <p>
              {ordenadas.length} de {datos.length} registros
              {hayFiltros ? ' (filtrados)' : ''}
            </p>
          </div>
          <button type="button" className="boton primario mini solo-escritorio" onClick={onNueva}>
            <Icon nombre="mas" size={16} />
            Nueva incidencia
          </button>
        </div>

        {cargando ? (
          <p className="estado-carga">Cargando incidencias…</p>
        ) : visibles.length === 0 ? (
          <div className="estado-vacio">
            <Icon nombre="bandeja" size={36} />
            <p>
              {datos.length === 0
                ? 'Aún no hay incidencias registradas.'
                : 'Ningún registro coincide con la búsqueda o los filtros.'}
            </p>
            {hayFiltros ? (
              <button type="button" className="boton secundario mini" onClick={limpiar}>
                Quitar filtros
              </button>
            ) : (
              <button type="button" className="boton primario mini" onClick={onNueva}>
                <Icon nombre="mas" size={16} /> Registrar la primera
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Incidencia</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Prioridad</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Registrada</th>
                    <th scope="col" className="col-acciones">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Incidencia" className="celda-titulo">
                        <strong>{item.titulo}</strong>
                        <span>{resumirIncidencia(item)}</span>
                      </td>
                      <td data-label="Categoría">
                        <span className={`pastilla categoria ${item.categoria}`}>
                          {ETIQUETAS[item.categoria]}
                        </span>
                      </td>
                      <td data-label="Prioridad">
                        <span className={`pastilla prioridad ${item.prioridad}`}>
                          <span className="punto-prioridad" />
                          {ETIQUETAS[item.prioridad]}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <div className={`estado-select ${item.estado}`}>
                          <span className="punto-estado" />
                          <select
                            value={item.estado}
                            onChange={(e) => onCambiarEstado(item.id, e.target.value)}
                            aria-label={`Cambiar estado de ${item.titulo}`}
                          >
                            {ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {ETIQUETAS[estado]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td data-label="Registrada" className="celda-fecha">
                        {formatearFecha(item.creado_en)}
                      </td>
                      <td data-label="Acciones" className="celda-acciones">
                        <button
                          type="button"
                          className="boton-icono accion editar"
                          onClick={() => onEditar(item)}
                          title="Editar incidencia"
                          aria-label={`Editar ${item.titulo}`}
                        >
                          <Icon nombre="editar" size={17} />
                        </button>
                        <button
                          type="button"
                          className="boton-icono accion eliminar"
                          onClick={() => onEliminar(item)}
                          title="Eliminar incidencia"
                          aria-label={`Eliminar ${item.titulo}`}
                        >
                          <Icon nombre="eliminar" size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="paginacion">
              <span className="paginacion-info">
                Mostrando <strong>{inicio + 1}</strong>–
                <strong>{Math.min(inicio + porPagina, ordenadas.length)}</strong> de{' '}
                <strong>{ordenadas.length}</strong>
              </span>
              <div className="paginacion-botones">
                <button
                  type="button"
                  className="boton-icono"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                >
                  <Icon nombre="izquierda" size={18} />
                </button>
                <span className="paginacion-pagina">
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  type="button"
                  className="boton-icono"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  aria-label="Página siguiente"
                >
                  <Icon nombre="derecha" size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
