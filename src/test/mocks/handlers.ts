import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const SEDES_MOCK = [
  {
    id: 1,
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    capacity: 3,
    active: true,
  },
  {
    id: 2,
    code: 'VEN-BAQ-01',
    name: 'Centro de Convenciones Caribe',
    city: 'Barranquilla',
    capacity: 1200,
    active: true,
  },
]

export const ARTISTAS_MOCK = [
  {
    id: 1,
    stageName: 'Solar Beat',
    genre: 'Electrónica',
    country: 'Colombia',
    active: true,
  },
  {
    id: 2,
    stageName: 'Neon Waves',
    genre: 'Synthwave',
    country: 'Colombia',
    active: true,
  },
  {
    id: 3,
    stageName: 'Caribbean Sound',
    genre: 'Fusión caribeña',
    country: 'Colombia',
    active: true,
  },
]

export const EVENTOS_MOCK = [
  {
    id: 1,
    eventCode: 'CMF-2026',
    name: 'Caribbean Music Fest 2026',
    description:
      'Tres noches de música caribeña frente a la bahía de Santa Marta, con artistas de la región y propuestas de electrónica y fusión.',
    category: 'MUSIC' as const,
    status: 'PUBLISHED' as const,
    eventDate: '2026-12-12T20:00:00',
    minimumAge: 18,
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
    city: 'Santa Marta',
    venueCapacity: 3,
    artists: [ARTISTAS_MOCK[0]!, ARTISTAS_MOCK[1]!],
  },
  {
    id: 2,
    eventCode: 'TECH-2027',
    name: 'Cumbre Tech Caribe 2027',
    description: 'Innovación y desarrollo tecnológico en el Caribe.',
    category: 'TECHNOLOGY' as const,
    status: 'SOLD_OUT' as const,
    eventDate: '2027-01-20T09:00:00',
    minimumAge: 0,
    venueCode: 'VEN-BAQ-01',
    venueName: 'Centro de Convenciones Caribe',
    city: 'Barranquilla',
    venueCapacity: 1200,
    artists: [],
  },
  {
    id: 3,
    eventCode: 'DRAFT-01',
    name: 'Evento en Borrador 2026',
    description: 'Borrador interno.',
    category: 'MUSIC' as const,
    status: 'DRAFT' as const,
    eventDate: '2026-12-20T20:00:00',
    minimumAge: 18,
    venueCode: 'VEN-SMR-01',
    venueName: 'Marina Convention Center',
    city: 'Santa Marta',
    venueCapacity: 3,
    artists: [ARTISTAS_MOCK[0]!],
  },
]

export const TICKETS_MOCK = [
  {
    id: 1,
    ticketCode: 'TKT-8F2A1C',
    type: 'VIP' as const,
    price: 250000,
    status: 'PAID' as const,
    purchaseDate: '2026-11-05T14:32:00',
    userEmail: 'andrea@pulsepass.test',
    userFullName: 'Andrea Ruiz',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
  {
    id: 2,
    ticketCode: 'TKT-5C90E2',
    type: 'GENERAL' as const,
    price: 90000,
    status: 'USED' as const,
    purchaseDate: '2026-10-12T10:00:00',
    userEmail: 'andrea@pulsepass.test',
    userFullName: 'Andrea Ruiz',
    eventCode: 'CMF-2026',
    eventName: 'Noche de Jazz y Cultura',
  },
]

export const handlers = [
  // 1. GET /api/venues/active
  http.get('*/api/venues/active', () => {
    return HttpResponse.json(SEDES_MOCK)
  }),

  // 2. GET /api/venues/:code
  http.get('*/api/venues/:code', ({ params }) => {
    const code = String(params.code)
    const sede = SEDES_MOCK.find((s) => s.code === code)
    if (!sede) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Sede no encontrada',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(sede)
  }),

  // 3. GET /api/artists/active
  http.get('*/api/artists/active', () => {
    return HttpResponse.json(ARTISTAS_MOCK)
  }),

  // 4. GET /api/artists/by-stage-name
  http.get('*/api/artists/by-stage-name', ({ request }) => {
    const url = new URL(request.url)
    const stageName = url.searchParams.get('stageName') ?? ''
    const artista = ARTISTAS_MOCK.find(
      (a) => a.stageName.toLowerCase() === stageName.toLowerCase(),
    )
    if (!artista) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Artista no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(artista)
  }),

  // 5. GET /api/artists/:id
  http.get('*/api/artists/:id', ({ params }) => {
    const id = Number(params.id)
    const artista = ARTISTAS_MOCK.find((a) => a.id === id)
    if (!artista) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Artista no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(artista)
  }),

  // 6. GET /api/events/published
  http.get('*/api/events/published', () => {
    return HttpResponse.json(
      EVENTOS_MOCK.filter((e) => e.status !== 'DRAFT'),
    )
  }),

  // 7. GET /api/events/by-artist
  http.get('*/api/events/by-artist', ({ request }) => {
    const url = new URL(request.url)
    const stageName = url.searchParams.get('stageName') ?? ''
    const filtrados = EVENTOS_MOCK.filter(
      (e) =>
        e.status === 'PUBLISHED' &&
        e.artists.some(
          (a) => a.stageName.toLowerCase() === stageName.toLowerCase(),
        ),
    )
    return HttpResponse.json(filtrados)
  }),

  // 8. GET /api/events/:eventCode/tickets/paid
  http.get('*/api/events/:eventCode/tickets/paid', () => {
    return HttpResponse.json([
      TICKETS_MOCK[0]!,
      {
        id: 3,
        ticketCode: 'TKT-91B07D',
        type: 'GENERAL',
        price: 120000,
        status: 'PAID',
        purchaseDate: '2026-11-06T12:00:00',
        userEmail: 'carlos@pulsepass.test',
        userFullName: 'Carlos Peña',
        eventCode: 'CMF-2026',
        eventName: 'Caribbean Music Fest 2026',
      },
    ])
  }),

  // 9. GET /api/events/:eventCode
  http.get('*/api/events/:eventCode', ({ params }) => {
    const code = String(params.eventCode)
    const ev = EVENTOS_MOCK.find((e) => e.eventCode === code)
    if (!ev) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Evento no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(ev)
  }),

  // 10. POST /api/events
  http.post('*/api/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 99,
        eventCode: String(body.eventCode ?? 'EVT-NEW-01'),
        name: String(body.name ?? 'Nuevo Evento'),
        description: String(body.description ?? ''),
        category: String(body.category ?? 'MUSIC'),
        status: 'DRAFT',
        eventDate: String(body.eventDate ?? '2026-12-12T20:00:00'),
        minimumAge: Number(body.minimumAge ?? 18),
        venueCode: String(body.venueCode ?? 'VEN-SMR-01'),
        venueName: 'Marina Convention Center',
        artists: [],
      },
      { status: 201 },
    )
  }),

  // 11. PATCH /api/events/:eventCode/publish
  http.patch('*/api/events/:eventCode/publish', ({ params }) => {
    const code = String(params.eventCode)
    const base = EVENTOS_MOCK.find((e) => e.eventCode === code) ?? EVENTOS_MOCK[2]!
    return HttpResponse.json({
      ...base,
      eventCode: code,
      status: 'PUBLISHED',
    })
  }),

  // 12. POST /api/events/:eventCode/artists/:artistId
  http.post('*/api/events/:eventCode/artists/:artistId', ({ params }) => {
    const code = String(params.eventCode)
    const artistId = Number(params.artistId)
    const base = EVENTOS_MOCK.find((e) => e.eventCode === code) ?? EVENTOS_MOCK[0]!
    const artista = ARTISTAS_MOCK.find((a) => a.id === artistId) ?? ARTISTAS_MOCK[1]!
    return HttpResponse.json({
      ...base,
      eventCode: code,
      artists: [...base.artists.filter((a) => a.id !== artista.id), artista],
    })
  }),

  // 13. POST /api/users
  http.post('*/api/users', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        id: 10,
        username: String(body.username ?? 'andrea'),
        email: String(body.email ?? 'andrea@pulsepass.test'),
        active: true,
      },
      { status: 201 },
    )
  }),

  // 14. GET /api/users/by-email
  http.get('*/api/users/by-email', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') ?? 'andrea@pulsepass.test'
    return HttpResponse.json({
      id: 10,
      username: 'andrea',
      email,
      firstName: 'Andrea',
      lastName: 'Ruiz',
      birthDate: '1998-04-12',
      active: true,
    })
  }),

  // 15. GET /api/users/by-username
  http.get('*/api/users/by-username', ({ request }) => {
    const url = new URL(request.url)
    const username = url.searchParams.get('username') ?? 'andrea'
    return HttpResponse.json({
      id: 10,
      username,
      email: 'andrea@pulsepass.test',
      active: true,
    })
  }),

  // 16. POST /api/auth/login
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { identifier?: string; password?: string }
    if (body.password === 'incorrecta') {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials',
          details: {},
        },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      accessToken: 'jwt-token-simulado-valido',
      tokenType: 'Bearer',
      expiresIn: 900,
    })
  }),

  // 17. GET /api/auth/me
  http.get('*/api/auth/me', () => {
    return HttpResponse.json({
      id: 10,
      username: 'Andrea',
      email: 'andrea@pulsepass.test',
      active: true,
      roles: ['ROLE_USER'],
    })
  }),

  // 18. POST /api/tickets
  http.post('*/api/tickets', async ({ request }) => {
    const body = (await request.json()) as {
      userEmail: string
      eventCode: string
      type: 'GENERAL' | 'VIP' | 'BACKSTAGE' | 'STUDENT'
    }
    return HttpResponse.json(
      {
        id: 50,
        ticketCode: 'TKT-8F2A1C',
        type: body.type,
        price: 250000,
        status: 'PAID',
        purchaseDate: '2026-11-09T15:00:00',
        userEmail: body.userEmail,
        userFullName: 'Andrea Ruiz',
        eventCode: body.eventCode,
        eventName: 'Caribbean Music Fest 2026',
      },
      { status: 201 },
    )
  }),

  // 19. GET /api/tickets/by-user
  http.get('*/api/tickets/by-user', () => {
    return HttpResponse.json(TICKETS_MOCK)
  }),

  // 20. GET /api/tickets/:ticketCode
  http.get('*/api/tickets/:ticketCode', ({ params }) => {
    const code = String(params.ticketCode)
    const encontrado = TICKETS_MOCK.find((t) => t.ticketCode === code)
    if (!encontrado) {
      return HttpResponse.json(
        {
          timestamp: '2026-11-09T10:00:00',
          status: 404,
          error: 'Not Found',
          message: 'Ticket no encontrado',
          details: {},
        },
        { status: 404 },
      )
    }
    return HttpResponse.json(encontrado)
  }),

  // 21. PATCH /api/tickets/:ticketCode/cancel
  http.patch('*/api/tickets/:ticketCode/cancel', ({ params }) => {
    const code = String(params.ticketCode)
    const base = TICKETS_MOCK.find((t) => t.ticketCode === code) ?? TICKETS_MOCK[0]!
    return HttpResponse.json({
      ...base,
      ticketCode: code,
      status: 'CANCELLED',
    })
  }),

  // 22. PATCH /api/tickets/:ticketCode/use
  http.patch('*/api/tickets/:ticketCode/use', ({ params }) => {
    const code = String(params.ticketCode)
    const base = TICKETS_MOCK.find((t) => t.ticketCode === code) ?? TICKETS_MOCK[0]!
    return HttpResponse.json({
      ...base,
      ticketCode: code,
      status: 'USED',
    })
  }),
]

export const server = setupServer(...handlers)
