import { z } from 'zod'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export const TicketResponseSchema = z.object({
  id: z.number().optional(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.number(),
  status: TicketStatusSchema,
  purchaseDate: z.string(),
  userEmail: z.string().optional().default(''),
  userFullName: z.string().optional(),
  eventCode: z.string().optional().default(''),
  eventName: z.string(),
})

export type TicketResponse = z.infer<typeof TicketResponseSchema>

export const ListaTicketsSchema = z.array(TicketResponseSchema)

export const PurchaseTicketSchema = z.object({
  userEmail: z.string().email(),
  eventCode: z.string().min(1),
  type: TicketTypeSchema,
})

export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketSchema>

export const SeleccionTipoTicketSchema = z.object({
  type: TicketTypeSchema,
})

export type SeleccionTipoTicketForm = z.infer<typeof SeleccionTipoTicketSchema>

export const ValidarIngresoSchema = z.object({
  ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})

export type ValidarIngresoForm = z.infer<typeof ValidarIngresoSchema>
