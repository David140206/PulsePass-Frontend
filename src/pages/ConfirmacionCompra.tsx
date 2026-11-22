import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { IconoCheck } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode = '' } = useParams()
  const consulta = useTicket(ticketCode)

  if (consulta.isLoading) {
    return <Cargando mensaje="Confirmando tu compra..." tarjetas={1} />
  }

  if (consulta.isError) {
    const err = consulta.error
    if (
      err instanceof ApiError &&
      (err.status === 403 || err.status === 404)
    ) {
      return <EstadoVacio mensaje="Ticket no disponible" />
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

  return (
    <div className="mx-auto max-w-md py-8">
      <Tarjeta className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <IconoCheck className="h-6 w-6" />
        </div>

        <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
          ¡Compra realizada con éxito!
        </h1>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {ticket.eventName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ticket{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {ticket.ticketCode}
            </span>{' '}
            · {ticket.type} · <PrecioCOP valor={ticket.price} />
          </p>
          <div className="pt-1">
            <Badge tono={ticket.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to={RUTAS.misTickets}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-4 py-2 text-xs font-semibold text-white hover:bg-marca-700"
          >
            Ver mis tickets
          </Link>
          <Link
            to={RUTAS.eventos}
            className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Seguir explorando
          </Link>
        </div>
      </Tarjeta>
    </div>
  )
}
