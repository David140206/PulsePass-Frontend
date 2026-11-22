import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import {
  IconoNotaMusical,
  IconoOjo,
  IconoOjoCerrado,
} from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useLogin } from '../funcionalidades/auth/hooks'
import { LoginSchema, type LoginRequest } from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

interface EstadoUbicacionLogin {
  desde?: string
  registrado?: boolean
  motivo?: 'expirada'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const estadoNav = (location.state as EstadoUbicacionLogin | null) ?? null
  const mutacionLogin = useLogin()

  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = async (datos: LoginRequest) => {
    setErrorServidor(null)
    try {
      await mutacionLogin.mutateAsync(datos)
      const destino = estadoNav?.desde ?? RUTAS.inicio
      void navigate(destino, { replace: true })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorServidor('Credenciales inválidas.')
          return
        }
        if (err.status === 400 && Object.keys(err.details).length > 0) {
          for (const [campo, mensaje] of Object.entries(err.details)) {
            if (campo === 'identifier' || campo === 'password') {
              setError(campo, { message: mensaje })
            } else {
              setErrorServidor(mensaje)
            }
          }
          return
        }
        setErrorServidor(err.message)
      } else {
        setErrorServidor('Inténtalo más tarde.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-sm py-6">
      <Tarjeta className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-marca-600 text-white">
            <IconoNotaMusical className="h-5 w-5" />
          </div>
          <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            Inicia sesión
          </h1>
        </div>

        {estadoNav?.registrado ? (
          <Aviso tipo="exito">Cuenta creada, inicia sesión.</Aviso>
        ) : null}

        {estadoNav?.motivo === 'expirada' ? (
          <Aviso tipo="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>
        ) : null}

        <form
          noValidate
          onSubmit={handleSubmit((d) => void onSubmit(d))}
          className="space-y-4"
        >
          <Campo
            etiqueta="Usuario o correo"
            type="text"
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <Campo
            etiqueta="Contraseña"
            type={mostrarPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            elementoDerecha={
              <button
                type="button"
                aria-pressed={mostrarPassword}
                aria-label={
                  mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                onClick={() => setMostrarPassword((p) => !p)}
                className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {mostrarPassword ? (
                  <IconoOjoCerrado className="h-4 w-4" />
                ) : (
                  <IconoOjo className="h-4 w-4" />
                )}
              </button>
            }
            {...register('password')}
          />

          {errorServidor ? (
            <Aviso tipo="error" rol="alert">
              {errorServidor}
            </Aviso>
          ) : null}

          <Boton
            type="submit"
            variante="primario"
            cargando={mutacionLogin.isPending}
            className="w-full"
          >
            Ingresar
          </Boton>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to={RUTAS.registro}
            className="font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
          >
            Regístrate
          </Link>
        </p>
      </Tarjeta>
    </div>
  )
}
