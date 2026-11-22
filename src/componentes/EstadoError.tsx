import Aviso from './Aviso'
import Boton from './Boton'

export interface PropsEstadoError {
  mensaje?: string
  onReintentar?: () => void
}

export default function EstadoError({
  mensaje = 'No pudimos conectar con el servidor.',
  onReintentar,
}: PropsEstadoError) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <Aviso tipo="error">{mensaje}</Aviso>
      </div>
      {onReintentar ? (
        <div className="mt-4">
          <Boton variante="primario" onClick={onReintentar}>
            Reintentar
          </Boton>
        </div>
      ) : null}
    </div>
  )
}
