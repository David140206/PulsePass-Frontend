import { forwardRef, useId, type ComponentProps, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAlerta } from './Iconos'

export interface PropsCampo extends ComponentProps<'input'> {
  etiqueta: string
  error?: string
  ayuda?: string
  elementoDerecha?: ReactNode
  ocultarEtiqueta?: boolean
}

const Campo = forwardRef<HTMLInputElement, PropsCampo>(function Campo(
  {
    etiqueta,
    error,
    ayuda,
    elementoDerecha,
    ocultarEtiqueta = false,
    id,
    className,
    ...resto
  },
  ref,
) {
  const idGenerado = useId()
  const idCampo = id ?? idGenerado
  const idAyuda = `${idCampo}-ayuda`
  const idError = `${idCampo}-error`

  const descriptores = [ayuda ? idAyuda : null, error ? idError : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idCampo}
        className={clsx(
          'text-xs font-medium text-slate-700 dark:text-slate-300',
          ocultarEtiqueta && 'sr-only',
        )}
      >
        {etiqueta}
      </label>

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={idCampo}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={descriptores.length > 0 ? descriptores : undefined}
          className={clsx(
            'min-h-[44px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900 dark:text-slate-100',
            error
              ? 'border-red-500 focus-visible:outline-red-600'
              : 'border-slate-300 dark:border-slate-700',
            elementoDerecha ? 'pr-11' : '',
            className,
          )}
          {...resto}
        />
        {elementoDerecha ? (
          <div className="absolute right-2.5 flex items-center">{elementoDerecha}</div>
        ) : null}
      </div>

      {ayuda ? (
        <p id={idAyuda} className="text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      ) : null}

      {error ? (
        <p
          id={idError}
          role="alert"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <IconoAlerta className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
})

export default Campo
