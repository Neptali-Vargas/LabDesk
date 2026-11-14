import Icon from './Icon'

const NAVEGACION = [
  { id: 'dashboard', etiqueta: 'Dashboard', icono: 'dashboard' },
  { id: 'incidencias', etiqueta: 'Incidencias', icono: 'incidencias' },
  { id: 'configuracion', etiqueta: 'Configuración', icono: 'configuracion' },
]

export default function Sidebar({
  vista,
  onNavegar,
  abierto,
  onCerrar,
  total,
  pendientes,
  conexion,
}) {
  return (
    <>
      <aside className={`sidebar ${abierto ? 'abierta' : ''}`} aria-label="Navegación principal">
        <div className="sidebar-marca">
          <span className="logo-lab">LD</span>
          <div>
            <strong>LabDesk</strong>
            <span>Soporte técnico</span>
          </div>
          <button
            type="button"
            className="sidebar-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar menú"
          >
            <Icon nombre="cerrar" size={20} />
          </button>
        </div>

        <div className="sidebar-seccion">Panel</div>

        <nav className="sidebar-nav">
          {NAVEGACION.map((item) => {
            const activo = vista === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activo ? 'activo' : ''}`}
                onClick={() => onNavegar(item.id)}
                aria-current={activo ? 'page' : undefined}
              >
                <Icon nombre={item.icono} size={19} />
                <span>{item.etiqueta}</span>
                {item.id === 'incidencias' && total > 0 && (
                  <span className="nav-contador">{total}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-resumen">
          <div className="sidebar-seccion">Estado del sistema</div>
          <div className={`conexion-chip ${conexion === 'online' ? 'online' : 'offline'}`}>
            <span className="punto" />
            {conexion === 'online' ? 'API conectada' : 'API sin conexión'}
          </div>

          <div className="sidebar-metricas">
            <div>
              <span>Registros</span>
              <strong>{total}</strong>
            </div>
            <div>
              <span>Pendientes</span>
              <strong>{pendientes}</strong>
            </div>
          </div>

          <div className="sidebar-progreso" aria-hidden="true">
            <span style={{ width: `${total ? Math.min(100, (pendientes / total) * 100) : 0}%` }} />
          </div>
          <p className="sidebar-nota">
            {total
              ? `${pendientes} de ${total} incidencias siguen abiertas.`
              : 'Sin incidencias registradas.'}
          </p>
        </div>

        <div className="sidebar-pie">
          <span>LabDesk v1.0</span>
          <span>Django + React</span>
        </div>
      </aside>

      {abierto && (
        <button
          type="button"
          className="sidebar-fondo"
          onClick={onCerrar}
          aria-label="Cerrar menú"
        />
      )}
    </>
  )
}
