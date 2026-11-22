import { peticionHttp } from '../../lib/http'
import { UserResponseSchema, type UserResponse } from './tipos'

export function obtenerUsuarioPorEmailApi(email: string): Promise<UserResponse> {
  return peticionHttp(`/api/users/by-email?email=${encodeURIComponent(email)}`, {
    metodo: 'GET',
    esquema: UserResponseSchema,
  })
}

export function obtenerUsuarioPorUsernameApi(username: string): Promise<UserResponse> {
  return peticionHttp(`/api/users/by-username?username=${encodeURIComponent(username)}`, {
    metodo: 'GET',
    esquema: UserResponseSchema,
  })
}
