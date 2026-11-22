import { formatearPrecioCOP } from '../lib/formato'

export interface PropsPrecioCOP {
  valor: number
  className?: string
}

export default function PrecioCOP({ valor, className }: PropsPrecioCOP) {
  return <span className={className}>{formatearPrecioCOP(valor)}</span>
}
