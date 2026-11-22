import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  establecerTokenMemoria,
  registrarManejadorNoAutorizado,
} from '../../lib/http'
import { iniciarSesionApi, obtenerSesionActualApi } from './api'
import {
  SesionStorageSchema,
  type AuthenticatedUserResponse,
  type Rol,
  type Sesion,
} from './tipos'

export const CLAVE_SESION_STORAGE = 'pulsepass_sesion'

export interface AvisoFlotante {
  tipo: 'exito' | 'error' | 'info' | 'advertencia'
  mensaje: string
}

export interface ValorAuthContext {
  sesion: Sesion
  iniciarSesion: (
    identifier: string,
    password: string,
  ) => Promise<AuthenticatedUserResponse>
  cerrarSesion: (porExpiracion?: boolean) => void
  tieneRol: (...roles: Rol[]) => boolean
  aviso: AvisoFlotante | null
  mostrarAviso: (aviso: AvisoFlotante) => void
  limpiarAviso: () => void
  eventosCreadosSesion: Array<{
    eventCode: string
    name: string
    status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'FINISHED'
  }>
  registrarEventoSesion: (evento: {
    eventCode: string
    name: string
    status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'FINISHED'
  }) => void
}

const AuthContext = createContext<ValorAuthContext | null>(null)

export interface PropsAuthProvider {
  children: ReactNode
  sesionInicial?: Sesion
}

export function AuthProvider({ children, sesionInicial }: PropsAuthProvider) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(
    () => sesionInicial ?? { estado: 'cargando' },
  )
  const [aviso, setAviso] = useState<AvisoFlotante | null>(null)
  const [eventosCreadosSesion, setEventosCreadosSesion] = useState<
    Array<{
      eventCode: string
      name: string
      status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'FINISHED'
    }>
  >([])

  const limpiarAviso = useCallback(() => setAviso(null), [])

  const mostrarAviso = useCallback((nuevoAviso: AvisoFlotante) => {
    setAviso(nuevoAviso)
  }, [])

  useEffect(() => {
    if (!aviso || aviso.tipo !== 'exito') return
    const timer = window.setTimeout(() => {
      setAviso(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [aviso])

  const cerrarSesion = useCallback(
    (porExpiracion = false) => {
      establecerTokenMemoria(null)
      try {
        window.sessionStorage.removeItem(CLAVE_SESION_STORAGE)
      } catch {
        // Ignorar errores de sessionStorage restringido
      }
      queryClient.clear()
      setEventosCreadosSesion([])
      setSesion({ estado: 'anonimo', sesionExpirada: porExpiracion })
      if (porExpiracion) {
        setAviso({
          tipo: 'info',
          mensaje: 'Tu sesión expiró. Inicia sesión de nuevo.',
        })
      }
    },
    [queryClient],
  )

  useEffect(() => {
    registrarManejadorNoAutorizado(() => {
      cerrarSesion(true)
    })
    return () => {
      registrarManejadorNoAutorizado(null)
    }
  }, [cerrarSesion])

  useEffect(() => {
    if (sesionInicial?.estado === 'autenticado') {
      establecerTokenMemoria(sesionInicial.token)
    }
  }, [sesionInicial])

  useEffect(() => {
    if (sesionInicial) return

    let cancelado = false

    async function restaurar() {
      let crudo: string | null
      try {
        crudo = window.sessionStorage.getItem(CLAVE_SESION_STORAGE)
      } catch {
        crudo = null
      }

      if (!crudo) {
        if (!cancelado) setSesion({ estado: 'anonimo' })
        return
      }

      let parseadoJson: unknown
      try {
        parseadoJson = JSON.parse(crudo)
      } catch {
        parseadoJson = null
      }

      const validado = SesionStorageSchema.safeParse(parseadoJson)
      if (!validado.success || validado.data.expiraEn <= Date.now()) {
        try {
          window.sessionStorage.removeItem(CLAVE_SESION_STORAGE)
        } catch {
          // Ignorar
        }
        establecerTokenMemoria(null)
        if (!cancelado) setSesion({ estado: 'anonimo' })
        return
      }

      const { token, expiraEn } = validado.data
      establecerTokenMemoria(token)

      try {
        const usuario = await obtenerSesionActualApi()
        if (!cancelado) {
          setSesion({
            estado: 'autenticado',
            token,
            expiraEn,
            usuario,
          })
        }
      } catch {
        try {
          window.sessionStorage.removeItem(CLAVE_SESION_STORAGE)
        } catch {
          // Ignorar
        }
        establecerTokenMemoria(null)
        if (!cancelado) setSesion({ estado: 'anonimo' })
      }
    }

    void restaurar()

    return () => {
      cancelado = true
    }
  }, [sesionInicial])

  useEffect(() => {
    if (sesion.estado !== 'autenticado') return
    const msRestantes = Math.max(0, sesion.expiraEn - Date.now())
    const timer = window.setTimeout(() => {
      cerrarSesion(true)
    }, msRestantes)
    return () => window.clearTimeout(timer)
  }, [sesion, cerrarSesion])

  const iniciarSesion = useCallback(
    async (
      identifier: string,
      password: string,
    ): Promise<AuthenticatedUserResponse> => {
      const auth = await iniciarSesionApi({ identifier, password })
      const expiraEn = Date.now() + auth.expiresIn * 1000
      establecerTokenMemoria(auth.accessToken)
      try {
        window.sessionStorage.setItem(
          CLAVE_SESION_STORAGE,
          JSON.stringify({ token: auth.accessToken, expiraEn }),
        )
      } catch {
        // Ignorar
      }

      const usuario = await obtenerSesionActualApi()
      setSesion({
        estado: 'autenticado',
        token: auth.accessToken,
        expiraEn,
        usuario,
      })
      return usuario
    },
    [],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]): boolean => {
      if (sesion.estado !== 'autenticado') return false
      return roles.some((r) => sesion.usuario.roles.includes(r))
    },
    [sesion],
  )

  const registrarEventoSesion = useCallback(
    (evento: {
      eventCode: string
      name: string
      status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'FINISHED'
    }) => {
      setEventosCreadosSesion((prev) => {
        const filtrados = prev.filter((e) => e.eventCode !== evento.eventCode)
        return [evento, ...filtrados]
      })
    },
    [],
  )

  const valor = useMemo<ValorAuthContext>(
    () => ({
      sesion,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
      aviso,
      mostrarAviso,
      limpiarAviso,
      eventosCreadosSesion,
      registrarEventoSesion,
    }),
    [
      sesion,
      iniciarSesion,
      cerrarSesion,
      tieneRol,
      aviso,
      mostrarAviso,
      limpiarAviso,
      eventosCreadosSesion,
      registrarEventoSesion,
    ],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): ValorAuthContext {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider')
  }
  return ctx
}
