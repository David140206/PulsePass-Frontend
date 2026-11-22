import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import clsx from 'clsx'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import {
  IconoCalendario,
  IconoSede,
  IconoUsuario,
} from '../componentes/Iconos'
import Modal from '../componentes/Modal'
import Tarjeta from '../componentes/Tarjeta'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { ESTILOS_POR_CATEGORIA } from '../funcionalidades/eventos/componentes/TarjetaEvento'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { useComprarTicket } from '../funcionalidades/tickets/hooks'
import {
  SeleccionTipoTicketSchema,
  TicketTypeSchema,
  type SeleccionTipoTicketForm,
  type TicketType,
} from '../funcionalidades/tickets/tipos'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const TIPOS_ENTRADA: TicketType[] = TicketTypeSchema.options

export default function DetalleEvento() {
  const { eventCode = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { sesion, tieneRol } = useAuth()

  const consultaEvento = useEvento(eventCode)
  const mutacionCompra = useComprarTicket()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [errorCompra, setErrorCompra] = useState<string | null>(null)

  const { register, watch, handleSubmit } = useForm<SeleccionTipoTicketForm>({
    resolver: zodResolver(SeleccionTipoTicketSchema),
    defaultValues: {
      type: 'GENERAL',
    },
  })

  const tipoSeleccionado = watch('type')

  if (consultaEvento.isLoading) {
    return <Cargando mensaje="Cargando detalle del evento..." tarjetas={2} />
  }

  if (consultaEvento.isError) {
    const err = consultaEvento.error
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.status === 403 || err.status === 401)
    ) {
      return (
        <EstadoVacio
          mensaje="Evento no disponible"
          descripcion="El evento que buscas no existe o aún no se encuentra publicado."
          accion={
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700"
            >
              Volver a la cartelera
            </Link>
          }
        />
      )
    }

    return (
      <EstadoError
        mensaje={
          err instanceof Error ? err.message : 'No pudimos conectar con el servidor.'
        }
        onReintentar={() => void consultaEvento.refetch()}
      />
    )
  }

  const evento = consultaEvento.data
  if (!evento) {
    return <EstadoVacio mensaje="Evento no disponible" />
  }

  const categoria = evento.category ?? 'MUSIC'
  const estiloCat = ESTILOS_POR_CATEGORIA[categoria]
  const IconoCat = estiloCat.Icono
  const esPublicado = evento.status === 'PUBLISHED'
  const esOperadorSinCompra =
    sesion.estado === 'autenticado' &&
    !tieneRol('USER') &&
    tieneRol('STAFF', 'ADMIN')

  const abrirFlujoCompra = () => {
    if (!esPublicado) return
    if (sesion.estado !== 'autenticado') {
      void navigate(RUTAS.login, { state: { desde: location.pathname } })
      return
    }
    setErrorCompra(null)
    setModalAbierto(true)
  }

  const confirmarCompra = async () => {
    if (sesion.estado !== 'autenticado') {
      void navigate(RUTAS.login, { state: { desde: location.pathname } })
      return
    }
    setErrorCompra(null)
    try {
      const ticket = await mutacionCompra.mutateAsync({
        userEmail: sesion.usuario.email,
        eventCode: evento.eventCode,
        type: tipoSeleccionado,
      })
      setModalAbierto(false)
      void navigate(RUTAS.confirmacionCompra(ticket.ticketCode))
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorCompra(err.message)
      } else {
        setErrorCompra('No se pudo completar la compra. Inténtalo más tarde.')
      }
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        to={RUTAS.eventos}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
      >
        ← Volver a la cartelera
      </Link>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Tarjeta className="overflow-hidden p-0 lg:col-span-2">
          <div
            className={clsx(
              'flex h-48 items-center justify-center',
              estiloCat.fondo,
              estiloCat.texto,
            )}
          >
            <IconoCat className="h-14 w-14" />
          </div>

          <div className="space-y-6 p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    'text-xs font-bold tracking-wider uppercase',
                    estiloCat.texto,
                  )}
                >
                  {categoria}
                </span>
                <Badge tono={evento.status} />
              </div>

              <h1 className="mt-2 font-titulo text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
                {evento.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <IconoCalendario className="h-4 w-4" />
                  <span>{formatearFechaHora(evento.eventDate)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconoUsuario className="h-4 w-4" />
                  <span>Edad mínima: {evento.minimumAge ?? 0}</span>
                </span>
              </div>
            </div>

            {evento.description ? (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {evento.description}
              </p>
            ) : null}

            <div className="space-y-3">
              <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
                Artistas
              </h2>
              {evento.artists && evento.artists.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {evento.artists.map((artista) => (
                    <AvatarArtista
                      key={artista.id}
                      artista={artista}
                      variante="chip"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Artistas por confirmar.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
                Sede
              </h2>
              <Link
                to={RUTAS.sede(evento.venueCode ?? 'VEN-SMR-01')}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-500">
                  <IconoSede className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {evento.venueName ?? evento.venueCode ?? 'Marina Convention Center'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {evento.city ?? 'Santa Marta'}
                    {evento.venueCapacity !== undefined
                      ? ` · Capacidad ${evento.venueCapacity}`
                      : ''}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </Tarjeta>

        {!esOperadorSinCompra ? (
          <Tarjeta className="space-y-4">
            <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
              Entradas
            </h2>

            <form
              onSubmit={handleSubmit(() => abrirFlujoCompra())}
              className="space-y-4"
            >
              <fieldset className="space-y-2.5">
                <legend className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  Tipo de entrada
                </legend>
                {TIPOS_ENTRADA.map((tipo) => {
                  const activo = tipoSeleccionado === tipo
                  return (
                    <label
                      key={tipo}
                      className={clsx(
                        'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors',
                        activo
                          ? 'border-marca-600 bg-marca-50/70 text-slate-900 dark:border-marca-500 dark:bg-indigo-950/40 dark:text-slate-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                      )}
                    >
                      <input
                        type="radio"
                        value={tipo}
                        disabled={!esPublicado}
                        {...register('type')}
                        className="h-4 w-4"
                      />
                      <span>{tipo}</span>
                    </label>
                  )
                })}
              </fieldset>

              <Boton
                type="submit"
                variante="primario"
                disabled={!esPublicado}
                className="w-full"
              >
                Comprar entrada
              </Boton>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {esPublicado
                  ? 'El precio lo define el sistema al confirmar.'
                  : 'La venta de entradas no está habilitada para este evento.'}
              </p>
            </form>
          </Tarjeta>
        ) : null}
      </div>

      {!esOperadorSinCompra ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
          <Boton
            variante="primario"
            disabled={!esPublicado}
            onClick={abrirFlujoCompra}
            className="w-full"
          >
            Comprar entrada
          </Boton>
        </div>
      ) : null}

      <Modal
        abierto={modalAbierto}
        titulo="Confirmar compra"
        onCerrar={() => setModalAbierto(false)}
      >
        <div className="space-y-4">
          <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Evento</dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-100">
                {evento.name}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-100">
                {tipoSeleccionado}
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">Cuenta</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {sesion.estado === 'autenticado' ? sesion.usuario.email : ''}
              </dd>
            </div>
          </dl>

          {errorCompra ? (
            <Aviso tipo="error" rol="alert">
              {errorCompra}
            </Aviso>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Boton
              variante="secundario"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              cargando={mutacionCompra.isPending}
              onClick={() => void confirmarCompra()}
            >
              Confirmar
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
