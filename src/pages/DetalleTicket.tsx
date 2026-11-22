import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoCopiar } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { formatearFechaHora } from '../lib/formato'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function DetalleTicket() {
  const { ticketCode = '' } = useParams()
  const { sesion } = useAuth()
  const consulta = useTicket(ticketCode)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [copiado, setCopiado] = useState(false)

  if (consulta.isLoading) {
    return <Cargando mensaje="Cargando detalle del ticket..." tarjetas={1} />
  }

  if (consulta.isError) {
    const err = consulta.error
    if (
      err instanceof ApiError &&
      (err.status === 403 || err.status === 404)
    ) {
      return (
        <EstadoVacio
          mensaje="Ticket no disponible"
          descripcion="No encontramos este ticket o no pertenece a tu cuenta."
          accion={
            <Link
              to={RUTAS.misTickets}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700"
            >
              Volver a mis tickets
            </Link>
          }
        />
      )
    }

    return (
      <EstadoError
        mensaje={
          err instanceof Error
            ? err.message
            : 'No pudimos conectar con el servidor.'
        }
        onReintentar={() => void consulta.refetch()}
      />
    )
  }

  const ticket = consulta.data
  if (!ticket) {
    return <EstadoVacio mensaje="Ticket no disponible" />
  }

  const titular =
    ticket.userFullName ??
    (sesion.estado === 'autenticado' ? sesion.usuario.username : ticket.userEmail)

  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ticketCode)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Ignorar si clipboard no está disponible
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        to={RUTAS.misTickets}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
      >
        ← Mis tickets
      </Link>

      <Tarjeta className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            {ticket.eventName}
          </h1>
          <Badge tono={ticket.status} />
        </div>

        <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Código</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {ticket.ticketCode}
              </span>
              <button
                type="button"
                onClick={() => void copiarCodigo()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <IconoCopiar className="h-3.5 w-3.5" />
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Tipo</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              {ticket.type}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Precio</dt>
            <dd className="font-semibold text-slate-900 dark:text-slate-100">
              <PrecioCOP valor={ticket.price} />
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Comprado el</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {formatearFechaHora(ticket.purchaseDate)}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">Titular</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {titular}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Presenta este código en el ingreso.
        </p>
      </Tarjeta>

      {ticket.status === 'PAID' ? (
        <div className="flex justify-end">
          <Boton variante="peligro" onClick={() => setModalCancelar(true)}>
            Cancelar ticket
          </Boton>
        </div>
      ) : null}

      <ModalConfirmarCancelacion
        ticket={ticket}
        abierto={modalCancelar}
        onCerrar={() => setModalCancelar(false)}
      />
    </div>
  )
}
