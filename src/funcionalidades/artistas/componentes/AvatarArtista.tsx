import { Link } from 'react-router'
import clsx from 'clsx'
import { obtenerIniciales } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { ArtistResponse } from '../tipos'

const coloresAvatar: Record<'indigo' | 'emerald' | 'sky', string> = {
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200',
  emerald:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-200',
}

function seleccionarTono(nombre: string): 'indigo' | 'emerald' | 'sky' {
  const n = nombre.toLowerCase()
  if (n.includes('neon')) return 'emerald'
  if (n.includes('caribbean')) return 'sky'
  return 'indigo'
}

export interface PropsAvatarArtista {
  artista: ArtistResponse
  variante?: 'chip' | 'tarjeta'
}

export default function AvatarArtista({
  artista,
  variante = 'chip',
}: PropsAvatarArtista) {
  const iniciales = obtenerIniciales(artista.stageName)
  const tono = seleccionarTono(artista.stageName)

  if (variante === 'tarjeta') {
    return (
      <Link
        to={RUTAS.artista(artista.id)}
        className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          className={clsx(
            'mb-3 flex h-16 w-16 items-center justify-center rounded-full font-titulo text-lg font-bold',
            coloresAvatar[tono],
          )}
        >
          {iniciales}
        </div>
        <span className="font-titulo text-sm font-bold text-slate-900 dark:text-slate-100">
          {artista.stageName}
        </span>
        {artista.genre ? (
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {artista.genre}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="inline-flex items-center gap-2.5 rounded-full py-1 pr-3 text-sm font-medium text-slate-800 hover:text-marca-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:text-slate-200 dark:hover:text-marca-500"
    >
      <span
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
          coloresAvatar[tono],
        )}
      >
        {iniciales}
      </span>
      <span>{artista.stageName}</span>
    </Link>
  )
}
