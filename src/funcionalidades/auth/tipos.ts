import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

const RolEntradaSchema = z
  .string()
  .transform((val): Rol => {
    const limpio = val.replace(/^ROLE_/, '').toUpperCase()
    if (limpio === 'ADMIN') return 'ADMIN'
    if (limpio === 'STAFF') return 'STAFF'
    return 'USER'
  })

export const AuthenticatedUserResponseSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  email: z.string(),
  active: z.boolean().optional().default(true),
  roles: z.array(RolEntradaSchema).default(['USER']),
})

export type AuthenticatedUserResponse = z.infer<typeof AuthenticatedUserResponseSchema>

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().default('Bearer'),
  expiresIn: z.number().positive(),
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export type LoginRequest = z.infer<typeof LoginSchema>

export const RegisterUserSchema = z.object({
  username: z.string().trim().min(1, 'Ingresa un nombre de usuario'),
  email: z
    .string()
    .trim()
    .min(1, 'Ingresa tu correo electrónico')
    .email('Ingresa un correo electrónico válido'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos'),
  birthDate: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento')
    .refine((val) => {
      const fecha = new Date(`${val}T00:00:00Z`)
      if (Number.isNaN(fecha.getTime())) return false
      const hoy = new Date()
      return fecha.getTime() <= hoy.getTime()
    }, 'La fecha de nacimiento debe ser válida y no futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine(
      (val) => new TextEncoder().encode(val).length <= 72,
      'La contraseña no puede superar 72 bytes UTF-8',
    ),
})

export type RegisterUserRequest = z.infer<typeof RegisterUserSchema>

export const SesionStorageSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number(),
})

export type SesionStorage = z.infer<typeof SesionStorageSchema>

export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; sesionExpirada?: boolean }
  | {
      estado: 'autenticado'
      token: string
      expiraEn: number
      usuario: AuthenticatedUserResponse
    }
