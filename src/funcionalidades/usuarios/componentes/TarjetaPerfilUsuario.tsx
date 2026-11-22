import Badge from '../../../componentes/Badge'
import Tarjeta from '../../../componentes/Tarjeta'
import { obtenerIniciales } from '../../../lib/formato'
import type { Rol } from '../../auth/tipos'

export interface PropsTarjetaPerfilUsuario {
  nombreCompleto: string
  username: string
  email: string
  birthDate?: string
  rol: Rol
  activo: boolean
}

export default function TarjetaPerfilUsuario({
  nombreCompleto,
  username,
  email,
  birthDate,
  rol,
  activo,
}: PropsTarjetaPerfilUsuario) {
  return (
    <Tarjeta className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 font-titulo text-lg font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
          {obtenerIniciales(nombreCompleto)}
        </div>
        <div className="space-y-1">
          <h2 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
            {nombreCompleto}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            @{username} · {email}
          </p>
          {birthDate ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nacimiento: {birthDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Rol:</span>
          <Badge tono="ROL">{rol}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Estado:</span>
          <Badge tono={activo ? 'ACTIVA' : 'INACTIVA'}>
            {activo ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
      </div>
    </Tarjeta>
  )
}
