import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { establecerTokenMemoria } from '../lib/http'
import { server } from './mocks/handlers'

// Compatibilidad entre AbortSignal de jsdom y Request/fetch nativo (undici) en Node 22
const OriginalRequest = globalThis.Request
class JSDOMCompatibleRequest extends OriginalRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init && 'signal' in init) {
      const copiaInit = { ...init }
      delete copiaInit.signal
      super(input, copiaInit)
    } else {
      super(input, init)
    }
  }
}
globalThis.Request = JSDOMCompatibleRequest as typeof Request
if (typeof window !== 'undefined') {
  window.Request = JSDOMCompatibleRequest as typeof Request
}

// Polyfill para HTMLDialogElement en jsdom
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute('open', '')
    }
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  }
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  establecerTokenMemoria(null)
  window.sessionStorage.clear()
})

afterAll(() => {
  server.close()
})
