import { peticionHttp } from '../../lib/http'
import { UserResponseSchema, type UserResponse } from '../usuarios/tipos'
import {
  AuthenticatedUserResponseSchema,
  AuthResponseSchema,
  type AuthenticatedUserResponse,
  type AuthResponse,
  type LoginRequest,
  type RegisterUserRequest,
} from './tipos'

export function iniciarSesionApi(credenciales: LoginRequest): Promise<AuthResponse> {
  return peticionHttp('/api/auth/login', {
    metodo: 'POST',
    cuerpo: credenciales,
    esquema: AuthResponseSchema,
    omitirAuth: true,
    omitirCierreSesion401: true,
  })
}

export function obtenerSesionActualApi(): Promise<AuthenticatedUserResponse> {
  return peticionHttp('/api/auth/me', {
    metodo: 'GET',
    esquema: AuthenticatedUserResponseSchema,
  })
}

export function registrarUsuarioApi(datos: RegisterUserRequest): Promise<UserResponse> {
  return peticionHttp('/api/users', {
    metodo: 'POST',
    cuerpo: {
      phone: '3000000000',
      city: 'Santa Marta',
      ...datos,
    },
    esquema: UserResponseSchema,
    omitirAuth: true,
    omitirCierreSesion401: true,
  })
}
