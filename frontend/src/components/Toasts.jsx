import Icon from './Icon'

const ICONOS = { exito: 'checkCirculo', error: 'alerta', info: 'chispa' }

export default function Toasts({ items, onCerrar }) {
  if (!items.length) return null

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((toast) => (
        <div key={toast.id} className={`toast ${toast.tipo}`}>
          <span className="toast-icono">
            <Icon nombre={ICONOS[toast.tipo] || 'chispa'} size={18} />
          </span>
          <p>{toast.mensaje}</p>
          <button
            type="button"
            className="toast-cerrar"
            onClick={() => onCerrar(toast.id)}
            aria-label="Cerrar notificación"
          >
            <Icon nombre="cerrar" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
