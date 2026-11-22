import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import PrecioCOP from '../componentes/PrecioCOP'
import Tabla from '../componentes/Tabla'
import {
  useTicketsPagadosPorEvento,
  useUsarTicket,
} from '../funcionalidades/tickets/hooks'
import type { TicketResponse } from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode = 'CMF-2026' } = useParams()
  const navigate = useNavigate()
  const [codigoInput, setCodigoInput] = useState(eventCode)
  const [avisoAccion, setAvisoAccion] = useState<{
    tipo: 'exito' | 'error'
    mensaje: string
  } | null>(null)

  const consulta = useTicketsPagadosPorEvento(eventCode)
  const mutacionUsar = useUsarTicket()

  const cambiarEvento = (e: FormEvent) => {
    e.preventDefault()
    const limpio = codigoInput.trim()
    if (!limpio) return
    void navigate(RUTAS.staffTicketsPagados(limpio))
  }

  const usarDesdeLista = async (ticketCode: string) => {
    setAvisoAccion(null)
    try {
      await mutacionUsar.mutateAsync(ticketCode)
      setAvisoAccion({
        tipo: 'exito',
        mensaje: `Ticket ${ticketCode} marcado como usado.`,
      })
      void consulta.refetch()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setAvisoAccion({ tipo: 'error', mensaje: err.message })
      } else {
        setAvisoAccion({
          tipo: 'error',
          mensaje: 'No se pudo marcar el ticket como usado.',
        })
      }
    }
  }

  const tickets = consulta.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tickets pagados · {eventCode}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total: {tickets.length}
          </p>
        </div>

        <form onSubmit={cambiarEvento} className="flex items-end gap-2">
          <Campo
            etiqueta="Evento"
            type="text"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            className="font-mono"
          />
          <Boton type="submit" variante="secundario">
            Ir
          </Boton>
        </form>
      </div>

      {avisoAccion ? (
        <Aviso
          tipo={avisoAccion.tipo}
          onCerrar={() => setAvisoAccion(null)}
        >
          {avisoAccion.mensaje}
        </Aviso>
      ) : null}

      {consulta.isLoading ? (
        <Cargando mensaje="Cargando tickets pagados..." tarjetas={2} />
      ) : consulta.isError ? (
        <EstadoError
          mensaje={
            consulta.error instanceof Error
              ? consulta.error.message
              : 'No pudimos cargar los tickets pagados.'
          }
          onReintentar={() => void consulta.refetch()}
        />
      ) : tickets.length === 0 ? (
        <EstadoVacio mensaje="No hay tickets pagados" />
      ) : (
        <Tabla<TicketResponse>
          tituloAccesible={`Tickets pagados de ${eventCode}`}
          filas={tickets}
          claveFila={(fila) => fila.ticketCode}
          columnas={[
            {
              encabezado: 'Código',
              celda: (f) => (
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                  {f.ticketCode}
                </span>
              ),
            },
            {
              encabezado: 'Tipo',
              celda: (f) => f.type,
            },
            {
              encabezado: 'Titular',
              celda: (f) => f.userFullName ?? f.userEmail,
            },
            {
              encabezado: 'Precio',
              celda: (f) => <PrecioCOP valor={f.price} />,
            },
            {
              encabezado: 'Estado',
              celda: (f) => <Badge tono={f.status} />,
            },
            {
              encabezado: 'Acción',
              celda: (f) => (
                <Boton
                  variante="primario"
                  onClick={() => void usarDesdeLista(f.ticketCode)}
                  disabled={mutacionUsar.isPending}
                  className="min-h-[36px] px-3 py-1.5 text-xs"
                >
                  Usar
                </Boton>
              ),
            },
          ]}
          renderTarjetaMovil={(f) => (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                  {f.ticketCode}
                </span>
                <Badge tono={f.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {f.type} · {f.userFullName ?? f.userEmail} ·{' '}
                <PrecioCOP valor={f.price} />
              </p>
              <Boton
                variante="primario"
                onClick={() => void usarDesdeLista(f.ticketCode)}
                disabled={mutacionUsar.isPending}
                className="w-full"
              >
                Usar
              </Boton>
            </div>
          )}
        />
      )}
    </div>
  )
}
