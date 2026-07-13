import axios from 'axios'

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
