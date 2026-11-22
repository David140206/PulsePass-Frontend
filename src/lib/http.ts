import { z, type ZodType, type ZodTypeDef } from 'zod'

export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number(),
  error: z.string().optional(),
  message: z.string().optional(),
  details: z.record(z.string(), z.string()).nullable().optional(),
})

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let tokenEnMemoria: string | null = null
let manejadorNoAutorizado: (() => void) | null = null

export function establecerTokenMemoria(token: string | null): void {
  tokenEnMemoria = token
}

export function obtenerTokenMemoria(): string | null {
  return tokenEnMemoria
}

export function registrarManejadorNoAutorizado(cb: (() => void) | null): void {
  manejadorNoAutorizado = cb
}

export interface OpcionesHttp<T> {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  cuerpo?: unknown
  esquema: ZodType<T, ZodTypeDef, unknown>
  omitirAuth?: boolean
  omitirCierreSesion401?: boolean
  signal?: AbortSignal
}

function construirUrl(ruta: string): string {
  const baseRaw = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const base = String(baseRaw).replace(/\/+$/, '')
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
    return ruta
  }
  if (ruta.startsWith('/api/') || ruta === '/api') {
    if (base.endsWith('/api')) {
      return `${base.slice(0, -4)}${ruta}`
    }
    return `${base}${ruta}`
  }
  const rutaNormalizada = ruta.startsWith('/') ? ruta : `/${ruta}`
  return `${base}${rutaNormalizada}`
}

function mensajePorDefectoEstado(status: number): string {
  switch (status) {
    case 400:
      return 'Revisa los datos enviados e inténtalo de nuevo.'
    case 401:
      return 'Tu sesión expiró o las credenciales son inválidas.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 404:
      return 'El recurso solicitado no está disponible.'
    case 409:
      return 'No se pudo completar la operación por una regla del sistema.'
    default:
      return 'Ocurrió un error inesperado. Inténtalo más tarde.'
  }
}

export async function peticionHttp<T>(
  ruta: string,
  opciones: OpcionesHttp<T>,
): Promise<T> {
  const {
    metodo = 'GET',
    cuerpo,
    esquema,
    omitirAuth = false,
    omitirCierreSesion401 = false,
    signal,
  } = opciones

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (!omitirAuth && tokenEnMemoria) {
    headers['Authorization'] = `Bearer ${tokenEnMemoria}`
  }

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta), {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal,
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor.')
  }

  const texto = await respuesta.text()
  let datosJson: unknown = null
  if (texto.trim().length > 0) {
    try {
      datosJson = JSON.parse(texto)
    } catch {
      datosJson = null
    }
  }

  if (!respuesta.ok) {
    const validacionError = ErrorResponseSchema.safeParse(datosJson)
    const status = respuesta.status

    if (status === 401 && !omitirCierreSesion401 && manejadorNoAutorizado) {
      manejadorNoAutorizado()
    }

    if (status >= 500) {
      throw new ApiError(status, 'Ocurrió un error inesperado. Inténtalo más tarde.')
    }

    if (validacionError.success) {
      const dto = validacionError.data
      const mensaje =
        dto.message && dto.message.trim().length > 0
          ? dto.message
          : mensajePorDefectoEstado(status)
      const detalles = dto.details ?? {}
      throw new ApiError(status, mensaje, detalles)
    }

    throw new ApiError(status, mensajePorDefectoEstado(status), {})
  }

  const resultado = esquema.safeParse(datosJson)
  if (!resultado.success) {
    throw new ApiError(500, 'La respuesta del servidor no tiene el formato esperado.')
  }

  return resultado.data
}
