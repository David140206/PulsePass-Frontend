import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './funcionalidades/auth/AuthContext'
import { queryClient } from './lib/queryClient'
import { crearEnrutadorApp } from './router'
import './index.css'

const router = crearEnrutadorApp()

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
