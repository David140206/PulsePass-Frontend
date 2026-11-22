import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asociarArtistaEventoApi,
  crearEventoApi,
  obtenerEventoPorCodigoApi,
  obtenerEventosPorArtistaApi,
  obtenerEventosPublicadosApi,
  publicarEventoApi,
} from './api'
import type { CreateEventRequest } from './tipos'

export function useEventosPublicados() {
  return useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: obtenerEventosPublicadosApi,
    staleTime: 60_000,
  })
}

export function useEvento(eventCode: string, habilitado = true) {
  return useQuery({
    queryKey: ['evento', eventCode],
    queryFn: () => obtenerEventoPorCodigoApi(eventCode),
    enabled: habilitado && Boolean(eventCode.trim()),
    staleTime: 30_000,
  })
}

export function useEventosPorArtista(stageName: string, habilitado = true) {
  return useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: () => obtenerEventosPorArtistaApi(stageName),
    enabled: habilitado && Boolean(stageName.trim()),
    staleTime: 60_000,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CreateEventRequest) => crearEventoApi(datos),
    onSuccess: (eventoCreado) => {
      queryClient.setQueryData(['evento', eventoCreado.eventCode], eventoCreado)
      void queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] })
    },
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => publicarEventoApi(eventCode),
    onSuccess: (eventoActualizado) => {
      queryClient.setQueryData(
        ['evento', eventoActualizado.eventCode],
        eventoActualizado,
      )
      void queryClient.invalidateQueries({ queryKey: ['eventos', 'publicados'] })
    },
  })
}

export function useAsociarArtista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventCode,
      artistId,
    }: {
      eventCode: string
      artistId: number
    }) => asociarArtistaEventoApi(eventCode, artistId),
    onSuccess: (eventoActualizado) => {
      queryClient.setQueryData(
        ['evento', eventoActualizado.eventCode],
        eventoActualizado,
      )
      void queryClient.invalidateQueries({ queryKey: ['eventos', 'artista'] })
    },
  })
}
