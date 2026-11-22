import { useState } from 'react'
import { Link } from 'react-router'
import { obtenerIniciales } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'

export interface PropsMenuUsuario {
  username: string
  mostrarMisTickets: boolean
  onSalir: () => void
}

export default function MenuUsuario({
  username,
  mostrarMisTickets,
  onSalir,
}: PropsMenuUsuario) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
          {obtenerIniciales(username)}
        </span>
        <span>{username}</span>
        <span aria-hidden="true" className="text-xs text-slate-400">
          ▾
        </span>
      </button>

      {abierto ? (
        <div className="absolute top-11 right-0 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <Link
            to={RUTAS.cuenta}
            onClick={() => setAbierto(false)}
            className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Mi cuenta
          </Link>
          {mostrarMisTickets ? (
            <Link
              to={RUTAS.misTickets}
              onClick={() => setAbierto(false)}
              className="block rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Mis tickets
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setAbierto(false)
              onSalir()
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Salir
          </button>
        </div>
      ) : null}
    </div>
  )
}
