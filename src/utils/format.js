export function formatMeters(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return value.toFixed(digits).replace('.', ',')
}

export function formatDegrees(value) {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}°`
}

export function formatInt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
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

function toDMS(value) {
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const min = Math.round((abs - deg) * 60)
  return min === 60 ? `${deg + 1}° 0'` : `${deg}° ${min}'`
}

export function formatCoords(lat, lon) {
  if (lat === null || lat === undefined || lon === null || lon === undefined) return '—'
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${toDMS(lat)} ${latDir} · ${toDMS(lon)} ${lonDir}`
}
