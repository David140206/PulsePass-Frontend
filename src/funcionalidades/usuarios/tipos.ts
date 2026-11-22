import { z } from 'zod'

export const UserResponseSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  email: z.string(),
  active: z.boolean().optional().default(true),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
})

export type UserResponse = z.infer<typeof UserResponseSchema>
