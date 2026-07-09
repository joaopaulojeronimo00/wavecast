import axios from 'axios'

// Open-Meteo não exige API key, ideal para começar sem custos.
// Se depois você adicionar Stormglass (maré) ou outra fonte paga,
// crie um novo client aqui com a baseURL e os headers de auth necessários.
export const marineClient = axios.create({
  baseURL: 'https://marine-api.open-meteo.com/v1',
  timeout: 10000,
})

export const weatherClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
})

export const geocodeClient = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1',
  timeout: 10000,
})
