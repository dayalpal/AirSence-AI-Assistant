import { useEffect, useRef } from 'react'
import { getAqiLevel } from '../lib/aqi'

const ARC = 251.2  // full semicircle path length

export default function AqiGauge({ value }) {
  const arcRef   = useRef(null)
  const valueRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (!arcRef.current) return
    const clamped = Math.min(500, Math.max(0, value ?? 0))
    const pct     = clamped / 500
    arcRef.current.style.strokeDashoffset = ARC * (1 - pct)

    const level = getAqiLevel(clamped)
    arcRef.current.style.stroke = level.color
    arcRef.current.style.filter = `drop-shadow(0 0 8px ${level.glow}88)`

    if (valueRef.current) valueRef.current.textContent = value ?? '--'
    if (labelRef.current) labelRef.current.textContent = value != null ? level.label : 'Enter AQI value'
  }, [value])

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {/* Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          ref={arcRef}
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={ARC} strokeDashoffset={ARC}
          className="gauge-fill"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.6s ease' }}
        />
        <text ref={valueRef} x="100" y="88" textAnchor="middle"
          fill="white" fontSize="40" fontWeight="800" fontFamily="Inter">
          {value ?? '--'}
        </text>
        <text ref={labelRef} x="100" y="108" textAnchor="middle"
          fill="rgba(240,244,255,0.5)" fontSize="9.5" fontFamily="Inter">
          Enter AQI value
        </text>
      </svg>
    </div>
  )
}
