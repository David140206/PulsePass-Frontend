import { Link } from 'react-router'
import Badge from '../../../componentes/Badge'
import { IconoUbicacion } from '../../../componentes/Iconos'
import { RUTAS } from '../../../lib/rutas'
import type { VenueResponse } from '../tipos'

export interface PropsTarjetaSede {
  sede: VenueResponse
}

export default function TarjetaSede({ sede }: PropsTarjetaSede) {
  return (
    <Link
      to={RUTAS.sede(sede.code)}
      className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
          {sede.name}
        </h2>
        <Badge tono="ACTIVA">Activa</Badge>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <IconoUbicacion className="h-3.5 w-3.5 shrink-0" />
        <span>
          {sede.city} · Cap. {sede.capacity}
        </span>
      </p>
    </Link>
  )
}
