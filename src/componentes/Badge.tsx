import type { ReactNode } from 'react'
import clsx from 'clsx'

export type TonoBadge =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SOLD_OUT'
  | 'CANCELLED'
  | 'FINISHED'
  | 'RESERVED'
  | 'PAID'
  | 'USED'
  | 'ACTIVA'
  | 'INACTIVA'
  | 'ROL'

const clasesPorTono: Record<TonoBadge, string> = {
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PUBLISHED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  SOLD_OUT:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  ACTIVA:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  INACTIVA: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  ROL: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/90 dark:text-indigo-200',
}

export interface PropsBadge {
  tono: TonoBadge
  children?: ReactNode
  className?: string
}

export default function Badge({ tono, children, className }: PropsBadge) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        clasesPorTono[tono],
        className,
      )}
    >
      {children ?? tono}
    </span>
  )
}
