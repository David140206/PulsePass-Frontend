export interface PropsCargando {
  mensaje?: string
  tarjetas?: number
}

export default function Cargando({
  mensaje = 'Cargando contenido...',
  tarjetas = 3,
}: PropsCargando) {
  return (
    <div aria-busy="true" aria-label={mensaje} className="space-y-4 py-4">
      <span className="sr-only">{mensaje}</span>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: tarjetas }).map((_, indice) => (
          <div
            key={indice}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 h-28 w-full rounded-xl bg-slate-200/80 dark:bg-slate-800" />
            <div className="mb-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    </div>
  )
}
