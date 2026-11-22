import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Selector from '../componentes/Selector'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import {
  CreateEventSchema,
  EventCategorySchema,
  type CreateEventRequest,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'

const CATEGORIAS = EventCategorySchema.options

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const { mostrarAviso, registrarEventoSesion } = useAuth()
  const consultaSedes = useSedesActivas()
  const mutacionCrear = useCrearEvento()
  const idDescripcion = useId()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateEventRequest>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: 'MUSIC',
      eventDate: '',
      minimumAge: 18,
      venueCode: '',
    },
  })

  const descripcionActual = watch('description') ?? ''

  const onSubmit = async (datos: CreateEventRequest) => {
    setErrorServidor(null)
    try {
      const creado = await mutacionCrear.mutateAsync(datos)
      registrarEventoSesion({
        eventCode: creado.eventCode,
        name: creado.name,
        status: creado.status,
      })
      mostrarAviso({
        tipo: 'exito',
        mensaje: `Evento ${creado.eventCode} creado en borrador.`,
      })
      void navigate(RUTAS.adminGestionEvento(creado.eventCode))
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          void navigate(RUTAS.sinPermisos)
          return
        }
        if (err.status === 400 && Object.keys(err.details).length > 0) {
          for (const [clave, mensaje] of Object.entries(err.details)) {
            if (
              clave === 'eventCode' ||
              clave === 'name' ||
              clave === 'description' ||
              clave === 'category' ||
              clave === 'eventDate' ||
              clave === 'minimumAge' ||
              clave === 'venueCode'
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
        setErrorServidor('Ocurrió un error inesperado al crear el evento.')
      }
    }
  }

  const sedes = consultaSedes.data ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          to={RUTAS.adminEventos}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-marca-600 hover:text-marca-700 dark:text-marca-500"
        >
          ← Eventos
        </Link>
        <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
          Nuevo evento
        </h1>
      </div>

      <Tarjeta>
        <form
          noValidate
          onSubmit={handleSubmit((d) => void onSubmit(d))}
          className="space-y-4"
        >
          {errorServidor ? (
            <Aviso tipo="error" rol="alert">
              {errorServidor}
            </Aviso>
          ) : null}

          <Campo
            etiqueta="Código del evento"
            type="text"
            placeholder="CMF-2026"
            className="font-mono"
            error={errors.eventCode?.message}
            {...register('eventCode')}
          />

          <Campo
            etiqueta="Nombre"
            type="text"
            placeholder="Caribbean Music Fest 2026"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={idDescripcion}
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Descripción
            </label>
            <textarea
              id={idDescripcion}
              rows={3}
              aria-invalid={errors.description ? 'true' : undefined}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('description')}
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{errors.description?.message ?? ''}</span>
              <span>{descripcionActual.length}/500</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Selector
              etiqueta="Categoría"
              error={errors.category?.message}
              opciones={CATEGORIAS.map((c) => ({ valor: c, etiqueta: c }))}
              {...register('category')}
            />

            <Campo
              etiqueta="Edad mínima"
              type="number"
              min={0}
              error={errors.minimumAge?.message}
              {...register('minimumAge', { valueAsNumber: true })}
            />
          </div>

          <Campo
            etiqueta="Fecha y hora"
            type="datetime-local"
            error={errors.eventDate?.message}
            {...register('eventDate')}
          />

          <Selector
            etiqueta="Sede"
            error={errors.venueCode?.message}
            opciones={[
              { valor: '', etiqueta: 'Selecciona una sede' },
              ...sedes.map((s) => ({
                valor: s.code,
                etiqueta: `${s.name} (${s.code})`,
              })),
            ]}
            {...register('venueCode')}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={RUTAS.adminEventos}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              Cancelar
            </Link>
            <Boton
              type="submit"
              variante="primario"
              cargando={mutacionCrear.isPending}
            >
              Crear evento
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  )
}
