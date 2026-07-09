export function formatMeters(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return value.toFixed(digits).replace('.', ',')
}

export function formatDegrees(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}°`
}

export function formatKmh(value) {
  if (value === null || value === undefined) return '—'
  return Math.round(value)
}

export function formatWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
}

export function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDate()
}
