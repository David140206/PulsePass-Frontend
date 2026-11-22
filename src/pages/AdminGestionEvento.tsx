import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import {
  useAsociarArtista,
  useEvento,
  usePublicarEvento,
} from '../funcionalidades/eventos/hooks'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function AdminGestionEvento() {
  const { eventCode = '' } = useParams()
  const { registrarEventoSesion } = useAuth()

  const consultaEvento = useEvento(eventCode)
  const consultaArtistas = useArtistasActivos()
  const mutacionPublicar = usePublicarEvento()
  const mutacionAsociar = useAsociarArtista()

  const [artistaSeleccionado, setArtistaSeleccionado] = useState('')
  const [avisoOperacion, setAvisoOperacion] = useState<{
    tipo: 'exito' | 'error'
    mensaje: string
  } | null>(null)

  if (consultaEvento.isLoading) {
    return <Cargando mensaje="Cargando gestión del evento..." tarjetas={2} />
  }

  if (consultaEvento.isError) {
    if (
      consultaEvento.error instanceof ApiError &&
      consultaEvento.error.status === 404
    ) {
      return <EstadoVacio mensaje="Evento no disponible" />
    }
    return (
      <EstadoError
        mensaje={
          consultaEvento.error instanceof Error
            ? consultaEvento.error.message
            : 'No pudimos cargar el evento.'
        }
        onReintentar={() => void consultaEvento.refetch()}
      />
    )
  }

  const evento = consultaEvento.data
  if (!evento) {
    return <EstadoVacio mensaje="Evento no disponible" />
  }

  const artistasDisponibles = consultaArtistas.data ?? []

  const manejarPublicar = async () => {
    setAvisoOperacion(null)
    try {
      const actualizado = await mutacionPublicar.mutateAsync(evento.eventCode)
      registrarEventoSesion({
        eventCode: actualizado.eventCode,
        name: actualizado.name,
        status: actualizado.status,
      })
      setAvisoOperacion({
        tipo: 'exito',
        mensaje: 'Evento publicado correctamente.',
      })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAvisoOperacion({ tipo: 'error', mensaje: err.message })
      } else {
        setAvisoOperacion({
          tipo: 'error',
          mensaje: 'No se pudo publicar el evento.',
        })
      }
    }
  }

  const manejarAsociarArtista = async (e: FormEvent) => {
    e.preventDefault()
    setAvisoOperacion(null)
    const idElegido =
      Number(artistaSeleccionado) || (artistasDisponibles[0]?.id ?? 0)
    if (!idElegido) return
    try {
      await mutacionAsociar.mutateAsync({
        eventCode: evento.eventCode,
        artistId: idElegido,
      })
      setAvisoOperacion({
        tipo: 'exito',
        mensaje: 'Artista asociado al evento.',
      })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAvisoOperacion({ tipo: 'error', mensaje: err.message })
      } else {
        setAvisoOperacion({
          tipo: 'error',
          mensaje: 'No se pudo asociar el artista.',
        })
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={RUTAS.adminEventos}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
      >
        ← Eventos
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
            {evento.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-medium">{evento.eventCode}</span> ·{' '}
            {evento.category ?? 'MUSIC'} · {formatearFechaHora(evento.eventDate)}{' '}
            · Mín. {evento.minimumAge ?? 0} ·{' '}
            {evento.venueName ?? evento.venueCode ?? 'Marina Convention Center'}
          </p>
        </div>
        <Badge tono={evento.status} />
      </div>

      {avisoOperacion ? (
        <Aviso
          tipo={avisoOperacion.tipo}
          rol={avisoOperacion.tipo === 'error' ? 'alert' : 'status'}
          onCerrar={() => setAvisoOperacion(null)}
        >
          {avisoOperacion.mensaje}
        </Aviso>
      ) : null}

      <Tarjeta className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
            Publicación
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            El evento es visible al público una vez publicado.
          </p>
        </div>
        <Boton
          variante="primario"
          disabled={evento.status !== 'DRAFT'}
          cargando={mutacionPublicar.isPending}
          onClick={() => void manejarPublicar()}
        >
          Publicar evento
        </Boton>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
          Artistas asociados
        </h2>

        {(evento.artists ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {(evento.artists ?? []).map((art) => (
              <AvatarArtista key={art.id} artista={art} variante="chip" />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aún no hay artistas asociados a este evento.
          </p>
        )}

        <form
          onSubmit={(e) => void manejarAsociarArtista(e)}
          className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Selector
              etiqueta="Agregar artista"
              value={artistaSeleccionado}
              onChange={(e) => setArtistaSeleccionado(e.target.value)}
              opciones={artistasDisponibles.map((a) => ({
                valor: String(a.id),
                etiqueta: a.stageName,
              }))}
            />
          </div>
          <Boton
            type="submit"
            variante="secundario"
            cargando={mutacionAsociar.isPending}
            disabled={artistasDisponibles.length === 0}
          >
            + Asociar
          </Boton>
        </form>
      </Tarjeta>

      <div>
        <Link
          to={RUTAS.staffTicketsPagados(evento.eventCode)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
        >
          Tickets pagados →
        </Link>
      </div>
    </div>
  )
}
