import { Link, useLocation } from 'react-router-dom'
import { Waves } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Previsão', to: '/forecast' },
  { label: 'Favoritos', to: '/favorites' },
  { label: 'Sobre', to: '/about' },
]

/**
 * variant="dark"  -> usado sobre o hero navy (Tela 1)
 * variant="light" -> usado sobre fundo claro (Tela 2 e demais)
 */
export default function Navbar({ variant = 'light' }) {
  const { pathname } = useLocation()
  const isDark = variant === 'dark'

  return (
    <header className="relative z-20">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2">
          <Waves
            size={20}
            strokeWidth={2.25}
            className={isDark ? 'text-cream' : 'text-navy-deep'}
          />
          <span
            className={`font-sans text-[17px] font-semibold ${
              isDark ? 'text-cream' : 'text-navy-deep'
            }`}
          >
            WaveCast
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13.5px] transition-opacity hover:opacity-80 ${
                  active ? 'font-medium' : 'font-normal'
                } ${isDark ? 'text-cream' : 'text-navy-deep'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <Link
          to="/forecast"
          className={`rounded-pill px-5 py-2 text-[12.5px] font-medium transition-opacity hover:opacity-90 ${
            isDark ? 'bg-cream text-navy' : 'bg-navy text-cream'
          }`}
        >
          Ver previsão
        </Link>
      </nav>
    </header>
  )
}
