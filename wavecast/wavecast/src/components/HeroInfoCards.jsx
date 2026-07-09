import { CheckCircle2, Wind, Waves as WavesIcon, MoveUpRight, Moon, Sunrise } from 'lucide-react'
import { formatMeters } from '../utils/format'

/**
 * Cards de contexto rápido no rodapé do hero. Recebem dados reais quando
 * disponíveis (via props); caso contrário mostram os valores de exemplo
 * do mockup para nunca ficar em branco enquanto a API carrega.
 */
export default function HeroInfoCards({ data, loading }) {
  const wave = data?.current?.waveHeight ?? 1.8
  const wind = data?.current?.windSpeed ?? 12
  const tide = data?.tide ?? { high: { time: '14:42', height: 2.1 } }
  const moon = data?.moon ?? { label: 'Gibosa\nCrescente', illumination: 78 }
  const temp = data?.current?.temperature ?? 28
  const waterTemp = data?.current?.waterTemperature ?? 26

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl bg-cream/95 p-4 shadow-card">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate">
          <MapPinIcon /> Agora · Praia de Ponta Negra
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-[42px] leading-none text-navy-deep">
            {formatMeters(wave)}
            <span className="text-[18px]"> m</span>
          </span>
          <span className="flex items-center gap-1 rounded-pill bg-good-bg px-2.5 py-1 text-[10px] font-medium text-good-text">
            <CheckCircle2 size={11} /> Condições boas
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[12px] text-slate">
          <span className="flex items-center gap-1">
            <Wind size={12} /> {wind} km/h SE
          </span>
          <span className="flex items-center gap-1">
            <WavesIcon size={12} /> Ondas E · 9s
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-cream/95 p-4 shadow-card">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate">
          <MoveUpRight size={11} /> Próxima maré
        </div>
        <div className="mt-2 font-serif text-[32px] leading-none text-navy-deep">
          {tide.high.time}
        </div>
        <div className="mt-2 text-[12px] text-slate">
          Alta · {formatMeters(tide.high.height)} m
        </div>
      </div>

      <div className="rounded-2xl bg-cream/95 p-4 shadow-card">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate">
          <Moon size={11} /> Lua
        </div>
        <div className="mt-2 flex items-center gap-3">
          <MoonGlyph fraction={moon.fraction} />
          <div>
            <div className="whitespace-pre-line text-[14px] font-medium leading-tight text-navy-deep">
              {moon.label}
            </div>
            <div className="text-[12px] text-slate">{moon.illumination}% iluminação</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-navy-deep p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-accent">
          Hoje · Natal/RN
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-[36px] leading-none text-cream">
            {Math.round(temp)}°
          </span>
          <span className="text-[13px] text-cream">água {Math.round(waterTemp)}°</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[12px] text-accent-soft">
          <Sunrise size={12} /> Nascer 05:24
        </div>
      </div>
    </div>
  )
}

function MapPinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 22s7-6.5 7-12A7 7 0 0 0 5 10c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

function MoonGlyph({ fraction = 0.6 }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#f4ead0" />
      <path
        d={
          fraction <= 0.5
            ? `M20 2 A18 18 0 0 0 20 38 A${18 - 36 * fraction} 18 0 0 1 20 2 Z`
            : `M20 2 A18 18 0 0 1 20 38 A${36 * (fraction - 0.5)} 18 0 0 ${fraction > 0.75 ? 0 : 1} 20 2 Z`
        }
        fill="#0a2540"
        opacity="0.85"
      />
    </svg>
  )
}
