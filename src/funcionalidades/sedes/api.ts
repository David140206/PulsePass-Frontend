import { peticionHttp } from '../../lib/http'
import { ListaVenuesSchema, VenueResponseSchema, type VenueResponse } from './tipos'

export function obtenerSedesActivasApi(): Promise<VenueResponse[]> {
  return peticionHttp('/api/venues/active', {
    metodo: 'GET',
    esquema: ListaVenuesSchema,
  })
}

export function obtenerSedePorCodigoApi(code: string): Promise<VenueResponse> {
  return peticionHttp(`/api/venues/${encodeURIComponent(code)}`, {
    metodo: 'GET',
    esquema: VenueResponseSchema,
  })
}
