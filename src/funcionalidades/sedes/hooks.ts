import { useQuery } from '@tanstack/react-query'
import { obtenerSedePorCodigoApi, obtenerSedesActivasApi } from './api'

export function useSedesActivas() {
  return useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: obtenerSedesActivasApi,
    staleTime: 300_000,
  })
}

export function useSede(code: string) {
  return useQuery({
    queryKey: ['sede', code],
    queryFn: () => obtenerSedePorCodigoApi(code),
    enabled: Boolean(code),
    staleTime: 300_000,
  })
}
