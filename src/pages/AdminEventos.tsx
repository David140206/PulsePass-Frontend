import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import { RUTAS } from '../lib/rutas'

export default function AdminEventos() {
  const navigate = useNavigate()
  const { eventosCreadosSesion } = useAuth()
  const [codigoBusqueda, setCodigoBusqueda] = useState('')

  const abrirEvento = (e: FormEvent) => {
    e.preventDefault()
    const codigo = codigoBusqueda.trim()
    if (!codigo) return
    void navigate(RUTAS.adminGestionEvento(codigo))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
          Administración de eventos
        </h1>
        <Link
          to={RUTAS.adminCrearEvento}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700"
        >
          + Nuevo evento
        </Link>
      </div>

      <form onSubmit={abrirEvento} className="flex items-end gap-3">
        <div className="flex-1">
          <Campo
            etiqueta="Buscar evento por código"
            type="text"
            placeholder="CMF-2026"
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            className="font-mono"
          />
        </div>
        <Boton type="submit" variante="secundario">
          Abrir
        </Boton>
      </form>

      <section className="space-y-3">
        <h2 className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
          Creados en esta sesión
        </h2>

        {eventosCreadosSesion.length === 0 ? (
          <Tarjeta className="py-4 text-xs text-slate-500 dark:text-slate-400">
            Aún no has creado eventos en esta sesión. Usa el buscador por código o crea uno nuevo.
          </Tarjeta>
        ) : (
          <div className="space-y-3">
            {eventosCreadosSesion.map((ev) => (
              <Tarjeta
                key={ev.eventCode}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="text-sm">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {ev.eventCode}
                  </span>{' '}
                  ·{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {ev.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tono={ev.status} />
                  <Link
                    to={RUTAS.adminGestionEvento(ev.eventCode)}
                    className="inline-flex min-h-[38px] items-center rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    Gestionar
                  </Link>
                </div>
              </Tarjeta>
            ))}
          </div>
        )}
      </section>

      <Aviso tipo="info">
        Nota: la API no ofrece un listado completo de eventos (GAP-01).
      </Aviso>
    </div>
  )
}
