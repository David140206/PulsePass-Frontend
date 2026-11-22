import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'

export default function ListaArtistas() {
  const consulta = useArtistasActivos()

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Artistas
      </h1>

      {consulta.isLoading ? (
        <Cargando mensaje="Cargando artistas..." tarjetas={3} />
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
        <EstadoVacio mensaje="No hay artistas activos en este momento" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(consulta.data ?? []).map((artista) => (
            <AvatarArtista
              key={artista.id}
              artista={artista}
              variante="tarjeta"
            />
          ))}
        </div>
      )}
    </div>
  )
}
