import Icon from './Icon'

const ICONOS = {
  total: 'incidencias',
  pendiente: 'reloj',
  proceso: 'rayo',
  resuelto: 'checkCirculo',
  alta: 'alerta',
}

export default function StatCard({ variante, etiqueta, valor, detalle, retraso = 0 }) {
  return (
    <article
      className={`stat-card ${variante}`}
      style={{ animationDelay: `${retraso}ms` }}
    >
      <div className="stat-cabecera">
        <span className="stat-icono">
          <Icon nombre={ICONOS[variante]} size={20} />
        </span>
        <span className="stat-etiqueta">{etiqueta}</span>
      </div>
      <strong className="stat-valor">{valor}</strong>
      <span className="stat-detalle">{detalle}</span>
      <span className="stat-brillo" aria-hidden="true" />
    </article>
  )
}
