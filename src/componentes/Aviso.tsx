import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAlerta, IconoCheck, IconoCerrar } from './Iconos'

export type TipoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const estilosAviso: Record<TipoAviso, string> = {
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200',
  advertencia:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200',
  info: 'border-indigo-200 bg-marca-50 text-marca-700 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-200',
}

export interface PropsAviso {
  tipo?: TipoAviso
  children: ReactNode
  onCerrar?: () => void
  className?: string
  rol?: 'alert' | 'status'
}

export default function Aviso({
  tipo = 'info',
  children,
  onCerrar,
  className,
  rol,
}: PropsAviso) {
  const rolFinal = rol ?? (tipo === 'error' || tipo === 'advertencia' ? 'alert' : 'status')

  return (
    <div
      role={rolFinal}
      aria-live={rolFinal === 'alert' ? 'assertive' : 'polite'}
      className={clsx(
        'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
        estilosAviso[tipo],
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        {tipo === 'exito' ? (
          <IconoCheck className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div>{children}</div>
      </div>

      {onCerrar ? (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="rounded-md p-1 opacity-75 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          <IconoCerrar className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
