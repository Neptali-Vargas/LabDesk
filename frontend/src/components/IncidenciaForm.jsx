import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { CATEGORIAS, ESTADOS, ETIQUETAS, PRIORIDADES } from '../utils'

const VACIO = {
  titulo: '',
  descripcion: '',
  categoria: 'hardware',
  prioridad: 'media',
  estado: 'pendiente',
}

const ICONO_CATEGORIA = { hardware: 'monitor', software: 'barras', red: 'wifi' }
const ICONO_PRIORIDAD = { alta: 'alerta', media: 'rayo', baja: 'bandeja' }
const ICONO_ESTADO = { pendiente: 'reloj', en_proceso: 'rayo', resuelto: 'checkCirculo' }

function Segmentado({ etiqueta, opciones, valor, iconos, onCambiar }) {
  return (
    <div className="campo">
      <span className="campo-etiqueta">{etiqueta}</span>
      <div className="segmentado" role="group" aria-label={etiqueta}>
        {opciones.map((opcion) => (
          <button
            key={opcion}
            type="button"
            className={`segmento ${valor === opcion ? 'activo' : ''} opcion-${opcion}`}
            onClick={() => onCambiar(opcion)}
            aria-pressed={valor === opcion}
          >
            <Icon nombre={iconos[opcion]} size={15} />
            {ETIQUETAS[opcion]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function IncidenciaForm({
  incidencia,
  onGuardar,
  onCerrar,
  guardando,
  errorExterno,
}) {
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const refTitulo = useRef(null)
  const esEdicion = Boolean(incidencia)

  useEffect(() => {
    setForm(
      incidencia
        ? {
            titulo: incidencia.titulo,
            descripcion: incidencia.descripcion,
            categoria: incidencia.categoria,
            prioridad: incidencia.prioridad,
            estado: incidencia.estado,
          }
        : VACIO,
    )
    setErrores({})
  }, [incidencia])

  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape' && !guardando) onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    const temporizador = setTimeout(() => refTitulo.current?.focus(), 80)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      clearTimeout(temporizador)
    }
  }, [onCerrar, guardando])

  function actualizar(campo, valor) {
    setForm((previo) => ({ ...previo, [campo]: valor }))
    setErrores((previo) => ({ ...previo, [campo]: undefined }))
  }

  function enviar(e) {
    e.preventDefault()
    const nuevos = {}
    if (form.titulo.trim().length < 4) {
      nuevos.titulo = 'Escribe un título de al menos 4 caracteres.'
    }
    if (form.descripcion.trim().length < 10) {
      nuevos.descripcion = 'Describe el problema con al menos 10 caracteres.'
    }
    if (Object.keys(nuevos).length) {
      setErrores(nuevos)
      return
    }
    onGuardar({
      ...form,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
    })
  }

  return (
    <div className="modal-fondo" role="presentation" onClick={() => !guardando && onCerrar()}>
      <div
        className="modal formulario-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <div>
            <span className="modal-eyebrow">{esEdicion ? 'Actualizar registro' : 'Nuevo registro'}</span>
            <h2 id="form-titulo">
              {esEdicion ? 'Editar incidencia' : 'Registrar incidencia'}
            </h2>
          </div>
          <button
            type="button"
            className="boton-icono"
            onClick={onCerrar}
            aria-label="Cerrar formulario"
            disabled={guardando}
          >
            <Icon nombre="cerrar" size={20} />
          </button>
        </div>

        <form className="formulario" onSubmit={enviar} noValidate>
          <label className={`campo ${errores.titulo ? 'con-error' : ''}`}>
            <span className="campo-etiqueta">
              Título <em>*</em>
            </span>
            <input
              ref={refTitulo}
              value={form.titulo}
              onChange={(e) => actualizar('titulo', e.target.value)}
              maxLength={120}
              placeholder="Ej. La PC del laboratorio 2 no enciende"
              aria-invalid={Boolean(errores.titulo)}
            />
            <span className="campo-pie">
              <span className="campo-error">{errores.titulo}</span>
              <span className="campo-contador">{form.titulo.length}/120</span>
            </span>
          </label>

          <label className={`campo ${errores.descripcion ? 'con-error' : ''}`}>
            <span className="campo-etiqueta">
              Descripción <em>*</em>
            </span>
            <textarea
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              rows={4}
              placeholder="Detalla el problema, el equipo afectado y lo que ya se intentó."
              aria-invalid={Boolean(errores.descripcion)}
            />
            <span className="campo-pie">
              <span className="campo-error">{errores.descripcion}</span>
            </span>
          </label>

          <Segmentado
            etiqueta="Categoría"
            opciones={CATEGORIAS}
            valor={form.categoria}
            iconos={ICONO_CATEGORIA}
            onCambiar={(valor) => actualizar('categoria', valor)}
          />

          <Segmentado
            etiqueta="Prioridad"
            opciones={PRIORIDADES}
            valor={form.prioridad}
            iconos={ICONO_PRIORIDAD}
            onCambiar={(valor) => actualizar('prioridad', valor)}
          />

          <Segmentado
            etiqueta="Estado"
            opciones={ESTADOS}
            valor={form.estado}
            iconos={ICONO_ESTADO}
            onCambiar={(valor) => actualizar('estado', valor)}
          />

          {errorExterno && (
            <div className="alerta error" role="alert">
              <Icon nombre="alerta" size={18} />
              <span>{errorExterno}</span>
            </div>
          )}

          <div className="modal-acciones">
            <button
              type="button"
              className="boton secundario"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button type="submit" className="boton primario" disabled={guardando}>
              {guardando ? (
                <>
                  <span className="spinner" /> Guardando…
                </>
              ) : (
                <>
                  <Icon nombre={esEdicion ? 'check' : 'mas'} size={18} />
                  {esEdicion ? 'Guardar cambios' : 'Crear incidencia'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
