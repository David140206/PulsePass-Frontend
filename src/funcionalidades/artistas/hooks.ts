import { useQuery } from '@tanstack/react-query'
import {
  obtenerArtistaPorIdApi,
  obtenerArtistaPorNombreApi,
  obtenerArtistasActivosApi,
} from './api'

export function useArtistasActivos() {
  return useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: obtenerArtistasActivosApi,
    staleTime: 300_000,
  })
}

export function useArtista(id: number, habilitado = true) {
  return useQuery({
    queryKey: ['artista', id],
    queryFn: () => obtenerArtistaPorIdApi(id),
    enabled: habilitado && Number.isFinite(id) && id > 0,
    staleTime: 300_000,
  })
}

export function useArtistaPorNombre(stageName: string) {
  return useQuery({
    queryKey: ['artista', 'nombre', stageName],
    queryFn: () => obtenerArtistaPorNombreApi(stageName),
    enabled: Boolean(stageName.trim()),
    staleTime: 300_000,
  })
}
