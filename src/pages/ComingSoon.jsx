import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function ComingSoon({ title = 'Em breve' }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="light" />
      <main className="mx-auto flex max-w-[1280px] flex-col items-start px-6 py-24 md:px-10">
        <h1 className="font-serif text-[42px] text-navy-deep">{title}</h1>
        <p className="mt-3 max-w-md text-[15px] text-slate">
          Esta tela ainda não foi implementada.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-pill bg-navy px-5 py-2.5 text-[13px] font-medium text-cream transition-opacity hover:opacity-90"
        >
          Voltar ao início
        </Link>
      </main>
    </div>
  )
}
