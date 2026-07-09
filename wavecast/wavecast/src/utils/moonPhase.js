// Cálculo simples de fase lunar local (sem dependência externa).
// Baseado no ciclo sinódico médio de 29.53059 dias a partir de uma lua nova de referência.
const SYNODIC_MONTH = 29.53058867
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14)) // 2000-01-06

const PHASES = [
  { max: 0.033, label: 'Nova' },
  { max: 0.25, label: 'Crescente' },
  { max: 0.483, label: 'Quarto Crescente' },
  { max: 0.517, label: 'Gibosa Crescente' },
  { max: 0.75, label: 'Cheia' },
  { max: 0.85, label: 'Gibosa Minguante' },
  { max: 0.967, label: 'Quarto Minguante' },
  { max: 1.0, label: 'Minguante' },
]

export function getMoonPhase(date = new Date()) {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86400000
  const cyclePos = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const fraction = cyclePos / SYNODIC_MONTH

  const phase = PHASES.find((p) => fraction <= p.max) || PHASES[PHASES.length - 1]
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fraction)) * 50)

  const daysToFull = fraction <= 0.5
    ? Math.round((0.5 - fraction) * SYNODIC_MONTH)
    : Math.round((1.5 - fraction) * SYNODIC_MONTH)

  return {
    label: phase.label === 'Gibosa Crescente' ? 'Gibosa\nCrescente' : phase.label,
    illumination,
    daysToFull,
    fraction,
  }
}
