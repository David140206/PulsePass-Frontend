import { z } from 'zod'

export const VenueResponseSchema = z.object({
  id: z.number().optional(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  capacity: z.number(),
  active: z.boolean().optional().default(true),
  address: z.string().optional(),
})

export const ListaVenuesSchema = z.array(VenueResponseSchema)

export type VenueResponse = z.infer<typeof VenueResponseSchema>
