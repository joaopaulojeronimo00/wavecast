import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Star,
  MapPin,
  Clock,
  Search,
  Wind,
  Waves as WavesIcon,
  Thermometer,
  Droplets,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import DateStrip from '../components/DateStrip'
import OndasCard from '../components/OndasCard'
import MetricCard from '../components/MetricCard'
import LuaCard from '../components/LuaCard'
import HourlyChart from '../components/HourlyChart'
import { fetchForecast, degreesToCompass } from '../api/forecast'
import { formatMeters } from '../utils/format'

const DEFAULT_LOCATION = {
  name: 'Praia de Ponta Negra',
  admin: 'Natal · RN · Brasil',
  lat: -5.879,
  lon: -35.156,
}

export default function Dashboard() {
  const routerLocation = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeDay, setActiveDay] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchForecast(DEFAULT_LOCATION)
      .then((res) => {
        if (active) setData(res)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os dados agora. Mostrando valores de exemplo.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const current = data?.current
  const updatedAt = data?.updatedAt
    ? data.updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '09:42'

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
                {routerLocation.state?.query || DEFAULT_LOCATION.name}
              </h1>
              <button aria-label="Favoritar" className="text-warn-text/70 transition-colors hover:text-amber-500">
                <Star size={22} strokeWidth={1.75} />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate">
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {DEFAULT_LOCATION.admin}
              </span>
              <span>5° 50' S · 35° 11' W</span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> Atualizado às {updatedAt}
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-[320px] items-center gap-2 rounded-pill border border-navy/10 bg-white px-4 py-2.5 shadow-card"
          >
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Mudar localidade..."
              className="w-full bg-transparent text-[14px] text-navy-deep placeholder:text-slate/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-cream"
            >
              <Search size={14} />
            </button>
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
            <OndasCard current={current} next24={data?.next24} />
          </div>

          <MetricCard
            icon={<Wind size={12} />}
            label="Vento"
            value={current?.windSpeed !== undefined ? Math.round(current.windSpeed ?? 12) : 12}
            unit="km/h"
            badge={
              <div className="flex flex-col items-end text-[11px] text-slate">
                <CompassIcon />
                <span className="mt-1">{degreesToCompass(current?.windDirection) || 'SE'}</span>
              </div>
            }
          >
            <div className="mt-4 flex items-center gap-4 text-[13px] text-slate">
              <span>Rajadas 18 km/h</span>
              <span>Offshore leve</span>
            </div>
          </MetricCard>

          <MetricCard
            icon={<TideIcon />}
            label="Maré"
            value={formatMeters(data?.tide?.current ?? 1.4)}
            unit="m"
            badge={
              <span className="rounded-pill bg-cream px-3 py-1 text-[11px] font-medium text-navy-deep">
                → {data?.tide?.trend ?? 'Subindo'}
              </span>
            }
          >
            <div className="mt-4 space-y-1 text-[13px] text-slate">
              <div>
                Alta · {data?.tide?.high?.time ?? '14:42'} · {formatMeters(data?.tide?.high?.height ?? 2.1)} m
              </div>
              <div>
                Baixa · {data?.tide?.low?.time ?? '20:58'} · {formatMeters(data?.tide?.low?.height ?? 0.3)} m
              </div>
            </div>
          </MetricCard>

          <LuaCard moon={data?.moon} />

          <MetricCard
            icon={<Thermometer size={12} />}
            label="Temperatura"
            value={current?.temperature !== undefined ? Math.round(current.temperature ?? 28) : 28}
            unit="°C"
            badge={
              <span className="text-[12px] text-slate">
                água {Math.round(current?.waterTemperature ?? 26)}°
              </span>
            }
          >
            <div className="mt-4 flex items-center gap-4 text-[13px] text-slate">
              <span>Sensação {Math.round((current?.temperature ?? 28) + 3)}°</span>
              <span>UV {Math.round(current?.uv ?? 9)} · alto</span>
            </div>
          </MetricCard>

          <MetricCard
            icon={<Droplets size={12} />}
            label="Umidade"
            value={Math.round(current?.humidity ?? 74)}
            unit="%"
          >
            <div className="mt-4 text-[13px] text-slate">
              Ponto orvalho {Math.round(current?.dewpoint ?? 23)}°
            </div>
          </MetricCard>
        </div>

        <div className="mt-4">
          <HourlyChart next24={data?.next24} />
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
