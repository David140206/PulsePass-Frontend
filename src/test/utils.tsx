import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import type { Sesion } from '../funcionalidades/auth/tipos'
import { crearQueryClient } from '../lib/queryClient'
import { rutasApp } from '../router'

export interface OpcionesRenderPrueba {
  rutaInicial?: string
  sesionInicial?: Sesion
  rutasPersonalizadas?: RouteObject[]
}

export const SESION_USER_ANDREA: Sesion = {
  estado: 'autenticado',
  token: 'token-andrea-test',
  expiraEn: Date.now() + 900_000,
  usuario: {
    id: 10,
    username: 'Andrea',
    email: 'andrea@pulsepass.test',
    active: true,
    roles: ['USER'],
  },
}

export const SESION_STAFF_LAURA: Sesion = {
  estado: 'autenticado',
  token: 'token-laura-staff',
  expiraEn: Date.now() + 900_000,
  usuario: {
    id: 20,
    username: 'Laura',
    email: 'laura@pulsepass.test',
    active: true,
    roles: ['STAFF'],
  },
}

export const SESION_ADMIN: Sesion = {
  estado: 'autenticado',
  token: 'token-admin-test',
  expiraEn: Date.now() + 900_000,
  usuario: {
    id: 1,
    username: 'Administración',
    email: 'admin@pulsepass.test',
    active: true,
    roles: ['ADMIN'],
  },
}

export function renderConProveedores(opciones: OpcionesRenderPrueba = {}) {
  const { rutaInicial = '/', rutasPersonalizadas } = opciones
  const sesionEfectiva: Sesion | undefined =
    'sesionInicial' in opciones
      ? opciones.sesionInicial
      : { estado: 'anonimo' }

  const queryClient = crearQueryClient()
  const router = createMemoryRouter(rutasPersonalizadas ?? rutasApp, {
    initialEntries: [rutaInicial],
  })

  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider sesionInicial={sesionEfectiva}>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )

  return {
    ...resultado,
    router,
    queryClient,
  }
}
