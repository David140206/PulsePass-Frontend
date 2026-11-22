import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoBuscar } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { obtenerTicketPorCodigoApi } from '../funcionalidades/tickets/api'
import { useUsarTicket } from '../funcionalidades/tickets/hooks'
import {
  ValidarIngresoSchema,
  type TicketResponse,
  type ValidarIngresoForm,
} from '../funcionalidades/tickets/tipos'
import { ApiError } from '../lib/http'

export default function ValidacionIngreso() {
  const mutacionUsar = useUsarTicket()
  const [ticketEncontrado, setTicketEncontrado] =
    useState<TicketResponse | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [resultadoExito, setResultadoExito] = useState<string | null>(null)
  const [resultadoError, setResultadoError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValidarIngresoForm>({
    resolver: zodResolver(ValidarIngresoSchema),
    defaultValues: {
      ticketCode: '',
    },
  })

  const buscarTicket = async (datos: ValidarIngresoForm) => {
    setBuscando(true)
    setResultadoExito(null)
    setResultadoError(null)
    try {
      const ticket = await obtenerTicketPorCodigoApi(datos.ticketCode.trim())
      setTicketEncontrado(ticket)
    } catch (err: unknown) {
      setTicketEncontrado(null)
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setResultadoError('Ticket no encontrado')
        } else if (err.status === 403) {
          setResultadoError('Sin permisos')
        } else {
          setResultadoError(err.message)
        }
      } else {
        setResultadoError('No pudimos conectar con el servidor.')
      }
    } finally {
      setBuscando(false)
    }
  }

  const marcarComoUsado = async () => {
    if (!ticketEncontrado) return
    setResultadoExito(null)
    setResultadoError(null)
    try {
      const actualizado = await mutacionUsar.mutateAsync(
        ticketEncontrado.ticketCode,
      )
      setTicketEncontrado(actualizado)
      setResultadoExito('Ingreso registrado.')
      reset({ ticketCode: '' })
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setTicketEncontrado((prev) =>
          prev && err.status === 409 ? { ...prev, status: 'USED' } : prev,
        )
        setResultadoError(err.message)
      } else {
        setResultadoError('Ocurrió un error inesperado.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Validación de ingreso
      </h1>

      <search aria-label="Buscar ticket por código">
        <form
          noValidate
          onSubmit={handleSubmit((d) => void buscarTicket(d))}
          className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Campo
              etiqueta="Código de ticket"
              type="text"
              placeholder="Ej. TKT-8F2A1C"
              autoFocus
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="font-mono"
              error={errors.ticketCode?.message}
              {...register('ticketCode')}
            />
          </div>
          <Boton type="submit" variante="primario" cargando={buscando}>
            <IconoBuscar className="h-4 w-4" />
            <span>Buscar</span>
          </Boton>
        </form>
      </search>

      {ticketEncontrado ? (
        <Tarjeta className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-titulo text-base font-bold text-slate-900 dark:text-slate-100">
                {ticketEncontrado.eventName}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {ticketEncontrado.type} · Titular:{' '}
                {ticketEncontrado.userFullName ?? ticketEncontrado.userEmail}
              </p>
            </div>
            <Badge tono={ticketEncontrado.status} />
          </div>

          {!resultadoExito ? (
            <Boton
              variante="primario"
              cargando={mutacionUsar.isPending}
              onClick={() => void marcarComoUsado()}
              className="w-full"
            >
              Marcar como usado
            </Boton>
          ) : null}
        </Tarjeta>
      ) : null}

      {resultadoExito ? <Aviso tipo="exito">{resultadoExito}</Aviso> : null}

      {resultadoError ? (
        <Aviso tipo="advertencia" rol="alert">
          {resultadoError}
        </Aviso>
      ) : null}
    </div>
  )
}
