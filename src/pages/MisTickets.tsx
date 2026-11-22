import { useState } from 'react'
import { Link } from 'react-router'
import clsx from 'clsx'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import ModalConfirmarCancelacion from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { TicketResponse, TicketStatus } from '../funcionalidades/tickets/tipos'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

type FiltroChip = 'TODOS' | TicketStatus

const CHIPS: Array<{ id: FiltroChip; etiqueta: string }> = [
  { id: 'TODOS', etiqueta: 'Todos' },
  { id: 'PAID', etiqueta: 'Pagados' },
  { id: 'USED', etiqueta: 'Usados' },
  { id: 'CANCELLED', etiqueta: 'Cancelados' },
]

export default function MisTickets() {
  const { sesion } = useAuth()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const consulta = useMisTickets(email)

  const [filtro, setFiltro] = useState<FiltroChip>('TODOS')
  const [ticketParaCancelar, setTicketParaCancelar] =
    useState<TicketResponse | null>(null)

  if (consulta.isLoading) {
    return <Cargando mensaje="Cargando tus tickets..." tarjetas={2} />
  }

  if (consulta.isError) {
    return (
      <EstadoError
        mensaje={
          consulta.error instanceof Error
            ? consulta.error.message
            : 'No pudimos conectar con el servidor.'
        }
        onReintentar={() => void consulta.refetch()}
      />
    )
  }

  const tickets = consulta.data ?? []
  const filtrados =
    filtro === 'TODOS'
      ? tickets
      : tickets.filter((t) => t.status === filtro)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Mis tickets
      </h1>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        {CHIPS.map((chip) => {
          const activo = filtro === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(chip.id)}
              className={clsx(
                'min-h-[38px] rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
                activo
                  ? 'bg-marca-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              {chip.etiqueta}
            </button>
          )
        })}
      </div>

      {tickets.length === 0 ? (
        <EstadoVacio
          mensaje="Aún no tienes tickets"
          accion={
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700"
            >
              Explorar cartelera
            </Link>
          }
        />
      ) : filtrados.length === 0 ? (
        <EstadoVacio mensaje="No hay tickets en este estado" />
      ) : (
        <div className="space-y-4">
          {filtrados.map((ticket) => (
            <Tarjeta key={ticket.ticketCode} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
                    {ticket.eventName}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                      {ticket.ticketCode}
                    </span>{' '}
                    · {ticket.type} · <PrecioCOP valor={ticket.price} /> ·{' '}
                    {formatearFecha(ticket.purchaseDate)}
                  </p>
                </div>
                <Badge tono={ticket.status} />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Link
                  to={RUTAS.detalleTicket(ticket.ticketCode)}
                  className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  Ver detalle
                </Link>
                {ticket.status === 'PAID' ? (
                  <Boton
                    variante="peligro"
                    onClick={() => setTicketParaCancelar(ticket)}
                    className="min-h-[40px] px-3.5 py-2 text-xs"
                  >
                    Cancelar
                  </Boton>
                ) : null}
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      <ModalConfirmarCancelacion
        ticket={ticketParaCancelar}
        abierto={Boolean(ticketParaCancelar)}
        onCerrar={() => setTicketParaCancelar(null)}
      />
    </div>
  )
}
