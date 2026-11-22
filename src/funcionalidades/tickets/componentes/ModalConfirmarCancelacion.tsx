import { useState } from 'react'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import { ApiError } from '../../../lib/http'
import { useCancelarTicket } from '../hooks'
import type { TicketResponse } from '../tipos'

export interface PropsModalConfirmarCancelacion {
  ticket: TicketResponse | null
  abierto: boolean
  onCerrar: () => void
  onCancelado?: (ticketActualizado: TicketResponse) => void
}

export default function ModalConfirmarCancelacion({
  ticket,
  abierto,
  onCerrar,
  onCancelado,
}: PropsModalConfirmarCancelacion) {
  const mutacionCancelar = useCancelarTicket()
  const [errorModal, setErrorModal] = useState<string | null>(null)

  const manejarCerrar = () => {
    setErrorModal(null)
    onCerrar()
  }

  const manejarConfirmar = async () => {
    if (!ticket) return
    setErrorModal(null)
    try {
      const actualizado = await mutacionCancelar.mutateAsync(ticket.ticketCode)
      onCancelado?.(actualizado)
      manejarCerrar()
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorModal(err.message)
      } else {
        setErrorModal('No se pudo cancelar el ticket en este momento.')
      }
    }
  }

  return (
    <Modal abierto={abierto} titulo="Cancelar ticket" onCerrar={manejarCerrar}>
      {ticket ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ¿Quieres cancelar el ticket{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {ticket.ticketCode}
            </span>{' '}
            ({ticket.type}) de{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {ticket.eventName}
            </span>
            ?
          </p>

          {errorModal ? (
            <Aviso tipo="error" rol="alert">
              {errorModal}
            </Aviso>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Boton variante="secundario" onClick={manejarCerrar} autoFocus>
              Volver
            </Boton>
            <Boton
              variante="peligro"
              cargando={mutacionCancelar.isPending}
              onClick={() => void manejarConfirmar()}
            >
              Cancelar ticket
            </Boton>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
