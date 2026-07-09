// MOCK: dados de maré.
// Open-Meteo não oferece maré. Quando quiser dados reais, plugue a Stormglass
// (https://stormglass.io) aqui, usando sua API key em uma variável de ambiente
// (ex.: import.meta.env.VITE_STORMGLASS_KEY) — NUNCA exponha a key no client
// em produção; idealmente proxie essa chamada por um backend simples.
export function getMockTide() {
  return {
    current: 1.4,
    trend: 'Subindo',
    high: { time: '14:42', height: 2.1 },
    low: { time: '20:58', height: 0.3 },
  }
}
