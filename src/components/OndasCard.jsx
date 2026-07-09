import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { formatMeters as fm } from '../utils/format'
import { degreesToCompass } from '../api/forecast'

export default function OndasCard({ current, next24 }) {
  const wave = current?.waveHeight ?? 1.8
  const dir = degreesToCompass(current?.waveDirection) || 'ESE'
  const period = current?.wavePeriod ?? 9.2
  const condition = current?.condition ?? { label: 'Surfável', tone: 'good' }

  const chartData = next24 && next24.length > 0
    ? next24
    : Array.from({ length: 12 }).map((_, i) => ({ hour: i, wave: 1.2 + Math.sin(i / 2) * 0.7 + 0.7 }))

  const waves = chartData.map((d) => d.wave).filter((v) => v !== null)
  const min = waves.length ? Math.min(...waves) : 0.8
  const max = waves.length ? Math.max(...waves) : 2.1

  return (
    <div className="flex h-full flex-col rounded-3xl bg-navy-deep p-6 text-cream">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-accent">
        <WaveGlyph /> Ondas
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="font-serif text-[56px] leading-none">
          {fm(wave)}
          <span className="text-[22px]"> m</span>
        </div>
        <button className="flex items-center gap-1 rounded-pill border border-cream/15 px-2 py-1 text-[11px] text-cream/80">
          <ChevronDown size={12} />
        </button>
      </div>
      <div className="mt-1 text-[12px] text-cream/60">{dir}</div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-cream/10 pt-4 text-[13px]">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-cream/50">Período</div>
          <div className="mt-1 font-medium">{fm(period)}s</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-cream/50">Mín · Máx</div>
          <div className="mt-1 font-medium">
            {fm(min)}–{fm(max)} m
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-cream/50">Condição</div>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-medium ${
              condition.tone === 'good' ? 'bg-good-bg text-good-text' : 'bg-warn-bg text-warn-text'
            }`}
          >
            <CheckCircle2 size={10} /> {condition.label}
          </span>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-cream/50">
          <span>Próximas 24h</span>
          <span>06:00 → 06:00</span>
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="ondasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7cbcd3" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#7cbcd3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="wave"
              stroke="#7cbcd3"
              strokeWidth={2}
              fill="url(#ondasGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-1 flex justify-between text-[10px] text-cream/40">
          <span>06h</span>
          <span>12h</span>
          <span>18h</span>
          <span>00h</span>
          <span>06h+</span>
        </div>
      </div>
    </div>
  )
}

function WaveGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M2 12c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3 2 3 4 3" />
    </svg>
  )
}
