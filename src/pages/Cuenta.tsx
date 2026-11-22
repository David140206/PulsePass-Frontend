import { Link, useNavigate } from 'react-router'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import { IconoBoleto } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/AuthContext'
import TarjetaPerfilUsuario from '../funcionalidades/usuarios/componentes/TarjetaPerfilUsuario'
import {
  useUsuarioPorEmail,
  useUsuarioPorUsername,
} from '../funcionalidades/usuarios/hooks'
import { RUTAS } from '../lib/rutas'

export default function Cuenta() {
  const { sesion, cerrarSesion, tieneRol } = useAuth()
  const navigate = useNavigate()

  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''
  const username = sesion.estado === 'autenticado' ? sesion.usuario.username : ''

  const consultaEmail = useUsuarioPorEmail(email)
  useUsuarioPorUsername(username)

  if (sesion.estado !== 'autenticado') {
    return null
  }

  if (consultaEmail.isLoading) {
    return <Cargando mensaje="Cargando tu cuenta..." tarjetas={1} />
  }

  if (consultaEmail.isError) {
    return (
      <EstadoError
        mensaje={
          consultaEmail.error instanceof Error
            ? consultaEmail.error.message
            : 'No pudimos cargar tu perfil.'
        }
        onReintentar={() => void consultaEmail.refetch()}
      />
    )
  }

  const perfil = consultaEmail.data
  const nombreCompleto =
    perfil?.firstName && perfil.lastName
      ? `${perfil.firstName} ${perfil.lastName}`
      : sesion.usuario.username
  const rolPrincipal = sesion.usuario.roles[0] ?? 'USER'
  const activo = perfil?.active ?? sesion.usuario.active

  const manejarCerrarSesion = () => {
    cerrarSesion(false)
    void navigate(RUTAS.inicio)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-titulo text-2xl font-bold text-slate-900 dark:text-slate-100">
        Mi cuenta
      </h1>

      <TarjetaPerfilUsuario
        nombreCompleto={nombreCompleto}
        username={sesion.usuario.username}
        email={sesion.usuario.email}
        birthDate={perfil?.birthDate}
        rol={rolPrincipal}
        activo={activo}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {tieneRol('USER') ? (
          <Link
            to={RUTAS.misTickets}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-marca-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            <IconoBoleto className="h-4 w-4" />
            <span>Ver mis tickets</span>
          </Link>
        ) : (
          <div />
        )}

        <Boton variante="secundario" onClick={manejarCerrarSesion}>
          Cerrar sesión
        </Boton>
      </div>
    </div>
  )
}
