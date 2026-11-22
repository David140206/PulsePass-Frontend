import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import Badge from '../../../componentes/Badge'
import {
  IconoCalendario,
  IconoCultura,
  IconoDeporte,
  IconoEducacion,
  IconoEstrella,
  IconoMonitor,
  IconoNotaMusical,
  IconoUbicacion,
} from '../../../componentes/Iconos'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { EventCategory, EventStatus } from '../tipos'

export interface EstiloCategoria {
  fondo: string
  texto: string
  Icono: ComponentType<SVGProps<SVGSVGElement>>
}

export const ESTILOS_POR_CATEGORIA: Record<EventCategory, EstiloCategoria> = {
  MUSIC: {
    fondo: 'bg-indigo-100/80 dark:bg-indigo-950/60',
    texto: 'text-indigo-700 dark:text-indigo-300',
    Icono: IconoNotaMusical,
  },
  TECHNOLOGY: {
    fondo: 'bg-sky-100/80 dark:bg-sky-950/60',
    texto: 'text-sky-700 dark:text-sky-300',
    Icono: IconoMonitor,
  },
  SPORTS: {
    fondo: 'bg-emerald-100/80 dark:bg-emerald-950/60',
    texto: 'text-emerald-700 dark:text-emerald-300',
    Icono: IconoDeporte,
  },
  CULTURE: {
    fondo: 'bg-rose-100/80 dark:bg-rose-950/60',
    texto: 'text-rose-700 dark:text-rose-300',
    Icono: IconoCultura,
  },
  EDUCATION: {
    fondo: 'bg-amber-100/80 dark:bg-amber-950/60',
    texto: 'text-amber-800 dark:text-amber-300',
    Icono: IconoEducacion,
  },
  ENTERTAINMENT: {
    fondo: 'bg-purple-100/80 dark:bg-purple-950/60',
    texto: 'text-purple-700 dark:text-purple-300',
    Icono: IconoEstrella,
  },
}

export interface EventoTarjetaDatos {
  eventCode: string
  name: string
  status: EventStatus
  eventDate: string
  category?: EventCategory
  city?: string
  venueName?: string
}

export interface PropsTarjetaEvento {
  evento: EventoTarjetaDatos
}

export default function TarjetaEvento({ evento }: PropsTarjetaEvento) {
  const categoria: EventCategory = evento.category ?? 'MUSIC'
  const config = ESTILOS_POR_CATEGORIA[categoria]
  const IconoCategoria = config.Icono
  const ubicacion = evento.city ?? evento.venueName ?? 'Santa Marta'

  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        className={clsx(
          'flex h-28 items-center justify-center transition-colors',
          config.fondo,
          config.texto,
        )}
      >
        <IconoCategoria className="h-9 w-9" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span
            className={clsx(
              'text-[11px] font-bold tracking-wider uppercase',
              config.texto,
            )}
          >
            {categoria}
          </span>
          <h3 className="mt-1 font-titulo text-base font-bold text-slate-900 group-hover:text-marca-600 dark:text-slate-100 dark:group-hover:text-marca-500">
            {evento.name}
          </h3>

          <div className="mt-2.5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1.5">
              <IconoCalendario className="h-3.5 w-3.5 shrink-0" />
              <span>{formatearFecha(evento.eventDate)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <IconoUbicacion className="h-3.5 w-3.5 shrink-0" />
              <span>{ubicacion}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-1">
          <Badge tono={evento.status} />
        </div>
      </div>
    </Link>
  )
}
