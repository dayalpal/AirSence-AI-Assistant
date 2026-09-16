import { POLLUTANTS } from '../lib/aqi'

export default function PollutantGrid({ values = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {POLLUTANTS.map(p => {
        const val = values[p.id]
        const pct = val != null ? Math.min(100, (val / p.max) * 100) : 0
        return (
          <div key={p.id} className="glass rounded-2xl p-4 hover:border-white/15 transition-all hover:-translate-y-0.5 group">
            <div className="flex items-start justify-between mb-3">
              <div
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide"
                style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}
              >
                {p.label}
              </div>
            </div>
            <p className="text-xs text-white/40 mb-0.5">{p.unit === 'μg/m³' ? 'Particulate' : p.unit === 'ppb' ? 'Parts per billion' : 'Parts per million'}</p>
            <p className="text-lg font-700 font-bold">
              {val != null ? <>{val} <span className="text-xs text-white/40 font-normal">{p.unit}</span></> : <span className="text-white/25">--</span>}
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: p.color, boxShadow: `0 0 8px ${p.color}66` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
