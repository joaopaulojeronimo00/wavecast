import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, MapPin } from 'lucide-react'

const SUGGESTIONS = [
  'Ponta Negra · Natal',
  'Itacoatiara · Niterói',
  'Joaquina · Floripa',
  'Maresias · SP',
  'Itacaré · BA',
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/forecast', { state: { query } })
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[600px] items-center gap-2 rounded-pill bg-cream/95 p-1.5 pl-5 shadow-card"
      >
        <Search size={16} strokeWidth={2} className="shrink-0 text-slate" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Buscar praia ou cidade — Ex: Ponta Negra, Natal"
          className="w-full bg-transparent text-[15px] text-navy-deep placeholder:text-slate/70 focus:outline-none"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-pill bg-navy px-5 py-2.5 text-[13px] font-medium text-cream transition-opacity hover:opacity-90"
        >
          Ver previsão
          <ArrowRight size={14} strokeWidth={2.25} />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-accent-soft">
        <span>Sugestões:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => navigate('/forecast', { state: { query: s } })}
            className="flex items-center gap-1 rounded-pill border border-cream/20 px-3 py-1 text-cream/90 transition-colors hover:bg-cream/10"
          >
            <MapPin size={11} strokeWidth={2} />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
