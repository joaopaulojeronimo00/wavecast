import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { formatMeters as fm } from '../utils/format'
import { degreesToCompass } from '../api/forecast'

export default function OndasCard({ current, next24, isToday = true }) {
  const wave = current?.waveHeight ?? null
  const dir = degreesToCompass(current?.waveDirection)
  const period = current?.wavePeriod ?? null
  const condition = current?.condition ?? { label: '—', tone: 'neutral' }

  const chartData = next24 || []

  const waves = chartData.map((d) => d.wave).filter((v) => v !== null)
  const min = waves.length ? Math.min(...waves) : null
  const max = waves.length ? Math.max(...waves) : null

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
      </div>
      <div className="mt-1 text-[12px] text-cream/60">Direção: {dir}</div>

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
          <span>{isToday ? 'Próximas 24h' : 'Ao longo do dia'}</span>
          <span>
            {chartData.length > 0
              ? `${chartData[0].hour} → ${chartData[chartData.length - 1].hour}`
              : '—'}
          </span>
        </div>
        {chartData.length > 0 ? (
          <>
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
              {axisHours(chartData).map((h, i) => (
                <span key={i}>{h}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[80px] items-center justify-center text-[12px] text-cream/40">
            Sem dados no momento
          </div>
        )}
      </div>
    </div>
  )
}

function axisHours(chartData) {
  const last = chartData.length - 1
  const picks = [0, Math.round(last / 4), Math.round(last / 2), Math.round((last * 3) / 4), last]
  return picks.map((i) => chartData[i]?.hour ?? '')
}

function WaveGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M2 12c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3 2 3 4 3" />
    </svg>
  )
}
