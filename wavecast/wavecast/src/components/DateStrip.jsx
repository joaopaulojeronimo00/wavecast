import { formatMeters, formatWeekday, formatDay } from '../utils/format'

/**
 * Se `days` (vindo da API) não estiver disponível ainda, mostra 8 dias
 * de placeholder para o layout nunca "pular" quando os dados chegarem.
 */
export default function DateStrip({ days, activeIndex = 0, onSelect }) {
  const items = days && days.length > 0 ? days : Array.from({ length: 8 }).map((_, i) => ({
    date: null,
    label: i === 0 ? 'HOJE' : PLACEHOLDER_LABELS[i],
    day: PLACEHOLDER_DAYS[i],
    wave: PLACEHOLDER_WAVES[i],
    temp: PLACEHOLDER_TEMPS[i],
  }))

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {items.map((item, i) => {
        const active = i === activeIndex
        const label = item.date
          ? i === 0
            ? 'HOJE'
            : formatWeekday(item.date)
          : item.label
        const day = item.date ? formatDay(item.date) : item.day

        return (
          <button
            key={i}
            onClick={() => onSelect?.(i)}
            className={`flex min-w-[92px] shrink-0 flex-col gap-2 rounded-2xl px-4 py-3 text-left transition-colors ${
              active ? 'bg-navy text-cream' : 'bg-white text-navy-deep hover:bg-navy/5'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  active ? 'text-accent-soft' : 'text-slate'
                }`}
              >
                {label}
              </span>
              <span className="text-[12px] font-medium">{day}</span>
            </div>
            <div className="font-serif text-[19px] leading-none">
              {formatMeters(item.wave)}m
            </div>
            <div className={`text-[11px] ${active ? 'text-accent-soft' : 'text-slate'}`}>
              {Math.round(item.temp)}°
            </div>
          </button>
        )
      })}
    </div>
  )
}

const PLACEHOLDER_LABELS = ['HOJE', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM', 'SEG', 'TER']
const PLACEHOLDER_DAYS = [27, 28, 29, 30, 31, 1, 2, 3]
const PLACEHOLDER_WAVES = [1.8, 1.6, 2.1, 2.4, 1.9, 1.5, 1.3, 1.4]
const PLACEHOLDER_TEMPS = [28, 27, 29, 28, 27, 27, 26, 27]
