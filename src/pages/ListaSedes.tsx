import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import TarjetaSede from '../funcionalidades/sedes/componentes/TarjetaSede'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'

export default function ListaSedes() {
  const consulta = useSedesActivas()

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Sedes
      </h1>

      {consulta.isLoading ? (
        <Cargando mensaje="Cargando sedes..." tarjetas={3} />
      ) : consulta.isError ? (
        <EstadoError
          mensaje={
            consulta.error instanceof Error
              ? consulta.error.message
              : 'No pudimos conectar con el servidor.'
          }
          onReintentar={() => void consulta.refetch()}
        />
      ) : (consulta.data ?? []).length === 0 ? (
        <EstadoVacio mensaje="No hay sedes activas registradas" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(consulta.data ?? []).map((sede) => (
            <TarjetaSede key={sede.code} sede={sede} />
          ))}
        </div>
      )}
    </div>
  )
}
