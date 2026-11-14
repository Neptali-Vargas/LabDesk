import Icon from '../components/Icon'
import StatCard from '../components/StatCard'
import {
  ETIQUETAS,
  formatearFecha,
  fechaRelativa,
  porcentaje,
  resumirIncidencia,
} from '../utils'

const COLORES_ESTADO = {
  pendiente: '#f59e0b',
  en_proceso: '#3b82f6',
  resuelto: '#22c55e',
}

const COLORES_CATEGORIA = {
  hardware: '#111111',
  software: '#c9ced6',
  red: '#f5c518',
}

function saludo() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Dashboard({ datos, cargando, onNueva, onVerTodas }) {
  const total = datos.length
  const pendientes = datos.filter((x) => x.estado === 'pendiente').length
  const enProceso = datos.filter((x) => x.estado === 'en_proceso').length
  const resueltas = datos.filter((x) => x.estado === 'resuelto').length
  const abiertas = pendientes + enProceso
  const altaSinResolver = datos.filter(
    (x) => x.prioridad === 'alta' && x.estado !== 'resuelto',
  ).length
  const prioridadAlta = datos.filter((x) => x.prioridad === 'alta').length

  const porEstado = [
    { clave: 'pendiente', valor: pendientes },
    { clave: 'en_proceso', valor: enProceso },
    { clave: 'resuelto', valor: resueltas },
  ]

  const porCategoria = ['hardware', 'software', 'red'].map((clave) => ({
    clave,
    valor: datos.filter((x) => x.categoria === clave).length,
  }))

  const recientes = [...datos]
    .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
    .slice(0, 5)

  // Barra apilada de categorías (sin degradados)
  const segmentos = total
    ? porCategoria
        .filter((item) => item.valor > 0)
        .map((item) => ({
          ...item,
          porcentaje: (item.valor / total) * 100,
        }))
    : []

  return (
    <div className="vista-dashboard">
      <section className="hero">
        <div className="hero-texto">
          <span className="hero-eyebrow">
            <Icon nombre="chispa" size={15} /> Resumen operativo
          </span>
          <h2>
            {saludo()}, equipo de soporte <span aria-hidden="true">👋</span>
          </h2>
          <p>
            {total
              ? `Tienes ${abiertas} incidencia${abiertas === 1 ? '' : 's'} abierta${
                  abiertas === 1 ? '' : 's'
                } de ${total} registradas. Aquí está el estado del laboratorio.`
              : 'Aún no hay incidencias registradas. Crea la primera para empezar a monitorear el laboratorio.'}
          </p>
          <div className="hero-acciones">
            <button type="button" className="boton primario" onClick={onNueva}>
              <Icon nombre="mas" size={18} />
              Registrar incidencia
            </button>
            <button type="button" className="boton secundario" onClick={onVerTodas}>
              Ver incidencias
              <Icon nombre="derecha" size={17} />
            </button>
          </div>
        </div>
        <div className="hero-ilustracion" aria-hidden="true">
          <div className="hero-anillo" />
          <div className="hero-tarjeta">
            <span className="hero-tarjeta-icono">
              <Icon nombre="escudo" size={22} />
            </span>
            <div>
              <strong>{porcentaje(resueltas, total)}%</strong>
              <span>tasa de resolución</span>
            </div>
          </div>
          <div className="hero-tarjeta secundaria">
            <span className="hero-tarjeta-icono azul">
              <Icon nombre="rayo" size={20} />
            </span>
            <div>
              <strong>{enProceso}</strong>
              <span>en atención ahora</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicadores generales">
        <StatCard
          variante="total"
          etiqueta="Total de incidencias"
          valor={total}
          detalle="Registros en la base de datos"
          retraso={0}
        />
        <StatCard
          variante="pendiente"
          etiqueta="Pendientes"
          valor={pendientes}
          detalle={`${porcentaje(pendientes, total)}% del total`}
          retraso={60}
        />
        <StatCard
          variante="proceso"
          etiqueta="En proceso"
          valor={enProceso}
          detalle="Atención en curso"
          retraso={120}
        />
        <StatCard
          variante="resuelto"
          etiqueta="Resueltas"
          valor={resueltas}
          detalle={`${porcentaje(resueltas, total)}% del total`}
          retraso={180}
        />
        <StatCard
          variante="alta"
          etiqueta="Prioridad alta"
          valor={prioridadAlta}
          detalle={`${altaSinResolver} sin resolver`}
          retraso={240}
        />
      </section>

      {altaSinResolver > 0 && (
        <section className="aviso-alta">
          <span className="aviso-icono">
            <Icon nombre="alerta" size={20} />
          </span>
          <div>
            <strong>
              {altaSinResolver} incidencia{altaSinResolver === 1 ? '' : 's'} de
              prioridad alta sin resolver
            </strong>
            <p>Conviene atenderlas primero para cumplir el tiempo de respuesta.</p>
          </div>
          <button type="button" className="boton mini secundario" onClick={onVerTodas}>
            Revisar
            <Icon nombre="derecha" size={15} />
          </button>
        </section>
      )}

      <section className="paneles-grid">
        <article className="panel">
          <div className="panel-cabecera">
            <div>
              <h3>Distribución por estado</h3>
              <p>Cómo se reparten las {total} incidencias</p>
            </div>
            <span className="panel-icono">
              <Icon nombre="barras" size={18} />
            </span>
          </div>

          <div className="barras">
            {porEstado.map((item) => (
              <div key={item.clave} className="barra-fila">
                <div className="barra-info">
                  <span className={`punto-estado ${item.clave}`} />
                  <span>{ETIQUETAS[item.clave]}</span>
                  <strong>{item.valor}</strong>
                </div>
                <div className="barra-pista">
                  <span
                    className={`barra-relleno ${item.clave}`}
                    style={{ width: `${total ? (item.valor / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="barra-porcentaje">{porcentaje(item.valor, total)}%</span>
              </div>
            ))}
          </div>

          <div className="panel-pie">
            <Icon nombre="checkCirculo" size={15} />
            {total
              ? `${resueltas} cerradas · ${abiertas} por atender`
              : 'Sin datos todavía'}
          </div>
        </article>

        <article className="panel">
          <div className="panel-cabecera">
            <div>
              <h3>Incidencias por categoría</h3>
              <p>Origen del problema reportado</p>
            </div>
            <span className="panel-icono">
              <Icon nombre="etiqueta" size={18} />
            </span>
          </div>

          <div className="apilado">
            <div className="apilado-barra">
              {segmentos.map((item) => (
                <span
                  key={item.clave}
                  className="apilado-segmento"
                  style={{
                    width: `${item.porcentaje}%`,
                    background: COLORES_CATEGORIA[item.clave],
                  }}
                  title={`${ETIQUETAS[item.clave]}: ${item.valor}`}
                />
              ))}
            </div>

            <ul className="leyenda">
              {porCategoria.map((item) => (
                <li key={item.clave}>
                  <span
                    className="leyenda-punto"
                    style={{ background: COLORES_CATEGORIA[item.clave] }}
                  />
                  <span className="leyenda-nombre">{ETIQUETAS[item.clave]}</span>
                  <strong>{item.valor}</strong>
                  <span className="leyenda-porcentaje">
                    {porcentaje(item.valor, total)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="panel tabla-panel">
        <div className="panel-cabecera">
          <div>
            <h3>Actividad reciente</h3>
            <p>Las últimas incidencias registradas</p>
          </div>
          <button type="button" className="enlace" onClick={onVerTodas}>
            Ver todas
            <Icon nombre="derecha" size={15} />
          </button>
        </div>

        {cargando ? (
          <p className="estado-carga">Cargando actividad…</p>
        ) : recientes.length === 0 ? (
          <div className="estado-vacio">
            <Icon nombre="bandeja" size={34} />
            <p>Todavía no hay movimientos. Registra la primera incidencia.</p>
            <button type="button" className="boton primario mini" onClick={onNueva}>
              <Icon nombre="mas" size={16} /> Nueva incidencia
            </button>
          </div>
        ) : (
          <ul className="recientes">
            {recientes.map((item) => (
              <li key={item.id}>
                <span className={`reciente-icono cat-${item.categoria}`}>
                  <Icon nombre="incidencias" size={17} />
                </span>
                <div className="reciente-texto">
                  <strong>{item.titulo}</strong>
                  <p>{resumirIncidencia(item)}</p>
                </div>
                <span className={`pastilla prioridad ${item.prioridad}`}>
                  {ETIQUETAS[item.prioridad]}
                </span>
                <span className={`pastilla estado ${item.estado}`}>
                  {ETIQUETAS[item.estado]}
                </span>
                <span className="reciente-fecha" title={formatearFecha(item.creado_en)}>
                  {fechaRelativa(item.creado_en)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
