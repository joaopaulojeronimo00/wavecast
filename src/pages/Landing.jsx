import { useEffect, useState } from 'react'
import { Waves } from 'lucide-react'
import Navbar from '../components/Navbar'
import WaveBackdrop from '../components/WaveBackdrop'
import HeroSearch from '../components/HeroSearch'
import HeroInfoCards from '../components/HeroInfoCards'
import { fetchForecast } from '../api/forecast'

const DEFAULT_LOCATION = { lat: -5.879, lon: -35.156 }

export default function Landing() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchForecast(DEFAULT_LOCATION)
      .then((res) => {
        if (active) setData(res)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a2540] via-[#0f3155] to-[#173f68]">
        <WaveBackdrop />
        <Navbar variant="dark" />

        <div className="relative z-20 mx-auto max-w-[1280px] px-6 pb-4 pt-8 md:px-10 md:pt-12">
          <div className="inline-flex items-center gap-2 rounded-pill border border-cream/15 bg-cream/5 px-4 py-1.5 text-[12px] text-cream/90">
            <Waves size={13} strokeWidth={2.25} />
            v1.0 · Open-Meteo · tabuamare
          </div>

          <h1 className="mt-6 max-w-[820px] font-serif text-[46px] leading-[1.08] text-cream md:text-[64px] lg:text-[76px]">
            Previsão completa
            <br />
            do mar em <em className="italic text-accent">um só lugar</em>.
          </h1>

          <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-accent-soft md:text-[19px]">
            Ondas, vento, maré e fases da lua para a sua praia. Decida onde
            surfar, pescar ou navegar em segundos — sem abrir cinco
            aplicativos.
          </p>

          <div className="mt-9">
            <HeroSearch />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-10 pt-10 md:px-10 md:pb-14">
          <HeroInfoCards data={data} loading={loading} />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <p className="text-center text-[13px] text-slate">
          Seu site de previsão de ondas.
        </p>
      </section>
    </div>
  )
}
