import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Tarjeta from '../componentes/Tarjeta'
import { useArtista } from '../funcionalidades/artistas/hooks'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { obtenerIniciales } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleArtista() {
  const { id = '' } = useParams()
  const idNumerico = Number(id)
  const idValido =
    id.trim().length > 0 && Number.isInteger(idNumerico) && idNumerico > 0

  const consultaArtista = useArtista(idNumerico, idValido)
  const nombreArtista = consultaArtista.data?.stageName ?? ''
  const consultaEventos = useEventosPorArtista(
    nombreArtista,
    Boolean(nombreArtista),
  )

  if (!idValido) {
    return <NoEncontrada />
  }

  if (consultaArtista.isLoading) {
    return <Cargando mensaje="Cargando perfil del artista..." tarjetas={2} />
  }

  if (consultaArtista.isError) {
    if (
      consultaArtista.error instanceof ApiError &&
      consultaArtista.error.status === 404
    ) {
      return <NoEncontrada />
    }
    return (
      <EstadoError
        mensaje={
          consultaArtista.error instanceof Error
            ? consultaArtista.error.message
            : 'No pudimos conectar con el servidor.'
        }
        onReintentar={() => void consultaArtista.refetch()}
      />
    )
  }

  const artista = consultaArtista.data
  if (!artista) {
    return <NoEncontrada />
  }

  return (
    <div className="space-y-8">
      <Link
        to={RUTAS.artistas}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
      >
        ← Artistas
      </Link>

      <Tarjeta className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 font-titulo text-2xl font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          {obtenerIniciales(artista.stageName)}
        </div>
        <div className="space-y-1.5">
          <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
            {artista.stageName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nombre artístico
            {artista.genre ? ` · ${artista.genre}` : ''}
            {artista.country ? ` · ${artista.country}` : ''}
          </p>
          <div>
            <Badge tono="ACTIVA">Activo</Badge>
          </div>
        </div>
      </Tarjeta>

      <section className="space-y-4">
        <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
          Próximos eventos de {artista.stageName}
        </h2>

        {consultaEventos.isLoading ? (
          <Cargando mensaje="Cargando eventos del artista..." tarjetas={2} />
        ) : (consultaEventos.data ?? []).length === 0 ? (
          <EstadoVacio mensaje="Sin eventos próximos" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(consultaEventos.data ?? []).map((ev) => (
              <TarjetaEvento key={ev.eventCode} evento={ev} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
