import { z } from 'zod'

export const ArtistResponseSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  genre: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
})

export const ListaArtistasSchema = z.array(ArtistResponseSchema)

export type ArtistResponse = z.infer<typeof ArtistResponseSchema>
