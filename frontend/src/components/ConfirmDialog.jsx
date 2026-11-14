import Icon from './Icon'

export default function ConfirmDialog({ titulo, mensaje, onConfirmar, onCancelar, procesando }) {
  return (
    <div className="modal-fondo" role="presentation" onClick={onCancelar}>
      <div
        className="modal confirmar"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="confirmar-icono">
          <Icon nombre="alerta" size={26} />
        </span>
        <h2 id="confirmar-titulo">{titulo}</h2>
        <p>{mensaje}</p>
        <div className="modal-acciones">
          <button type="button" className="boton secundario" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button type="button" className="boton peligro" onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
