import type { ComponentProps } from 'react'
import clsx from 'clsx'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

export interface PropsBoton extends ComponentProps<'button'> {
  variante?: VarianteBoton
  cargando?: boolean
}

const clasesPorVariante: Record<VarianteBoton, string> = {
  primario:
    'bg-marca-600 text-white hover:bg-marca-700 disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500',
  secundario:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
  peligro:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-200 disabled:text-red-500',
  fantasma:
    'bg-transparent text-marca-600 hover:bg-marca-50 dark:text-marca-500 dark:hover:bg-slate-800 disabled:opacity-50',
}

export default function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  className,
  type = 'button',
  children,
  ...resto
}: PropsBoton) {
  const deshabilitado = Boolean(disabled) || cargando

  return (
    <button
      type={type}
      disabled={deshabilitado}
      className={clsx(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
        clasesPorVariante[variante],
        className,
      )}
      {...resto}
    >
      {cargando ? 'Cargando...' : children}
    </button>
  )
}
