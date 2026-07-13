import axios from 'axios'

const CORS_PROXY = 'https://corsproxy.io/?url='
const TABUA_MARE_BASE = 'https://tabuamare.devtu.qzz.io/api/v2'
const MAX_HARBOR_DISTANCE_KM = 200

const tabuaMareClient = axios.create({ timeout: 10000 })

function proxied(path) {
  return `${CORS_PROXY}${encodeURIComponent(TABUA_MARE_BASE + path)}`
}

export async function fetchTide({ lat, lon }) {
  const harbor = await findNearestHarbor(lat, lon)
  if (!harbor) return null

  const utcOffsetHours = parseUtcOffset(harbor.timezone)
  const extremes = await fetchExtremes(harbor, utcOffsetHours)
  if (extremes.length === 0) return null

  const now = new Date()
  const prev = [...extremes].reverse().find((e) => e.time <= now)
  const next = extremes.find((e) => e.time > now)

  const current = interpolateHeight(prev, next, now)
  const trend = next ? (next.type === 'high' ? 'Subindo' : 'Descendo') : null
  const nextHigh = extremes.find((e) => e.time > now && e.type === 'high')
  const nextLow = extremes.find((e) => e.time > now && e.type === 'low')

  return {
    current,
    trend,
    high: nextHigh ? { time: nextHigh.time, height: nextHigh.height } : null,
    low: nextLow ? { time: nextLow.time, height: nextLow.height } : null,
    extremes,
  }
}

export function tideHeightAt(extremes, date) {
  const prev = [...extremes].reverse().find((e) => e.time <= date)
  const next = extremes.find((e) => e.time > date)
  return interpolateHeight(prev, next, date)
}

async function findNearestHarbor(lat, lon) {
  const { data } = await tabuaMareClient.get(
    proxied(`/nearest-harbor-independent-state/[${lat},${lon}]`)
  )
  const harbor = data?.data?.[0]
  const station = harbor?.geo_location?.[0]
  if (!harbor || !station) return null

  const distanceKm = haversineKm(lat, lon, Number(station.lat), Number(station.lng))
  if (distanceKm > MAX_HARBOR_DISTANCE_KM) return null

  return harbor
}

async function fetchExtremes(harbor, utcOffsetHours) {
  const localNow = new Date(Date.now() + utcOffsetHours * 3600 * 1000)
  const days = [-1, 0, 1, 2, 3, 4, 5, 6].map((offset) => addUtcDays(localNow, offset))
  const byMonth = groupByMonth(days)

  const responses = await Promise.all(
    Object.entries(byMonth).map(([month, dayNums]) =>
      tabuaMareClient.get(proxied(`/tabua-mare/${harbor.id}/${month}/[${dayNums.join(',')}]`))
    )
  )

  const extremes = []
  for (const res of responses) {
    const table = res.data?.data?.[0]
    for (const month of table?.months || []) {
      for (const day of month.days || []) {
        for (const point of day.hours || []) {
          extremes.push({
            time: toUtcDate(table.year, month.month, day.day, point.hour, utcOffsetHours),
            height: point.level,
            type: point.level >= harbor.mean_level ? 'high' : 'low',
          })
        }
      }
    }
  }

  return extremes.sort((a, b) => a.time - b.time)
}

function groupByMonth(dates) {
  const map = {}
  for (const d of dates) {
    const month = d.getUTCMonth() + 1
    const day = d.getUTCDate()
    if (!map[month]) map[month] = new Set()
    map[month].add(day)
  }
  return Object.fromEntries(Object.entries(map).map(([m, set]) => [m, [...set].sort((a, b) => a - b)]))
}

function addUtcDays(date, days) {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function toUtcDate(year, month, day, hourStr, utcOffsetHours) {
  const [h, m, s] = hourStr.split(':').map(Number)
  const asIfUtc = Date.UTC(year, month - 1, day, h, m, s || 0)
  return new Date(asIfUtc - utcOffsetHours * 3600 * 1000)
}

function parseUtcOffset(tzString) {
  const match = /UTC\s*([+-]?\d+(?:\.\d+)?)/.exec(tzString || '')
  return match ? parseFloat(match[1]) : 0
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function interpolateHeight(prev, next, now) {
  if (!prev || !next) return prev?.height ?? next?.height ?? null
  const span = next.time - prev.time
  const elapsed = now - prev.time
  const t = span > 0 ? elapsed / span : 0
  const eased = (1 - Math.cos(t * Math.PI)) / 2
  return prev.height + (next.height - prev.height) * eased
}
