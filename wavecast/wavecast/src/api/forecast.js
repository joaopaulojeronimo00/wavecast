import { marineClient, weatherClient, geocodeClient } from './client'
import { getMoonPhase } from '../utils/moonPhase'
import { getMockTide } from '../utils/tide'

/**
 * Busca localidades por nome (autocomplete da barra de busca).
 * Fonte: Open-Meteo Geocoding API (gratuita, sem API key).
 */
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

/**
 * Busca a previsão completa (ondas + vento + temperatura) para uma coordenada.
 * Combina duas chamadas: Marine API (ondas) e Forecast API (vento/temp/umidade).
 * Maré e fase da lua não têm fonte gratuita equivalente ao Stormglass, então:
 *  - fase da lua é calculada localmente (ver utils/moonPhase.js)
 *  - maré usa um mock (ver utils/tide.js) até você plugar uma chave da Stormglass
 */
export async function fetchForecast({ lat, lon, timezone = 'auto' }) {
  const [marineRes, weatherRes] = await Promise.all([
    marineClient.get('/marine', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,wave_direction,swell_wave_height',
        daily: 'wave_height_max,wave_period_max',
        timezone,
      },
    }),
    weatherClient.get('/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,windspeed_10m,winddirection_10m,relativehumidity_2m,dewpoint_2m,uv_index',
        daily: 'temperature_2m_max,temperature_2m_min',
        timezone,
      },
    }),
  ])

  return normalizeForecast(marineRes.data, weatherRes.data)
}

function normalizeForecast(marine, weather) {
  const now = new Date()
  const nowIso = now.toISOString().slice(0, 13) // yyyy-mm-ddThh
  const hourly = marine.hourly?.time || []

  let idx = hourly.findIndex((t) => t.startsWith(nowIso))
  if (idx === -1) idx = 0

  const waveHeight = marine.hourly.wave_height?.[idx] ?? null
  const wavePeriod = marine.hourly.wave_period?.[idx] ?? null
  const waveDirection = marine.hourly.wave_direction?.[idx] ?? null

  const windSpeed = weather.hourly.windspeed_10m?.[idx] ?? null
  const windDirection = weather.hourly.winddirection_10m?.[idx] ?? null
  const temperature = weather.hourly.temperature_2m?.[idx] ?? null
  const humidity = weather.hourly.relativehumidity_2m?.[idx] ?? null
  const dewpoint = weather.hourly.dewpoint_2m?.[idx] ?? null
  const uv = weather.hourly.uv_index?.[idx] ?? null

  // próximas 24h para os gráficos
  const next24 = Array.from({ length: 24 }).map((_, i) => {
    const t = hourly[idx + i]
    return {
      time: t,
      hour: t ? t.slice(11, 16) : '',
      wave: marine.hourly.wave_height?.[idx + i] ?? null,
      wind: weather.hourly.windspeed_10m?.[idx + i] ?? null,
    }
  }).filter((p) => p.wave !== null)

  const daily = (marine.daily?.time || []).map((date, i) => ({
    date,
    waveHeightMax: marine.daily.wave_height_max?.[i] ?? null,
    tempMax: weather.daily?.temperature_2m_max?.[i] ?? null,
  }))

  const condition = classifyCondition(waveHeight)

  return {
    updatedAt: now,
    current: {
      waveHeight,
      wavePeriod,
      waveDirection,
      windSpeed,
      windDirection,
      temperature,
      waterTemperature: temperature !== null ? Math.round((temperature - 2) * 10) / 10 : null,
      humidity,
      dewpoint,
      uv,
      condition,
    },
    tide: getMockTide(),
    moon: getMoonPhase(now),
    next24,
    daily,
  }
}

function classifyCondition(waveHeight) {
  if (waveHeight === null) return { label: '—', tone: 'neutral' }
  if (waveHeight < 0.5) return { label: 'Flat', tone: 'warn' }
  if (waveHeight <= 2.2) return { label: 'Surfável', tone: 'good' }
  return { label: 'Forte', tone: 'warn' }
}

export const degreesToCompass = (deg) => {
  if (deg === null || deg === undefined) return '—'
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}
