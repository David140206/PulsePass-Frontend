import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import PrecioCOP from '../componentes/PrecioCOP'
import { CLAVE_SESION_STORAGE } from '../funcionalidades/auth/AuthContext'
import {
  ApiError,
  establecerTokenMemoria,
  peticionHttp,
  registrarManejadorNoAutorizado,
} from '../lib/http'
import ErrorPagina from '../pages/ErrorPagina'
import { server, TICKETS_MOCK } from './mocks/handlers'
import {
  renderConProveedores,
  SESION_ADMIN,
  SESION_STAFF_LAURA,
  SESION_USER_ANDREA,
} from './utils'

describe('21.1 Infraestructura y utilidades (TEST-FE-LIB-*)', () => {
  it('TEST-FE-LIB-001: http añade Authorization Bearer cuando hay sesión', async () => {
    let headerRecibido: string | null = null
    server.use(
      http.get('*/api/venues/active', ({ request }) => {
        headerRecibido = request.headers.get('authorization')
        return HttpResponse.json([])
      }),
    )

    establecerTokenMemoria('jwt-secreto-123')
    await peticionHttp('/api/venues/active', {
      esquema: z.array(z.unknown()),
    })

    expect(headerRecibido).toBe('Bearer jwt-secreto-123')
  })

  it('TEST-FE-LIB-002: http convierte ErrorResponse válido en ApiError con status y details', async () => {
    server.use(
      http.post('*/api/events', () =>
        HttpResponse.json(
          {
            timestamp: '2026-11-09T10:00:00',
            status: 400,
            error: 'Bad Request',
            message: 'Validation failed',
            details: { eventCode: 'Event code is required' },
          },
          { status: 400 },
        ),
      ),
    )

    await expect(
      peticionHttp('/api/events', {
        metodo: 'POST',
        cuerpo: {},
        esquema: z.unknown(),
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Validation failed',
      details: { eventCode: 'Event code is required' },
    })
  })

  it('TEST-FE-LIB-003: http ante cuerpo de error inválido lanza ApiError genérico', async () => {
    server.use(
      http.get('*/api/venues/active', () =>
        new HttpResponse('Error plano no JSON', { status: 500 }),
      ),
    )

    await expect(
      peticionHttp('/api/venues/active', {
        esquema: z.unknown(),
      }),
    ).rejects.toBeInstanceOf(ApiError)
  })

  it('TEST-FE-LIB-004: http ante 401 dispara cierre de sesión', async () => {
    const espiaCierre = vi.fn()
    registrarManejadorNoAutorizado(espiaCierre)

    server.use(
      http.get('*/api/auth/me', () =>
        HttpResponse.json(
          { status: 401, message: 'Token expired' },
          { status: 401 },
        ),
      ),
    )

    await expect(
      peticionHttp('/api/auth/me', {
        esquema: z.unknown(),
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(espiaCierre).toHaveBeenCalledTimes(1)
  })

  it('TEST-FE-LIB-005: formato PrecioCOP formatea 250000 como COP', () => {
    render(<PrecioCOP valor={250000} />)
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
  })
})

describe('21.2 Autenticación y guardas (TEST-FE-AUTH-*)', () => {
  it('TEST-FE-AUTH-001: login válido establece sesión autenticada y redirige', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/mis-tickets' })

    const inputUsuario = await screen.findByLabelText(/Usuario o correo/i)
    const inputPassword = screen.getByLabelText(/^Contraseña$/i)

    await user.type(inputUsuario, 'andrea')
    await user.type(inputPassword, 'UnaFraseSeguraLarga2026!')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/mis-tickets')
    })
    expect(await screen.findByRole('heading', { name: /Mis tickets/i })).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-002: login 401 muestra "Credenciales inválidas"', async () => {
    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/login' })

    const inputUsuario = await screen.findByLabelText(/Usuario o correo/i)
    const inputPassword = screen.getByLabelText(/^Contraseña$/i)

    await user.type(inputUsuario, 'andrea')
    await user.type(inputPassword, 'incorrecta')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Credenciales inválidas/i,
    )
  })

  it('TEST-FE-AUTH-003: login sin campos muestra errores y realiza 0 peticiones', async () => {
    let peticiones = 0
    server.use(
      http.post('*/api/auth/login', () => {
        peticiones += 1
        return HttpResponse.json({})
      }),
    )

    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/login' })

    const boton = await screen.findByRole('button', { name: /Ingresar/i })
    await user.click(boton)

    expect(await screen.findByText(/Ingresa tu usuario o correo/i)).toBeInTheDocument()
    expect(screen.getByText(/Ingresa tu contraseña/i)).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('TEST-FE-AUTH-004: registro con contraseña corta (<12) muestra error y 0 peticiones', async () => {
    let peticiones = 0
    server.use(
      http.post('*/api/users', () => {
        peticiones += 1
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/registro' })

    await user.type(await screen.findByLabelText(/Nombre de usuario/i), 'andrea')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Andrea')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Ruiz')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1998-04-12')
    await user.type(screen.getByLabelText(/Contraseña \(mín\. 12 caracteres\)/i), 'corta123')

    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(
      await screen.findByText(/al menos 12 caracteres/i),
    ).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('TEST-FE-AUTH-005: registro 201 redirige a /login con aviso', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/registro' })

    await user.type(await screen.findByLabelText(/Nombre de usuario/i), 'andrea')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Andrea')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Ruiz')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1998-04-12')
    await user.type(
      screen.getByLabelText(/Contraseña \(mín\. 12 caracteres\)/i),
      'UnaFraseSeguraLarga2026!',
    )

    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
  })

  it('TEST-FE-AUTH-006: registro 409 muestra mensaje genérico de duplicado', async () => {
    server.use(
      http.post('*/api/users', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'Duplicate email',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/registro' })

    await user.type(await screen.findByLabelText(/Nombre de usuario/i), 'andrea')
    await user.type(screen.getByLabelText(/Correo electrónico/i), 'andrea@pulsepass.test')
    await user.type(screen.getByLabelText(/Nombres/i), 'Andrea')
    await user.type(screen.getByLabelText(/Apellidos/i), 'Ruiz')
    await user.type(screen.getByLabelText(/Fecha de nacimiento/i), '1998-04-12')
    await user.type(
      screen.getByLabelText(/Contraseña \(mín\. 12 caracteres\)/i),
      'UnaFraseSeguraLarga2026!',
    )

    await user.click(screen.getByRole('button', { name: /Crear cuenta/i }))

    expect(
      await screen.findByText(/El usuario o correo ya está registrado/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-007: RutaProtegida redirige anónimo a /login con state.desde', async () => {
    const { router } = renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: { estado: 'anonimo' },
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })
  })

  it('TEST-FE-AUTH-008: RutaPorRol redirige USER en /admin/eventos a /403', async () => {
    renderConProveedores({
      rutaInicial: '/admin/eventos',
      sesionInicial: SESION_USER_ANDREA,
    })

    expect(
      await screen.findByText(/No tienes permisos para acceder a esta sección/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-009: RutaPorRol ADMIN en /admin/eventos renderiza correctamente', async () => {
    renderConProveedores({
      rutaInicial: '/admin/eventos',
      sesionInicial: SESION_ADMIN,
    })

    expect(
      await screen.findByRole('heading', { name: /Administración de eventos/i }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-010: cerrar sesión limpia token y caché', async () => {
    const user = userEvent.setup()
    window.sessionStorage.setItem(
      CLAVE_SESION_STORAGE,
      JSON.stringify({ token: 'tok', expiraEn: Date.now() + 50000 }),
    )

    renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: SESION_USER_ANDREA,
    })

    const botonCerrar = await screen.findByRole('button', {
      name: /Cerrar sesión/i,
    })
    await user.click(botonCerrar)

    expect(window.sessionStorage.getItem(CLAVE_SESION_STORAGE)).toBeNull()
  })

  it('TEST-FE-AUTH-011: token expirado al restaurar sesión queda como anónimo', async () => {
    window.sessionStorage.setItem(
      CLAVE_SESION_STORAGE,
      JSON.stringify({ token: 'tok-vencido', expiraEn: Date.now() - 10_000 }),
    )

    const { router } = renderConProveedores({
      rutaInicial: '/cuenta',
      sesionInicial: undefined,
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(window.sessionStorage.getItem(CLAVE_SESION_STORAGE)).toBeNull()
  })
})

describe('21.3 Catálogo, artistas y sedes (TEST-FE-EVT/ART/VEN-*)', () => {
  it('TEST-FE-EVT-001: cartelera lista eventos publicados', async () => {
    renderConProveedores({ rutaInicial: '/eventos' })
    expect(
      await screen.findByText('Caribbean Music Fest 2026'),
    ).toBeInTheDocument()
    expect(screen.getByText('Cumbre Tech Caribe 2027')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: cartelera con lista vacía muestra estado vacío', async () => {
    server.use(
      http.get('*/api/events/published', () => HttpResponse.json([])),
    )

    renderConProveedores({ rutaInicial: '/eventos' })
    expect(
      await screen.findByText(/Aún no hay eventos publicados/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: cartelera filtra por texto y categoría actualizando la URL', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({ rutaInicial: '/eventos' })

    await screen.findByText('Caribbean Music Fest 2026')
    const buscador = screen.getByLabelText(/Buscar por nombre/i)
    await user.type(buscador, 'Cumbre')

    expect(router.state.location.search).toContain('q=Cumbre')
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Cumbre Tech Caribe 2027')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-004: detalle muestra evento, artistas y sede', async () => {
    renderConProveedores({ rutaInicial: '/eventos/CMF-2026' })

    expect(
      await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getByText('Marina Convention Center')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005: detalle ante 404 muestra "Evento no disponible"', async () => {
    renderConProveedores({ rutaInicial: '/eventos/NO-EXISTE-999' })

    expect(
      await screen.findByRole('heading', { name: /Evento no disponible/i }),
    ).toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: detalle de evento SOLD_OUT tiene la compra deshabilitada', async () => {
    renderConProveedores({
      rutaInicial: '/eventos/TECH-2027',
      sesionInicial: SESION_USER_ANDREA,
    })

    await screen.findByRole('heading', { name: 'Cumbre Tech Caribe 2027' })
    const botonesCompra = screen.getAllByRole('button', {
      name: /Comprar entrada/i,
    })
    for (const btn of botonesCompra) {
      expect(btn).toBeDisabled()
    }
  })

  it('TEST-FE-ART-001: lista de artistas activos', async () => {
    renderConProveedores({ rutaInicial: '/artistas' })
    expect(await screen.findByText('Solar Beat')).toBeInTheDocument()
    expect(screen.getByText('Neon Waves')).toBeInTheDocument()
    expect(screen.getByText('Caribbean Sound')).toBeInTheDocument()
  })

  it('TEST-FE-ART-002: detalle de artista con eventos asociados', async () => {
    renderConProveedores({ rutaInicial: '/artistas/1' })
    expect(
      await screen.findByRole('heading', { name: 'Solar Beat' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Caribbean Music Fest 2026'),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: id no numérico en /artistas/:id muestra 404 sin llamar a la API', async () => {
    let llamadasArtista = 0
    server.use(
      http.get('*/api/artists/:id', () => {
        llamadasArtista += 1
        return HttpResponse.json({})
      }),
    )

    renderConProveedores({ rutaInicial: '/artistas/abc' })
    expect(
      await screen.findByText(/No encontramos esta página/i),
    ).toBeInTheDocument()
    expect(llamadasArtista).toBe(0)
  })

  it('TEST-FE-VEN-001: lista y detalle de sede; 404 de sede inexistente', async () => {
    renderConProveedores({ rutaInicial: '/sedes' })
    expect(
      await screen.findByText('Marina Convention Center'),
    ).toBeInTheDocument()

    const { unmount } = renderConProveedores({
      rutaInicial: '/sedes/VEN-SMR-01',
    })
    expect(await screen.findByText('VEN-SMR-01')).toBeInTheDocument()
    unmount()

    renderConProveedores({ rutaInicial: '/sedes/SEDE-404' })
    expect(
      await screen.findByText(/No encontramos esta página/i),
    ).toBeInTheDocument()
  })
})

describe('21.4 Tickets (TEST-FE-TKT-*)', () => {
  it('TEST-FE-TKT-001 y TEST-FE-TKT-004: compra válida envía el email de la sesión, responde 201 y navega a confirmación', async () => {
    let cuerpoEnviado: Record<string, unknown> | null = null
    server.use(
      http.post('*/api/tickets', async ({ request }) => {
        cuerpoEnviado = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(TICKETS_MOCK[0], { status: 201 })
      }),
    )

    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: SESION_USER_ANDREA,
    })

    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    await user.click(screen.getByLabelText('VIP'))
    const botonesComprar = screen.getAllByRole('button', {
      name: /Comprar entrada/i,
    })
    await user.click(botonesComprar[0]!)

    const botonConfirmar = await screen.findByRole('button', {
      name: /^Confirmar$/i,
    })
    await user.click(botonConfirmar)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/compra/confirmacion/TKT-8F2A1C',
      )
    })
    expect(cuerpoEnviado).toMatchObject({
      userEmail: 'andrea@pulsepass.test',
      eventCode: 'CMF-2026',
      type: 'VIP',
    })
    expect(
      await screen.findByText(/¡Compra realizada con éxito!/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-002: compra anónima redirige a /login', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: { estado: 'anonimo' },
    })

    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    const botonesComprar = screen.getAllByRole('button', {
      name: /Comprar entrada/i,
    })
    await user.click(botonesComprar[0]!)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login')
    })
    expect(router.state.location.state).toMatchObject({
      desde: '/eventos/CMF-2026',
    })
  })

  it('TEST-FE-TKT-003: compra 409 muestra mensaje del backend en el modal sin cerrarlo', async () => {
    server.use(
      http.post('*/api/tickets', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El usuario no cumple la edad mínima del evento.',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/eventos/CMF-2026',
      sesionInicial: SESION_USER_ANDREA,
    })

    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    const botonesComprar = screen.getAllByRole('button', {
      name: /Comprar entrada/i,
    })
    await user.click(botonesComprar[0]!)

    await user.click(await screen.findByRole('button', { name: /^Confirmar$/i }))

    expect(
      await screen.findByText(/El usuario no cumple la edad mínima del evento/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-005 y TEST-FE-TKT-010: mis tickets lista, filtra por estado y oculta cancelar si status !== PAID', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: SESION_USER_ANDREA,
    })

    expect(await screen.findByText('Caribbean Music Fest 2026')).toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()

    // Solo hay 1 botón Cancelar (para el ticket PAID, no para el USED)
    const botonesCancelar = screen.getAllByRole('button', { name: /^Cancelar$/i })
    expect(botonesCancelar).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Usados' }))
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
    expect(screen.getByText('Noche de Jazz y Cultura')).toBeInTheDocument()
  })

  it('TEST-FE-TKT-006: mis tickets vacío muestra estado vacío', async () => {
    server.use(
      http.get('*/api/tickets/by-user', () => HttpResponse.json([])),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: SESION_USER_ANDREA,
    })

    expect(
      await screen.findByText(/Aún no tienes tickets/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-007: cancelar ticket PAID responde 200 y cierra el modal', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: SESION_USER_ANDREA,
    })

    const btnCancelar = await screen.findByRole('button', { name: /^Cancelar$/i })
    await user.click(btnCancelar)

    const btnConfirmar = await screen.findByRole('button', {
      name: /Cancelar ticket/i,
    })
    await user.click(btnConfirmar)

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /Cancelar ticket/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('TEST-FE-TKT-008: cancelar ticket con 409 muestra mensaje en el modal y lo mantiene abierto', async () => {
    server.use(
      http.patch('*/api/tickets/:ticketCode/cancel', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El ticket no puede cancelarse en su estado actual.',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/mis-tickets',
      sesionInicial: SESION_USER_ANDREA,
    })

    await user.click(await screen.findByRole('button', { name: /^Cancelar$/i }))
    await user.click(
      await screen.findByRole('button', { name: /Cancelar ticket/i }),
    )

    expect(
      await screen.findByText(
        /El ticket no puede cancelarse en su estado actual/i,
      ),
    ).toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: ticket ajeno (403/404) muestra "Ticket no disponible"', async () => {
    server.use(
      http.get('*/api/tickets/:ticketCode', () =>
        HttpResponse.json(
          { status: 403, message: 'Access denied' },
          { status: 403 },
        ),
      ),
    )

    renderConProveedores({
      rutaInicial: '/mis-tickets/TKT-AJENO',
      sesionInicial: SESION_USER_ANDREA,
    })

    expect(
      await screen.findByRole('heading', { name: /Ticket no disponible/i }),
    ).toBeInTheDocument()
  })
})

describe('21.5 STAFF y ADMIN (TEST-FE-STF-* y TEST-FE-ADM-*)', () => {
  it('TEST-FE-STF-001: validar ingreso busca ticket y lo marca como usado con éxito', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: SESION_STAFF_LAURA,
    })

    const input = await screen.findByLabelText(/Código de ticket/i)
    await user.type(input, 'TKT-8F2A1C')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    const btnUsar = await screen.findByRole('button', {
      name: /Marcar como usado/i,
    })
    await user.click(btnUsar)

    expect(await screen.findByText(/Ingreso registrado\./i)).toBeInTheDocument()
    expect(screen.getByText('USED')).toBeInTheDocument()
  })

  it('TEST-FE-STF-002: validar ingreso por segunda vez muestra 409', async () => {
    server.use(
      http.patch('*/api/tickets/:ticketCode/use', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El ticket ya fue utilizado. (409)',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: SESION_STAFF_LAURA,
    })

    const input = await screen.findByLabelText(/Código de ticket/i)
    await user.type(input, 'TKT-8F2A1C')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    await user.click(
      await screen.findByRole('button', { name: /Marcar como usado/i }),
    )

    expect(
      await screen.findByText(/El ticket ya fue utilizado/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-STF-003: validar ingreso con ticket inexistente muestra 404', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/staff/validacion',
      sesionInicial: SESION_STAFF_LAURA,
    })

    const input = await screen.findByLabelText(/Código de ticket/i)
    await user.type(input, 'TKT-NO-EXISTE')
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    expect(await screen.findByText(/Ticket no encontrado/i)).toBeInTheDocument()
  })

  it('TEST-FE-STF-004: tickets pagados de evento muestra tabla con filas', async () => {
    renderConProveedores({
      rutaInicial: '/staff/eventos/CMF-2026/tickets',
      sesionInicial: SESION_STAFF_LAURA,
    })

    const tabla = await screen.findByRole('table')
    expect(within(tabla).getByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(within(tabla).getByText('TKT-91B07D')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-001: crear evento con campos vacíos muestra errores y hace 0 peticiones', async () => {
    let peticiones = 0
    server.use(
      http.post('*/api/events', () => {
        peticiones += 1
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: SESION_ADMIN,
    })

    const btnCrear = await screen.findByRole('button', { name: /Crear evento/i })
    await user.click(btnCrear)

    expect(
      await screen.findByText(/El código del evento es obligatorio/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/El nombre del evento es obligatorio/i),
    ).toBeInTheDocument()
    expect(peticiones).toBe(0)
  })

  it('TEST-FE-ADM-002: crear evento válido (201) navega a la página de gestión', async () => {
    const user = userEvent.setup()
    const { router } = renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: SESION_ADMIN,
    })

    await screen.findByRole('option', {
      name: /Marina Convention Center \(VEN-SMR-01\)/i,
    })

    await user.type(screen.getByLabelText(/Código del evento/i), 'EVT-2027')
    await user.type(screen.getByLabelText(/^Nombre$/i), 'Festival Caribe 2027')
    await user.type(screen.getByLabelText(/Fecha y hora/i), '2027-06-15T20:00')
    await user.selectOptions(screen.getByLabelText(/^Sede$/i), 'VEN-SMR-01')

    await user.click(screen.getByRole('button', { name: /Crear evento/i }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/admin/eventos/EVT-2027')
    })
  })

  it('TEST-FE-ADM-003: crear evento 400 con details mapea errores a los campos', async () => {
    server.use(
      http.post('*/api/events', () =>
        HttpResponse.json(
          {
            status: 400,
            error: 'Bad Request',
            message: 'Validation error',
            details: {
              eventCode: 'Formato de código inválido en el servidor',
            },
          },
          { status: 400 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/admin/eventos/nuevo',
      sesionInicial: SESION_ADMIN,
    })

    await screen.findByRole('option', {
      name: /Marina Convention Center \(VEN-SMR-01\)/i,
    })

    await user.type(screen.getByLabelText(/Código del evento/i), 'EVT-BAD')
    await user.type(screen.getByLabelText(/^Nombre$/i), 'Festival')
    await user.type(screen.getByLabelText(/Fecha y hora/i), '2027-06-15T20:00')
    await user.selectOptions(screen.getByLabelText(/^Sede$/i), 'VEN-SMR-01')

    await user.click(screen.getByRole('button', { name: /Crear evento/i }))

    expect(
      await screen.findByText(/Formato de código inválido en el servidor/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ADM-004: publicar evento cambia el badge a PUBLISHED', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/admin/eventos/DRAFT-01',
      sesionInicial: SESION_ADMIN,
    })

    expect(await screen.findByText('DRAFT')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Publicar evento/i }))

    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-005: publicar con error 409 muestra aviso de conflicto', async () => {
    server.use(
      http.patch('*/api/events/:eventCode/publish', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El evento no tiene artistas asociados para publicarse.',
          },
          { status: 409 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/admin/eventos/DRAFT-01',
      sesionInicial: SESION_ADMIN,
    })

    await user.click(
      await screen.findByRole('button', { name: /Publicar evento/i }),
    )

    expect(
      await screen.findByText(
        /El evento no tiene artistas asociados para publicarse/i,
      ),
    ).toBeInTheDocument()
  })

  it('TEST-FE-ADM-006: asociar artista lo agrega a la lista y ante duplicado muestra 409', async () => {
    const user = userEvent.setup()
    renderConProveedores({
      rutaInicial: '/admin/eventos/DRAFT-01',
      sesionInicial: SESION_ADMIN,
    })

    const selector = await screen.findByLabelText(/Agregar artista/i)
    await screen.findByRole('option', { name: 'Neon Waves' })
    await user.selectOptions(selector, '2')
    await user.click(screen.getByRole('button', { name: /\+ Asociar/i }))

    expect(
      await screen.findByText(/Artista asociado al evento/i),
    ).toBeInTheDocument()

    server.use(
      http.post('*/api/events/:eventCode/artists/:artistId', () =>
        HttpResponse.json(
          {
            status: 409,
            error: 'Conflict',
            message: 'El artista ya se encuentra asociado a este evento.',
          },
          { status: 409 },
        ),
      ),
    )

    await user.click(screen.getByRole('button', { name: /\+ Asociar/i }))
    expect(
      await screen.findByText(
        /El artista ya se encuentra asociado a este evento/i,
      ),
    ).toBeInTheDocument()
  })
})

describe('21.6 Transversales (TEST-FE-GEN-*)', () => {
  it('TEST-FE-GEN-001: ruta inexistente muestra página 404', async () => {
    renderConProveedores({ rutaInicial: '/ruta-que-no-existe-123' })
    expect(
      await screen.findByText(/No encontramos esta página/i),
    ).toBeInTheDocument()
  })

  it('TEST-FE-GEN-002: errorElement muestra mensaje seguro sin stack trace', async () => {
    renderConProveedores({
      rutaInicial: '/fallo',
      rutasPersonalizadas: [
        {
          path: '/fallo',
          loader: () => {
            throw new Error('Fallo interno simulado con stack confidencial')
          },
          Component: () => <div>Nunca</div>,
          ErrorBoundary: ErrorPagina,
        },
      ],
    })

    expect(
      await screen.findByRole('heading', { name: /¡Ups! Algo salió mal\./i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/stack confidencial/i),
    ).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: navbar muestra enlaces según el rol del usuario', async () => {
    const { unmount } = renderConProveedores({
      rutaInicial: '/',
      sesionInicial: { estado: 'anonimo' },
    })
    const navAnon = await screen.findByRole('navigation', { name: /Principal/i })
    expect(within(navAnon).getByText('Eventos')).toBeInTheDocument()
    expect(within(navAnon).queryByText('Mis tickets')).not.toBeInTheDocument()
    expect(
      within(navAnon).queryByText('Administrar eventos'),
    ).not.toBeInTheDocument()
    unmount()

    renderConProveedores({
      rutaInicial: '/',
      sesionInicial: SESION_ADMIN,
    })
    const navAdmin = await screen.findByRole('navigation', { name: /Principal/i })
    expect(within(navAdmin).getByText('Validar ingreso')).toBeInTheDocument()
    expect(within(navAdmin).getByText('Tickets pagados')).toBeInTheDocument()
    expect(within(navAdmin).getByText('Administrar eventos')).toBeInTheDocument()
  })

  it('TEST-FE-GEN-004: menú móvil abre y cierra con teclado (Escape)', async () => {
    const user = userEvent.setup()
    renderConProveedores({ rutaInicial: '/' })

    const botonMenu = await screen.findByRole('button', { name: /Abrir menú/i })
    await user.click(botonMenu)

    expect(
      screen.getByRole('navigation', { name: /Menú móvil/i }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('navigation', { name: /Menú móvil/i }),
    ).not.toBeInTheDocument()
  })
})
