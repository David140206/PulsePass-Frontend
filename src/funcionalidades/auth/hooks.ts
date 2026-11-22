import { useMutation } from '@tanstack/react-query'
import { registrarUsuarioApi } from './api'
import { useAuth } from './AuthContext'
import type { LoginRequest, RegisterUserRequest } from './tipos'

export { useAuth }

export function useLogin() {
  const { iniciarSesion } = useAuth()
  return useMutation({
    mutationFn: ({ identifier, password }: LoginRequest) =>
      iniciarSesion(identifier, password),
  })
}

export function useRegistrarUsuario() {
  return useMutation({
    mutationFn: (datos: RegisterUserRequest) => registrarUsuarioApi(datos),
  })
}
