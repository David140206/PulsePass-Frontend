import { peticionHttp } from '../../lib/http'
import {
  EventResponseSchema,
  ListaEventosDetalleSchema,
  ListaEventosResumenSchema,
  type CreateEventRequest,
  type EventResponse,
  type EventSummaryResponse,
} from './tipos'

function normalizarFechaIsoLocal(fecha: string): string {
  const limpia = fecha.trim()
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(limpia)) {
    return `${limpia}:00`
  }
  return limpia
}

export function obtenerEventosPublicadosApi(): Promise<EventSummaryResponse[]> {
  return peticionHttp('/api/events/published', {
    metodo: 'GET',
    esquema: ListaEventosResumenSchema,
  })
}

export function obtenerEventoPorCodigoApi(eventCode: string): Promise<EventResponse> {
  return peticionHttp(`/api/events/${encodeURIComponent(eventCode)}`, {
    metodo: 'GET',
    esquema: EventResponseSchema,
  })
}

export function obtenerEventosPorArtistaApi(stageName: string): Promise<EventResponse[]> {
  return peticionHttp(
    `/api/events/by-artist?stageName=${encodeURIComponent(stageName)}`,
    {
      metodo: 'GET',
      esquema: ListaEventosDetalleSchema,
    },
  )
}

export function crearEventoApi(datos: CreateEventRequest): Promise<EventResponse> {
  return peticionHttp('/api/events', {
    metodo: 'POST',
    cuerpo: {
      ...datos,
      eventDate: normalizarFechaIsoLocal(datos.eventDate),
    },
    esquema: EventResponseSchema,
  })
}

export function publicarEventoApi(eventCode: string): Promise<EventResponse> {
  return peticionHttp(`/api/events/${encodeURIComponent(eventCode)}/publish`, {
    metodo: 'PATCH',
    esquema: EventResponseSchema,
  })
}

export function asociarArtistaEventoApi(
  eventCode: string,
  artistId: number,
): Promise<EventResponse> {
  return peticionHttp(
    `/api/events/${encodeURIComponent(eventCode)}/artists/${artistId}`,
    {
      metodo: 'POST',
      esquema: EventResponseSchema,
    },
  )
}
