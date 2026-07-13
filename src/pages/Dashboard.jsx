import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Star,
  MapPin,
  Clock,
  Search,
  Wind,
  Thermometer,
  Droplets,
  Loader2,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import DateStrip from '../components/DateStrip'
import OndasCard from '../components/OndasCard'
import MetricCard from '../components/MetricCard'
import LuaCard from '../components/LuaCard'
import HourlyChart from '../components/HourlyChart'
import { fetchForecast, degreesToCompass, classifyWindIntensity } from '../api/forecast'
import { formatMeters, formatCoords, formatInt } from '../utils/format'
import { useLocationSearch } from '../hooks/useLocationSearch'
import { getMoonPhase } from '../utils/moonPhase'

const DEFAULT_LOCATION = {
  name: 'Praia de Ponta Negra',
  admin: 'Natal · RN · Brasil',
  lat: -5.879,
  lon: -35.156,
}

function locationFromState(state) {
  if (state?.lat !== undefined && state?.lon !== undefined) {
    return {
      name: state.name || state.query || DEFAULT_LOCATION.name,
      admin: state.admin || '',
      lat: state.lat,
      lon: state.lon,
    }
  }
  return DEFAULT_LOCATION
}

export default function Dashboard() {
  const routerLocation = useLocation()
  const [location, setLocation] = useState(() => locationFromState(routerLocation.state))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeDay, setActiveDay] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const { results: searchResults, loading: searchLoading } = useLocationSearch(searchValue)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setActiveDay(0)
    fetchForecast(location)
      .then((res) => {
        if (active) setData(res)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os dados agora. Tente novamente em instantes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [location])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectSearchResult(loc) {
    setLocation({
      name: loc.name,
      admin: [loc.admin, loc.country].filter(Boolean).join(' · '),
      lat: loc.lat,
      lon: loc.lon,
    })
    setSearchValue('')
    setSearchOpen(false)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchResults.length > 0) {
      selectSearchResult(searchResults[0])
    }
  }

  const selected = data?.days?.[activeDay]
  const current = selected?.current
  const updatedAt = data?.updatedAt
    ? data.updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null
  const windIntensity = classifyWindIntensity(current?.windSpeed)
  const selectedDateLabel = selected?.date
    ? new Date(`${selected.date}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : null

  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="light" />

      <main className="mx-auto max-w-[1280px] px-6 pb-20 pt-2 md:px-10">
        <div className="flex items-center gap-1.5 text-[12px] text-slate">
          <span>Início</span>
          <span>→</span>
          <span className="text-navy-deep">Previsão</span>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-[40px] leading-none text-navy-deep md:text-[52px]">
                {location.name}
              </h1>
              <button aria-label="Favoritar" className="text-warn-text/70 transition-colors hover:text-amber-500">
                <Star size={22} strokeWidth={1.75} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate">
              {location.admin && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {location.admin}
                </span>
              )}
              <span>{formatCoords(location.lat, location.lon)}</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {activeDay === 0
                  ? updatedAt
                    ? `Atualizado às ${updatedAt}`
                    : 'Carregando...'
                  : selectedDateLabel
                    ? `Previsão de ${selectedDateLabel}`
                    : 'Carregando...'}
              </span>
            </div>
          </div>

          <form
            ref={searchRef}
            onSubmit={handleSearchSubmit}
            className="relative flex w-full max-w-[320px] items-center gap-2 rounded-pill border border-navy/10 bg-white px-4 py-2.5 shadow-card"
          >
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Mudar localidade..."
              className="w-full bg-transparent text-[14px] text-navy-deep placeholder:text-slate/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-cream"
            >
              {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>

            {searchOpen && searchValue.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl bg-white shadow-card">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((loc) => (
                      <li key={loc.id}>
                        <button
                          type="button"
                          onClick={() => selectSearchResult(loc)}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] text-navy-deep transition-colors hover:bg-navy/5"
                        >
                          <MapPin size={13} strokeWidth={2} className="shrink-0 text-slate" />
                          <span>
                            {loc.name}
                            {loc.admin && <span className="text-slate"> · {loc.admin}</span>}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !searchLoading && (
                    <div className="px-4 py-3 text-[13px] text-slate">Nenhum lugar encontrado.</div>
                  )
                )}
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-warn-bg px-4 py-3 text-[13px] text-warn-text">
            {error}
          </div>
        )}

        <div className="mt-6">
          <DateStrip days={data?.daily} activeIndex={activeDay} onSelect={setActiveDay} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:row-span-2">
            <OndasCard current={current} next24={selected?.next24} isToday={activeDay === 0} />
          </div>

          <MetricCard
            icon={<Wind size={12} />}
            label="Vento"
            value={formatInt(current?.windSpeed)}
            unit="km/h"
            badge={
              <div className="flex flex-col items-end text-[11px] text-slate">
                <CompassIcon />
                <span className="mt-1">{degreesToCompass(current?.windDirection)}</span>
              </div>
            }
          >
            <div className="mt-4 flex items-center gap-4 text-[13px] text-slate">
              <span>Rajadas {formatInt(current?.windGusts)} km/h</span>
              <span>
                {current?.windShore ? `${current.windShore}${windIntensity ? ` ${windIntensity}` : ''}` : '—'}
              </span>
            </div>
          </MetricCard>

          <MetricCard
            icon={<TideIcon />}
            label="Maré"
            value={selected?.tide ? formatMeters(selected.tide.current) : '—'}
            unit={selected?.tide ? 'm' : undefined}
            badge={
              selected?.tide ? (
                <span className="rounded-pill bg-cream px-3 py-1 text-[11px] font-medium text-navy-deep">
                  → {selected.tide.trend ?? '—'}
                </span>
              ) : (
                <span className="rounded-pill bg-warn-bg px-3 py-1 text-[11px] font-medium text-warn-text">
                  Indisponível
                </span>
              )
            }
          >
            <div className="mt-4 space-y-1 text-[13px] text-slate">
              {selected?.tide?.high && (
                <div>
                  Alta · {selected.tide.high.time} · {formatMeters(selected.tide.high.height)} m
                </div>
              )}
              {selected?.tide?.low && (
                <div>
                  Baixa · {selected.tide.low.time} · {formatMeters(selected.tide.low.height)} m
                </div>
              )}
              {!selected?.tide && !loading && <div>Sem dados de maré para este local.</div>}
            </div>
          </MetricCard>

          <LuaCard moon={selected?.moon ?? getMoonPhase()} />

          <MetricCard
            icon={<Thermometer size={12} />}
            label="Temperatura"
            value={formatInt(current?.temperature)}
            unit="°C"
            badge={
              <span className="text-[12px] text-slate">
                água {formatInt(current?.waterTemperature)}°
              </span>
            }
          >
            <div className="mt-4 flex items-center gap-4 text-[13px] text-slate">
              <span>Sensação {formatInt(current?.apparentTemperature)}°</span>
              <span>UV {formatInt(current?.uv)} · {current?.uvLabel ?? '—'}</span>
            </div>
          </MetricCard>

          <MetricCard
            icon={<Droplets size={12} />}
            label="Umidade"
            value={formatInt(current?.humidity)}
            unit="%"
          >
            <div className="mt-4 text-[13px] text-slate">
              Ponto orvalho {formatInt(current?.dewpoint)}°
            </div>
          </MetricCard>
        </div>

        <div className="mt-4">
          <HourlyChart next24={selected?.next24} isToday={activeDay === 0} />
        </div>
      </main>
    </div>
  )
}

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <path d="M12 8l2.5 6.5L8 12l6.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TideIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M3 17c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1.5 2 3 2" />
      <path d="M12 3v9" />
      <path d="M9 8l3-3 3 3" />
    </svg>
  )
}
