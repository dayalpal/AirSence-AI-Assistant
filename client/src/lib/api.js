import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const checkStatus = ()                    => api.get('/status')
export const sendChat    = (message, history)    => api.post('/chat', { message, history })
export const analyzeAqi  = (payload)             => api.post('/analyze', payload)
export const searchAirQuality = (city)           => api.get('/air-quality', { params: { city } })
