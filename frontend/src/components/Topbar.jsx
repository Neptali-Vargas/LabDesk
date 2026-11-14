import Icon from './Icon'

const FECHAS = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Topbar({ titulo, descripcion, onMenu, onNueva, onRefrescar, cargando }) {
  return (
    <header className="topbar">
      <div className="topbar-izquierda">
        <button
          type="button"
          className="boton-icono menu-movil"
          onClick={onMenu}
          aria-label="Abrir menú"
        >
          <Icon nombre="menu" size={22} />
        </button>
        <div>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
      </div>

      <div className="topbar-derecha">
        <span className="topbar-fecha">{FECHAS.format(new Date())}</span>
        <button
          type="button"
          className="boton-icono"
          onClick={onRefrescar}
          aria-label="Actualizar datos"
          title="Actualizar datos"
        >
          <Icon nombre="actualizar" size={19} className={cargando ? 'girando' : ''} />
        </button>
        <button type="button" className="boton primario" onClick={onNueva}>
          <Icon nombre="mas" size={18} />
          <span>Nueva incidencia</span>
        </button>
      </div>
    </header>
  )
}
