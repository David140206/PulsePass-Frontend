import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import clsx from 'clsx'
import Aviso from '../componentes/Aviso'
import { IconoCerrar, IconoMenu, IconoNotaMusical } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import MenuUsuario from '../funcionalidades/auth/componentes/MenuUsuario'
import { RUTAS } from '../lib/rutas'

interface EnlaceNav {
  etiqueta: string
  ruta: string
  end?: boolean
}

export default function Layout() {
  const { sesion, cerrarSesion, tieneRol, aviso, limpiarAviso } = useAuth()
  const navigate = useNavigate()
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [modoOscuro, setModoOscuro] = useState(false)

  useEffect(() => {
    if (!menuMovilAbierto) return
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuMovilAbierto(false)
      }
    }
    window.addEventListener('keydown', manejarEscape)
    return () => window.removeEventListener('keydown', manejarEscape)
  }, [menuMovilAbierto])

  const alternarModoOscuro = () => {
    const nuevo = !modoOscuro
    setModoOscuro(nuevo)
    document.documentElement.classList.toggle('dark', nuevo)
  }

  const enlaces: EnlaceNav[] = [
    { etiqueta: 'Eventos', ruta: RUTAS.eventos },
    { etiqueta: 'Artistas', ruta: RUTAS.artistas },
    { etiqueta: 'Sedes', ruta: RUTAS.sedes },
  ]

  if (sesion.estado === 'autenticado') {
    if (tieneRol('USER')) {
      enlaces.push({ etiqueta: 'Mis tickets', ruta: RUTAS.misTickets })
    }
    if (tieneRol('STAFF', 'ADMIN')) {
      enlaces.push({ etiqueta: 'Validar ingreso', ruta: RUTAS.staffValidacion })
      enlaces.push({
        etiqueta: 'Tickets pagados',
        ruta: RUTAS.staffTicketsPagados('CMF-2026'),
      })
    }
    if (tieneRol('ADMIN')) {
      enlaces.push({ etiqueta: 'Administrar eventos', ruta: RUTAS.adminEventos })
    }
  }

  const manejarSalir = () => {
    setMenuMovilAbierto(false)
    cerrarSesion(false)
    void navigate(RUTAS.inicio)
  }

  const nombreVisible =
    sesion.estado === 'autenticado' ? sesion.usuario.username : ''

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#contenido"
        className="visually-hidden rounded-lg bg-marca-600 px-4 py-2 text-sm font-semibold text-white focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <NavLink
              to={RUTAS.inicio}
              end
              className="flex items-center gap-2.5 font-titulo text-lg font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marca-600 text-white">
                <IconoNotaMusical className="h-4 w-4" />
              </span>
              <span>PulsePass</span>
            </NavLink>

            <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
              {enlaces.map((item) => (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
                      isActive
                        ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-500'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                    )
                  }
                >
                  {item.etiqueta}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={alternarModoOscuro}
              aria-pressed={modoOscuro}
              aria-label="Alternar modo oscuro"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {modoOscuro ? 'Claro' : 'Oscuro'}
            </button>

            {sesion.estado === 'autenticado' ? (
              <MenuUsuario
                username={nombreVisible}
                mostrarMisTickets={tieneRol('USER')}
                onSalir={manejarSalir}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={RUTAS.login}
                  className="rounded-xl px-3.5 py-2 text-sm font-medium text-marca-600 hover:bg-marca-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-marca-500 dark:hover:bg-slate-800"
                >
                  Ingresar
                </Link>
                <Link
                  to={RUTAS.registro}
                  className="rounded-xl bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuMovilAbierto}
              aria-controls="menu-movil-principal"
              onClick={() => setMenuMovilAbierto((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {menuMovilAbierto ? (
                <IconoCerrar className="h-5 w-5" />
              ) : (
                <IconoMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {menuMovilAbierto ? (
          <nav
            id="menu-movil-principal"
            aria-label="Menú móvil"
            className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-1">
              {enlaces.map((item) => (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  onClick={() => setMenuMovilAbierto(false)}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-xl px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-marca-50 text-marca-700 dark:bg-slate-800 dark:text-marca-500'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                    )
                  }
                >
                  {item.etiqueta}
                </NavLink>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              {sesion.estado === 'autenticado' ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to={RUTAS.cuenta}
                    onClick={() => setMenuMovilAbierto(false)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Mi cuenta ({nombreVisible})
                  </Link>
                  <button
                    type="button"
                    onClick={manejarSalir}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to={RUTAS.login}
                    onClick={() => setMenuMovilAbierto(false)}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    Ingresar
                  </Link>
                  <Link
                    to={RUTAS.registro}
                    onClick={() => setMenuMovilAbierto(false)}
                    className="flex-1 rounded-xl bg-marca-600 px-4 py-2.5 text-center text-sm font-medium text-white"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </nav>
        ) : null}
      </header>

      {aviso ? (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4">
          <Aviso tipo={aviso.tipo} onCerrar={limpiarAviso}>
            {aviso.mensaje}
          </Aviso>
        </div>
      ) : null}

      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
          <p>© 2026 PulsePass</p>
          <div className="flex items-center gap-4">
            <Link to={RUTAS.sedes} className="hover:text-slate-800 dark:hover:text-slate-200">
              Sedes
            </Link>
            <Link
              to={RUTAS.artistas}
              className="hover:text-slate-800 dark:hover:text-slate-200"
            >
              Artistas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
