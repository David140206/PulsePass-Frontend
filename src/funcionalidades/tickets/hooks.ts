import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelarTicketApi,
  comprarTicketApi,
  obtenerTicketPorCodigoApi,
  obtenerTicketsPagadosPorEventoApi,
  obtenerTicketsPorUsuarioApi,
  usarTicketApi,
} from './api'
import type { PurchaseTicketRequest } from './tipos'

export function useTicket(ticketCode: string, habilitado = true) {
  return useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: () => obtenerTicketPorCodigoApi(ticketCode),
    enabled: habilitado && Boolean(ticketCode.trim()),
    staleTime: 15_000,
  })
}

export function useMisTickets(email: string) {
  return useQuery({
    queryKey: ['tickets', 'usuario', email],
    queryFn: () => obtenerTicketsPorUsuarioApi(email),
    enabled: Boolean(email.trim()),
    staleTime: 15_000,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string) {
  return useQuery({
    queryKey: ['tickets', 'pagados', eventCode],
    queryFn: () => obtenerTicketsPagadosPorEventoApi(eventCode),
    enabled: Boolean(eventCode.trim()),
    staleTime: 15_000,
  })
}

export function useComprarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: PurchaseTicketRequest) => comprarTicketApi(datos),
    onSuccess: (ticket, variables) => {
      queryClient.setQueryData(['ticket', ticket.ticketCode], ticket)
      void queryClient.invalidateQueries({
        queryKey: ['tickets', 'usuario', variables.userEmail],
      })
      void queryClient.invalidateQueries({
        queryKey: ['evento', variables.eventCode],
      })
      void queryClient.invalidateQueries({
        queryKey: ['tickets', 'pagados', variables.eventCode],
      })
    },
  })
}

export function useCancelarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => cancelarTicketApi(ticketCode),
    onSuccess: (ticketActualizado) => {
      queryClient.setQueryData(['ticket', ticketActualizado.ticketCode], ticketActualizado)
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario'] })
      void queryClient.invalidateQueries({
        queryKey: ['ticket', ticketActualizado.ticketCode],
      })
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'pagados'] })
    },
  })
}

export function useUsarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => usarTicketApi(ticketCode),
    onSuccess: (ticketActualizado) => {
      queryClient.setQueryData(['ticket', ticketActualizado.ticketCode], ticketActualizado)
      void queryClient.invalidateQueries({
        queryKey: ['ticket', ticketActualizado.ticketCode],
      })
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'pagados'] })
      void queryClient.invalidateQueries({ queryKey: ['tickets', 'usuario'] })
    },
  })
}
