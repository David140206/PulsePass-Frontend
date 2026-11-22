import { useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorEmailApi, obtenerUsuarioPorUsernameApi } from './api'

export function useUsuarioPorEmail(email: string) {
  return useQuery({
    queryKey: ['usuario', email],
    queryFn: () => obtenerUsuarioPorEmailApi(email),
    enabled: Boolean(email),
    staleTime: 60_000,
  })
}

export function useUsuarioPorUsername(username: string) {
  return useQuery({
    queryKey: ['usuario', 'username', username],
    queryFn: () => obtenerUsuarioPorUsernameApi(username),
    enabled: Boolean(username),
    staleTime: 60_000,
  })
}
