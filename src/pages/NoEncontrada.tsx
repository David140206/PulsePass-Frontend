import { Link } from 'react-router'
import Tarjeta from '../componentes/Tarjeta'
import { RUTAS } from '../lib/rutas'

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Tarjeta className="flex flex-col items-center space-y-4 text-center">
        <p className="font-titulo text-4xl font-bold text-marca-600">404</p>
        <h1 className="font-titulo text-lg font-bold text-slate-900 dark:text-slate-100">
          No encontramos esta página.
        </h1>
        <Link
          to={RUTAS.inicio}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-marca-700"
        >
          Volver al inicio
        </Link>
      </Tarjeta>
    </div>
  )
}
