import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, MapPin, Loader2 } from 'lucide-react'
import { useLocationSearch } from '../hooks/useLocationSearch'

const SUGGESTIONS = [
  { label: 'Ponta Negra · Natal', name: 'Ponta Negra', admin: 'Natal · RN · Brasil', lat: -5.879, lon: -35.156 },
  { label: 'Itacoatiara · Niterói', name: 'Itacoatiara', admin: 'Niterói · RJ · Brasil', lat: -22.986, lon: -43.064 },
  { label: 'Joaquina · Floripa', name: 'Joaquina', admin: 'Florianópolis · SC · Brasil', lat: -27.629, lon: -48.45 },
  { label: 'Maresias · SP', name: 'Maresias', admin: 'São Sebastião · SP · Brasil', lat: -23.796, lon: -45.566 },
  { label: 'Itacaré · BA', name: 'Itacaré', admin: 'Itacaré · BA · Brasil', lat: -14.279, lon: -39.28 },
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { results, loading } = useLocationSearch(query)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goToLocation(loc) {
    navigate('/forecast', {
      state: {
        name: loc.name,
        admin: [loc.admin, loc.country].filter(Boolean).join(' · '),
        lat: loc.lat,
        lon: loc.lon,
      },
    })
    setOpen(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (results.length > 0) {
      goToLocation(results[0])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[600px] items-center gap-2 rounded-pill bg-cream/95 p-1.5 pl-5 shadow-card"
      >
        {loading ? (
          <Loader2 size={16} strokeWidth={2} className="shrink-0 animate-spin text-slate" />
        ) : (
          <Search size={16} strokeWidth={2} className="shrink-0 text-slate" />
        )}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
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

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-w-[600px] overflow-hidden rounded-2xl bg-cream shadow-card">
          {results.length > 0 ? (
            <ul>
              {results.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => goToLocation(loc)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] text-navy-deep transition-colors hover:bg-navy/5"
                  >
                    <MapPin size={14} strokeWidth={2} className="shrink-0 text-slate" />
                    <span>
                      {loc.name}
                      {loc.admin && <span className="text-slate"> · {loc.admin}</span>}
                      {loc.country && <span className="text-slate"> · {loc.country}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="px-4 py-3 text-[13px] text-slate">Nenhum lugar encontrado.</div>
            )
          )}
        </div>
      )}

    </div>
  )
}
