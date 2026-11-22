import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

export default function Inicio() {
  const { sesion } = useAuth()
  const consultaEventos = useEventosPublicados()
  const consultaArtistas = useArtistasActivos()

  const proximosEventos = (consultaEventos.data ?? []).slice(0, 3)
  const artistasDestacados = (consultaArtistas.data ?? []).slice(0, 6)

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-linear-to-r from-marca-600 to-acento-500 px-6 py-12 text-white shadow-md sm:px-12 sm:py-16">
        <div className="max-w-xl space-y-4">
          <h1 className="font-titulo text-3xl font-bold tracking-tight sm:text-4xl">
            Descubre los mejores eventos
          </h1>
          <p className="text-sm text-indigo-100 sm:text-base">
            Música, cultura, deporte y tecnología en un solo lugar.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-marca-700 shadow-xs hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver cartelera
            </Link>
            {sesion.estado !== 'autenticado' ? (
              <Link
                to={RUTAS.registro}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Crear cuenta
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
            Próximos eventos
          </h2>
          <Link
            to={RUTAS.eventos}
            className="text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
          >
            Ver todos →
          </Link>
        </div>

        {consultaEventos.isLoading ? (
          <Cargando mensaje="Cargando próximos eventos..." tarjetas={3} />
        ) : consultaEventos.isError ? (
          <EstadoError
            mensaje={
              consultaEventos.error instanceof Error
                ? consultaEventos.error.message
                : 'No pudimos conectar con el servidor.'
            }
            onReintentar={() => void consultaEventos.refetch()}
          />
        ) : proximosEventos.length === 0 ? (
          <EstadoVacio
            mensaje="Aún no hay eventos publicados"
            accion={
              <Link
                to={RUTAS.artistas}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Ver artistas
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proximosEventos.map((ev) => (
              <TarjetaEvento key={ev.eventCode} evento={ev} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
            Artistas destacados
          </h2>
          <Link
            to={RUTAS.artistas}
            className="text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
          >
            Ver todos →
          </Link>
        </div>

        {consultaArtistas.isLoading ? (
          <div className="flex gap-4">
            <span className="h-9 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="h-9 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ) : artistasDestacados.length > 0 ? (
          <div className="flex flex-wrap items-center gap-5">
            {artistasDestacados.map((art) => (
              <AvatarArtista key={art.id} artista={art} variante="chip" />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
