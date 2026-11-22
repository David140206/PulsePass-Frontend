import { useId, type ReactNode } from 'react'

export interface ColumnaTabla<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

export interface PropsTabla<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveFila: (fila: T) => string | number
  tituloAccesible?: string
  renderTarjetaMovil?: (fila: T) => ReactNode
}

export default function Tabla<T>({
  columnas,
  filas,
  claveFila,
  tituloAccesible = 'Tabla de datos',
  renderTarjetaMovil,
}: PropsTabla<T>) {
  const idCaption = useId()

  return (
    <div>
      {renderTarjetaMovil ? (
        <div className="space-y-3 md:hidden">
          {filas.map((fila) => (
            <div
              key={claveFila(fila)}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {renderTarjetaMovil(fila)}
            </div>
          ))}
        </div>
      ) : null}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby={idCaption}
        className={
          renderTarjetaMovil
            ? 'hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-800 dark:bg-slate-900'
            : 'overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
        }
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption id={idCaption} className="sr-only">
            {tituloAccesible}
          </caption>
          <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {columnas.map((col) => (
                <th key={col.encabezado} scope="col" className="px-4 py-3.5">
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filas.map((fila) => (
              <tr
                key={claveFila(fila)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                {columnas.map((col) => (
                  <td key={col.encabezado} className="px-4 py-3.5 align-middle">
                    {col.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
