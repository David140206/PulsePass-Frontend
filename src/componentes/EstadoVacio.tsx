import type { ReactNode } from 'react'
import { IconoCajaVacia } from './Iconos'

export interface PropsEstadoVacio {
  mensaje: string
  descripcion?: string
  accion?: ReactNode
}

export default function EstadoVacio({ mensaje, descripcion, accion }: PropsEstadoVacio) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <IconoCajaVacia className="h-6 w-6" />
      </div>
      <h2 className="font-titulo text-base font-semibold text-slate-900 dark:text-slate-100">
        {mensaje}
      </h2>
      {descripcion ? (
        <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {descripcion}
        </p>
      ) : null}
      {accion ? <div className="mt-4">{accion}</div> : null}
    </div>
  )
}
