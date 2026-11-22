import { z } from 'zod'
import { ArtistResponseSchema } from '../artistas/tipos'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])

export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'SOLD_OUT',
  'CANCELLED',
  'FINISHED',
])

export type EventStatus = z.infer<typeof EventStatusSchema>

export const EventResponseSchema = z.object({
  id: z.number().optional(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  category: EventCategorySchema.optional().default('MUSIC'),
  status: EventStatusSchema,
  eventDate: z.string(),
  minimumAge: z.number().optional().default(0),
  venueCode: z.string().optional(),
  venueName: z.string().optional(),
  city: z.string().optional(),
  venueCapacity: z.number().optional(),
  artists: z.array(ArtistResponseSchema).optional().default([]),
})

export type EventResponse = z.infer<typeof EventResponseSchema>

export const EventSummaryResponseSchema = z.object({
  eventCode: z.string(),
  name: z.string(),
  status: EventStatusSchema,
  eventDate: z.string(),
  category: EventCategorySchema.optional().default('MUSIC'),
  city: z.string().optional(),
  venueName: z.string().optional(),
})

export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>

export const ListaEventosResumenSchema = z.array(EventSummaryResponseSchema)
export const ListaEventosDetalleSchema = z.array(EventResponseSchema)

export const CreateEventSchema = z.object({
  eventCode: z.string().trim().min(1, 'El código del evento es obligatorio'),
  name: z.string().trim().min(1, 'El nombre del evento es obligatorio'),
  description: z
    .string()
    .max(500, 'La descripción no puede superar 500 caracteres'),
  category: EventCategorySchema,
  eventDate: z.string().trim().min(1, 'La fecha y hora del evento son obligatorias'),
  minimumAge: z
    .number({ invalid_type_error: 'Ingresa una edad mínima válida' })
    .int('La edad mínima debe ser un número entero')
    .min(0, 'La edad mínima no puede ser negativa'),
  venueCode: z.string().trim().min(1, 'Selecciona una sede para el evento'),
})

export type CreateEventRequest = z.infer<typeof CreateEventSchema>
