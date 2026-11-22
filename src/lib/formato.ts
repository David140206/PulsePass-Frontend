const formateadorCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formateadorFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const formateadorFechaHora = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export function formatearPrecioCOP(valor: number): string {
  return formateadorCOP.format(valor)
}

function normalizarIsoUtc(fechaIso: string): Date {
  const limpia = fechaIso.trim()
  if (!limpia) return new Date(NaN)
  const conZona =
    limpia.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(limpia)
      ? limpia
      : limpia.includes('T')
        ? `${limpia}Z`
        : `${limpia}T00:00:00Z`
  return new Date(conZona)
}

export function formatearFecha(fechaIso: string): string {
  const fecha = normalizarIsoUtc(fechaIso)
  if (Number.isNaN(fecha.getTime())) return fechaIso
  return formateadorFecha.format(fecha)
}

export function formatearFechaHora(fechaIso: string): string {
  const fecha = normalizarIsoUtc(fechaIso)
  if (Number.isNaN(fecha.getTime())) return fechaIso
  return formateadorFechaHora.format(fecha)
}

export function obtenerIniciales(nombre: string): string {
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0)
  if (partes.length === 0) return 'PP'
  if (partes.length === 1) {
    return (partes[0]?.slice(0, 2) ?? 'PP').toUpperCase()
  }
  const primera = partes[0]?.[0] ?? 'P'
  const segunda = partes[1]?.[0] ?? 'P'
  return `${primera}${segunda}`.toUpperCase()
}
