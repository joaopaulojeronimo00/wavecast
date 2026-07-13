export default function LuaCard({ moon }) {
  return (
    <div className="rounded-3xl bg-navy-deep p-6 text-cream">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-accent">
        <MoonIcon /> Lua
      </div>
      <div className="mt-3 flex items-center gap-4">
        <MoonGlyph fraction={moon.fraction} />
        <div>
          <div className="whitespace-pre-line font-serif text-[22px] leading-[1.15]">
            {moon.label}
          </div>
          <div className="mt-1 text-[13px] text-cream/60">
            {moon.illumination}% · Cheia em {moon.daysToFull} dias
          </div>
        </div>
      </div>
    </div>
  )
}

function MoonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function MoonGlyph({ fraction = 0.6 }) {
  return (
    <svg width="56" height="56" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <circle cx="20" cy="20" r="18" fill="#f4ead0" />
      <path
        d={
          fraction <= 0.5
            ? `M20 2 A18 18 0 0 0 20 38 A${18 - 36 * fraction} 18 0 0 1 20 2 Z`
            : `M20 2 A18 18 0 0 1 20 38 A${36 * (fraction - 0.5)} 18 0 0 ${fraction > 0.75 ? 0 : 1} 20 2 Z`
        }
        fill="#0a2540"
        opacity="0.88"
      />
    </svg>
  )
}
