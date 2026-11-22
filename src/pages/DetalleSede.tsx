import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import Tarjeta from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleSede() {
  const { code = '' } = useParams()
  const consulta = useSede(code)

  if (consulta.isLoading) {
    return <Cargando mensaje="Cargando detalle de la sede..." tarjetas={1} />
  }

  if (consulta.isError) {
    if (consulta.error instanceof ApiError && consulta.error.status === 404) {
      return <NoEncontrada />
    }
    return (
      <EstadoError
        mensaje={
          consulta.error instanceof Error
            ? consulta.error.message
            : 'No pudimos conectar con el servidor.'
        }
        onReintentar={() => void consulta.refetch()}
      />
    )
  }

  const sede = consulta.data
  if (!sede) {
    return <NoEncontrada />
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        to={RUTAS.sedes}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
      >
        ← Sedes
      </Link>

      <Tarjeta className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            {sede.name}
          </h1>
          <Badge tono="ACTIVA">Activa</Badge>
        </div>

        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Código</dt>
            <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {sede.code}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Ciudad</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {sede.city}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Capacidad</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {sede.capacity} personas
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Estado</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {sede.active === false ? 'Inactiva' : 'Activa'}
            </dd>
          </div>
        </dl>
      </Tarjeta>
    </div>
  )
}
