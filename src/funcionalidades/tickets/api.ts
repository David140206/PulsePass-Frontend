import { peticionHttp } from '../../lib/http'
import {
  ListaTicketsSchema,
  TicketResponseSchema,
  type PurchaseTicketRequest,
  type TicketResponse,
} from './tipos'

export function comprarTicketApi(datos: PurchaseTicketRequest): Promise<TicketResponse> {
  return peticionHttp('/api/tickets', {
    metodo: 'POST',
    cuerpo: datos,
    esquema: TicketResponseSchema,
  })
}

export function obtenerTicketPorCodigoApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(`/api/tickets/${encodeURIComponent(ticketCode)}`, {
    metodo: 'GET',
    esquema: TicketResponseSchema,
  })
}

export function obtenerTicketsPorUsuarioApi(email: string): Promise<TicketResponse[]> {
  return peticionHttp(`/api/tickets/by-user?email=${encodeURIComponent(email)}`, {
    metodo: 'GET',
    esquema: ListaTicketsSchema,
  })
}

export function obtenerTicketsPagadosPorEventoApi(
  eventCode: string,
): Promise<TicketResponse[]> {
  return peticionHttp(
    `/api/events/${encodeURIComponent(eventCode)}/tickets/paid`,
    {
      metodo: 'GET',
      esquema: ListaTicketsSchema,
    },
  )
}

export function cancelarTicketApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(`/api/tickets/${encodeURIComponent(ticketCode)}/cancel`, {
    metodo: 'PATCH',
    esquema: TicketResponseSchema,
  })
}

export function usarTicketApi(ticketCode: string): Promise<TicketResponse> {
  return peticionHttp(`/api/tickets/${encodeURIComponent(ticketCode)}/use`, {
    metodo: 'PATCH',
    esquema: TicketResponseSchema,
  })
}
