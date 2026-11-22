import { Link, useSearchParams } from 'react-router'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Selector from '../componentes/Selector'
import {
   useArtistaPorNombre,
  useArtistasActivos,
} from '../funcionalidades/artistas/hooks'
import TarjetaEvento from '../funcionalidades/eventos/componentes/TarjetaEvento'
import {
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/hooks'
import { EventCategorySchema } from '../funcionalidades/eventos/tipos'
import { RUTAS } from '../lib/rutas'

const CATEGORIAS = EventCategorySchema.options

export default function CatalogoEventos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const artista = searchParams.get('artista') ?? ''

  const consultaPublicados = useEventosPublicados()
  const consultaPorArtista = useEventosPorArtista(artista, Boolean(artista))
  const consultaArtistas = useArtistasActivos()
  useArtistaPorNombre(artista)

  const actualizarParametro = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(searchParams)
    if (valor.trim()) {
      nuevos.set(clave, valor)
    } else {
      nuevos.delete(clave)
    }
    setSearchParams(nuevos, { replace: true })
  }

  const limpiarFiltros = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const usandoPorArtista = Boolean(artista.trim())
  const cargando = usandoPorArtista
    ? consultaPorArtista.isLoading
    : consultaPublicados.isLoading
  const hayError = usandoPorArtista
    ? consultaPorArtista.isError
    : consultaPublicados.isError
  const errorObj = usandoPorArtista
    ? consultaPorArtista.error
    : consultaPublicados.error

  const listaBase = usandoPorArtista
    ? (consultaPorArtista.data ?? [])
    : (consultaPublicados.data ?? [])

  const eventosFiltrados = listaBase.filter((evento) => {
    const coincideTexto = q.trim()
      ? evento.name.toLowerCase().includes(q.trim().toLowerCase()) ||
        evento.eventCode.toLowerCase().includes(q.trim().toLowerCase())
      : true
    const coincideCategoria = categoria
      ? (evento.category ?? 'MUSIC') === categoria
      : true
    return coincideTexto && coincideCategoria
  })

  const hayFiltrosActivos = Boolean(q.trim() || categoria || artista)

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Cartelera
      </h1>

      <search aria-label="Filtrar eventos">
        <div className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
          <Campo
            etiqueta="Buscar por nombre"
            type="search"
            placeholder="Buscar por nombre..."
            value={q}
            onChange={(e) => actualizarParametro('q', e.target.value)}
          />

          <Selector
            etiqueta="Categoría"
            value={categoria}
            onChange={(e) => actualizarParametro('categoria', e.target.value)}
            opciones={[
              { valor: '', etiqueta: 'Todas' },
              ...CATEGORIAS.map((cat) => ({ valor: cat, etiqueta: cat })),
            ]}
          />

          <Selector
            etiqueta="Artista"
            value={artista}
            onChange={(e) => actualizarParametro('artista', e.target.value)}
            opciones={[
              { valor: '', etiqueta: 'Todos' },
              ...(consultaArtistas.data ?? []).map((a) => ({
                valor: a.stageName,
                etiqueta: a.stageName,
              })),
            ]}
          />

          <div className="flex items-end">
            <Boton
              variante="secundario"
              onClick={limpiarFiltros}
              className="w-full sm:w-auto"
            >
              Limpiar
            </Boton>
          </div>
        </div>
      </search>

      {!cargando && !hayError ? (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {eventosFiltrados.length}{' '}
          {eventosFiltrados.length === 1 ? 'evento' : 'eventos'}
        </p>
      ) : null}

      {cargando ? (
        <Cargando mensaje="Cargando cartelera de eventos..." tarjetas={6} />
      ) : hayError ? (
        <EstadoError
          mensaje={
            errorObj instanceof Error
              ? errorObj.message
              : 'No pudimos conectar con el servidor.'
          }
          onReintentar={() =>
            void (usandoPorArtista
              ? consultaPorArtista.refetch()
              : consultaPublicados.refetch())
          }
        />
      ) : listaBase.length === 0 && !hayFiltrosActivos ? (
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
      ) : eventosFiltrados.length === 0 ? (
        <EstadoVacio
          mensaje="Sin resultados para tu búsqueda"
          accion={
            <Boton variante="secundario" onClick={limpiarFiltros}>
              Limpiar filtros
            </Boton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventosFiltrados.map((evento) => (
            <TarjetaEvento key={evento.eventCode} evento={evento} />
          ))}
        </div>
      )}
    </div>
  )
}
