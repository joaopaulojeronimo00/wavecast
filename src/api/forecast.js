import { marineClient, weatherClient, geocodeClient } from './client'
import { getMoonPhase } from '../utils/moonPhase'
import { fetchTide, tideHeightAt } from '../utils/tide'

export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return []
  const { data } = await geocodeClient.get('/search', {
    params: { name: query, count: 5, language: 'pt', format: 'json' },
  })
  return (data.results || []).map((r) => ({
    id: r.id,
    name: r.name,
    admin: r.admin1,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export async function fetchForecast({ lat, lon, timezone = 'auto' }) {
  const [marineRes, weatherRes, tideRes] = await Promise.all([
    marineClient.get('/marine', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,wave_direction,swell_wave_height,sea_surface_temperature',
        daily: 'wave_height_max,wave_period_max',
        timezone,
      },
    }),
    weatherClient.get('/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly:
          'temperature_2m,apparent_temperature,windspeed_10m,winddirection_10m,windgusts_10m,relativehumidity_2m,dewpoint_2m,uv_index',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone,
      },
    }),
    fetchTide({ lat, lon }).catch(() => null),
  ])

  return normalizeForecast(marineRes.data, weatherRes.data, tideRes)
}

function normalizeForecast(marine, weather, tide) {
  const now = new Date()
  const hourly = marine.hourly?.time || []
  const utcOffsetSeconds = marine.utc_offset_seconds ?? 0
  const tz = weather.timezone || marine.timezone
  const nowIso = now.toISOString().slice(0, 13)
  const nowIdx = hourly.findIndex((t) => t.startsWith(nowIso))

  const dailyDates = marine.daily?.time || []
  const days = dailyDates.map((date, dayIndex) => {
    const hourIndices = hourly.reduce((acc, t, i) => (t.startsWith(date) ? [...acc, i] : acc), [])
    const isToday = dayIndex === 0 && hourIndices.includes(nowIdx)
    const repIdx = isToday
      ? nowIdx
      : hourIndices.find((i) => hourly[i].endsWith('T12:00')) ?? hourIndices[0] ?? 0

    const seriesIndices = isToday
      ? Array.from({ length: 24 }, (_, i) => nowIdx + i).filter((i) => i < hourly.length)
      : hourIndices

    const next24 = seriesIndices
      .map((i) => extractHourPoint(marine, weather, tide, i, utcOffsetSeconds))
      .filter((p) => p.wave !== null)

    const repDate = hourly[repIdx] ? localToUtc(hourly[repIdx], utcOffsetSeconds) : now

    return {
      date,
      isToday,
      current: extractCurrent(marine, weather, repIdx),
      next24,
      tide: buildDayTide(tide, date, repDate, utcOffsetSeconds, tz),
      moon: getMoonPhase(repDate),
      wave: marine.daily.wave_height_max?.[dayIndex] ?? null,
      temp: weather.daily?.temperature_2m_max?.[dayIndex] ?? null,
    }
  })

  const today = days[0]

  return {
    updatedAt: now,
    current: today?.current,
    tide: today?.tide,
    moon: today?.moon,
    next24: today?.next24 ?? [],
    daily: days.map((d) => ({ date: d.date, wave: d.wave, temp: d.temp })),
    days,
  }
}

function extractCurrent(marine, weather, idx) {
  const waveHeight = marine.hourly.wave_height?.[idx] ?? null
  const wavePeriod = marine.hourly.wave_period?.[idx] ?? null
  const waveDirection = marine.hourly.wave_direction?.[idx] ?? null
  const waterTemperature = marine.hourly.sea_surface_temperature?.[idx] ?? null

  const windSpeed = weather.hourly.windspeed_10m?.[idx] ?? null
  const windDirection = weather.hourly.winddirection_10m?.[idx] ?? null
  const windGusts = weather.hourly.windgusts_10m?.[idx] ?? null
  const temperature = weather.hourly.temperature_2m?.[idx] ?? null
  const apparentTemperature = weather.hourly.apparent_temperature?.[idx] ?? null
  const humidity = weather.hourly.relativehumidity_2m?.[idx] ?? null
  const dewpoint = weather.hourly.dewpoint_2m?.[idx] ?? null
  const uv = weather.hourly.uv_index?.[idx] ?? null

  return {
    waveHeight,
    wavePeriod,
    waveDirection,
    windSpeed,
    windDirection,
    windGusts,
    windShore: classifyWindShore(windDirection, waveDirection),
    temperature,
    apparentTemperature,
    waterTemperature,
    humidity,
    dewpoint,
    uv,
    uvLabel: classifyUV(uv),
    condition: classifyCondition(waveHeight),
  }
}

function extractHourPoint(marine, weather, tide, idx, utcOffsetSeconds) {
  const t = marine.hourly.time[idx]
  return {
    time: t,
    hour: t ? t.slice(11, 16) : '',
    wave: marine.hourly.wave_height?.[idx] ?? null,
    wind: weather.hourly.windspeed_10m?.[idx] ?? null,
    tide: t && tide?.extremes ? tideHeightAt(tide.extremes, localToUtc(t, utcOffsetSeconds)) : null,
  }
}

function buildDayTide(tide, date, refDate, utcOffsetSeconds, timeZone) {
  if (!tide?.extremes) return null

  const localDateOf = (d) => new Date(d.getTime() + utcOffsetSeconds * 1000).toISOString().slice(0, 10)
  const dayExtremes = tide.extremes.filter((e) => localDateOf(e.time) === date)
  const high = dayExtremes.find((e) => e.type === 'high')
  const low = dayExtremes.find((e) => e.type === 'low')

  const current = tideHeightAt(tide.extremes, refDate)
  const next = tide.extremes.find((e) => e.time > refDate)
  const trend = next ? (next.type === 'high' ? 'Subindo' : 'Descendo') : null

  return {
    current,
    trend,
    high: high ? { time: formatTimeInZone(high.time, timeZone), height: high.height } : null,
    low: low ? { time: formatTimeInZone(low.time, timeZone), height: low.height } : null,
  }
}

export function classifyWindShore(windDirection, waveDirection) {
  if (windDirection === null || windDirection === undefined) return null
  if (waveDirection === null || waveDirection === undefined) return null

  let diff = Math.abs(windDirection - waveDirection)
  if (diff > 180) diff = 360 - diff

  if (diff <= 45) return 'Onshore'
  if (diff >= 135) return 'Offshore'
  return 'Cross-shore'
}

export function classifyWindIntensity(speedKmh) {
  if (speedKmh === null || speedKmh === undefined) return null
  if (speedKmh < 15) return 'leve'
  if (speedKmh < 30) return 'moderado'
  return 'forte'
}

export function classifyUV(uv) {
  if (uv === null || uv === undefined) return '—'
  if (uv < 3) return 'baixo'
  if (uv < 6) return 'moderado'
  if (uv < 8) return 'alto'
  if (uv < 11) return 'muito alto'
  return 'extremo'
}

function classifyCondition(waveHeight) {
  if (waveHeight === null) return { label: '—', tone: 'neutral' }
  if (waveHeight < 0.5) return { label: 'Flat', tone: 'warn' }
  if (waveHeight <= 2.2) return { label: 'Surfável', tone: 'good' }
  return { label: 'Forte', tone: 'warn' }
}

function localToUtc(localIso, utcOffsetSeconds) {
  return new Date(new Date(`${localIso}:00Z`).getTime() - utcOffsetSeconds * 1000)
}

function formatTimeInZone(date, timeZone) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone })
}

export const degreesToCompass = (deg) => {
  if (deg === null || deg === undefined) return '—'
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}
