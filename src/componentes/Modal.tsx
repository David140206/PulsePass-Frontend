import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconoCerrar } from './Iconos'

export interface PropsModal {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

export default function Modal({ abierto, titulo, onCerrar, children }: PropsModal) {
  const idTitulo = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (abierto) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else if (!dialog.open) {
        dialog.setAttribute('open', '')
      }
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close()
      } else {
        dialog.removeAttribute('open')
      }
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCerrar()
      }
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      onClick={(e) => {
        const dialog = dialogRef.current
        if (!dialog) return
        const rect = dialog.getBoundingClientRect()
        if (
          rect.width > 0 &&
          (e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom)
        ) {
          onCerrar()
        }
      }}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <h2 id={idTitulo} className="font-titulo text-lg font-bold">
          {titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar ventana"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <IconoCerrar className="h-4 w-4" />
        </button>
      </div>
      <div>{children}</div>
    </dialog>
  )
}
