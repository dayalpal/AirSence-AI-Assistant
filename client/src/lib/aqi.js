export const AQI_LEVELS = [
  { max: 50,  label: 'Good',                          badge: 'badge-good',         color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   glow: '#22c55e' },
  { max: 100, label: 'Moderate',                      badge: 'badge-moderate',     color: '#eab308', bg: 'rgba(234,179,8,0.15)',   glow: '#eab308' },
  { max: 150, label: 'Unhealthy for Sensitive Groups',badge: 'badge-sensitive',    color: '#f97316', bg: 'rgba(249,115,22,0.15)',  glow: '#f97316' },
  { max: 200, label: 'Unhealthy',                     badge: 'badge-unhealthy',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   glow: '#ef4444' },
  { max: 300, label: 'Very Unhealthy',                badge: 'badge-veryunhealthy',color: '#a855f7', bg: 'rgba(168,85,247,0.15)', glow: '#a855f7' },
  { max: 500, label: 'Hazardous',                     badge: 'badge-hazardous',    color: '#b91c1c', bg: 'rgba(185,28,28,0.2)',   glow: '#ef4444' },
]

export function getAqiLevel(val) {
  return AQI_LEVELS.find(l => val <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1]
}

export const POLLUTANTS = [
  { id: 'pm25', label: 'PM2.5', unit: 'μg/m³', max: 500, color: '#ef4444' },
  { id: 'pm10', label: 'PM10',  unit: 'μg/m³', max: 600, color: '#f97316' },
  { id: 'no2',  label: 'NO₂',   unit: 'ppb',   max: 200, color: '#eab308' },
  { id: 'o3',   label: 'O₃',    unit: 'ppb',   max: 200, color: '#22c55e' },
  { id: 'co',   label: 'CO',    unit: 'ppm',   max: 50,  color: '#3b82f6' },
  { id: 'so2',  label: 'SO₂',   unit: 'ppb',   max: 200, color: '#a855f7' },
]
