import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import {
  IconoNotaMusical,
  IconoOjo,
  IconoOjoCerrado,
} from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { useRegistrarUsuario } from '../funcionalidades/auth/hooks'
import {
  RegisterUserSchema,
  type RegisterUserRequest,
} from '../funcionalidades/auth/tipos'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

function calcularFortaleza(password: string): {
  etiqueta: string
  segmentos: number
} {
  if (!password) return { etiqueta: 'baja', segmentos: 0 }
  if (password.length < 12) return { etiqueta: 'débil', segmentos: 1 }
  if (password.length >= 16 && /[A-Z]/.test(password) && /\d/.test(password)) {
    return { etiqueta: 'fuerte', segmentos: 4 }
  }
  return { etiqueta: 'media', segmentos: 2 }
}

export default function Registro() {
  const navigate = useNavigate()
  const { mostrarAviso } = useAuth()
  const mutacionRegistro = useRegistrarUsuario()

  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterUserRequest>({
    resolver: zodResolver(RegisterUserSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      password: '',
    },
  })

  const valorPassword = watch('password')
  const fortaleza = calcularFortaleza(valorPassword)

  const onSubmit = async (datos: RegisterUserRequest) => {
    setErrorServidor(null)
    try {
      await mutacionRegistro.mutateAsync(datos)
      mostrarAviso({
        tipo: 'exito',
        mensaje: 'Cuenta creada, inicia sesión.',
      })
      void navigate(RUTAS.login, { state: { registrado: true } })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorServidor('El usuario o correo ya está registrado.')
          return
        }
        if (err.status === 400 && Object.keys(err.details).length > 0) {
          for (const [clave, mensaje] of Object.entries(err.details)) {
            if (
              clave === 'username' ||
              clave === 'email' ||
              clave === 'firstName' ||
              clave === 'lastName' ||
              clave === 'birthDate' ||
              clave === 'password'
            ) {
              setError(clave, { message: mensaje })
            } else {
              setErrorServidor(mensaje)
            }
          }
          return
        }
        setErrorServidor(err.message)
      } else {
        setErrorServidor('Ocurrió un error inesperado. Inténtalo más tarde.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-md py-4">
      <Tarjeta className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-marca-600 text-white">
            <IconoNotaMusical className="h-5 w-5" />
          </div>
          <h1 className="font-titulo text-xl font-bold text-slate-900 dark:text-slate-100">
            Crea tu cuenta
          </h1>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit((d) => void onSubmit(d))}
          className="space-y-4"
        >
          <Campo
            etiqueta="Nombre de usuario"
            type="text"
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            error={errors.username?.message}
            {...register('username')}
          />

          <Campo
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              etiqueta="Nombres"
              type="text"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Campo
              etiqueta="Apellidos"
              type="text"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Campo
            etiqueta="Fecha de nacimiento"
            type="date"
            autoComplete="bday"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />

          <div className="space-y-2">
            <Campo
              etiqueta="Contraseña (mín. 12 caracteres)"
              type={mostrarPassword ? 'text' : 'password'}
              autoComplete="new-password"
              ayuda="Entre 12 caracteres y 72 bytes."
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

            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((paso) => (
                  <div
                    key={paso}
                    className={
                      paso <= fortaleza.segmentos
                        ? 'h-1.5 rounded-full bg-marca-600'
                        : 'h-1.5 rounded-full bg-slate-200 dark:bg-slate-800'
                    }
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Fortaleza: {fortaleza.etiqueta}
              </p>
            </div>
          </div>

          {errorServidor ? (
            <Aviso tipo="error" rol="alert">
              {errorServidor}
            </Aviso>
          ) : null}

          <Boton
            type="submit"
            variante="primario"
            cargando={mutacionRegistro.isPending}
            className="w-full"
          >
            Crear cuenta
          </Boton>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={RUTAS.login}
            className="font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
          >
            Inicia sesión
          </Link>
        </p>
      </Tarjeta>
    </div>
  )
}
