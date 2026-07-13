import { useState } from 'react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

const TABS = [
  { key: 'wave', label: 'Ondas', unit: 'm' },
  { key: 'wind', label: 'Vento', unit: 'km/h' },
  { key: 'tide', label: 'Maré', unit: 'm' },
]

export default function HourlyChart({ next24, isToday = true }) {
  const [tab, setTab] = useState('wave')

  const data = next24 || []
  const hasTide = data.some((p) => p.tide !== null)
  const activeTab = TABS.find((t) => t.key === tab)
  const showEmpty = data.length === 0 || (tab === 'tide' && !hasTide)

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate">
            <WaveIcon /> Previsão por hora
          </div>
          <h3 className="mt-1 font-serif text-[22px] text-navy-deep">
            Ondas, vento e maré · {isToday ? 'próximas 24 horas' : 'ao longo do dia'}
          </h3>
        </div>

        <div className="flex gap-1 rounded-pill bg-cream p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-pill px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
                tab === t.key ? 'bg-navy text-cream' : 'text-slate hover:text-navy-deep'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {showEmpty ? (
          <div className="flex h-[220px] items-center justify-center text-[13px] text-slate">
            {tab === 'tide' && data.length > 0
              ? 'Maré indisponível — configure a chave da Stormglass.'
              : 'Sem dados no momento.'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a2540" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#0a2540" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5b6e80', fontSize: 11 }}
                dy={8}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)} ${activeTab.unit}`, activeTab.label]}
                labelFormatter={(label) => label}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e7edf1',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={tab}
                stroke="#0a2540"
                strokeWidth={2}
                fill="url(#hourlyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function WaveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M2 12c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3 2-3 4-3 2 3 4 3" />
    </svg>
  )
}
