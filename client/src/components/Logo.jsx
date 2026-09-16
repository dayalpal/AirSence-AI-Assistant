import { Wind } from 'lucide-react'

export default function Logo({ size = 'md' }) {
  const s = size === 'sm' ? 'text-base' : 'text-xl'
  const i = size === 'sm' ? 18 : 24
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
        <Wind size={i} className="text-white" strokeWidth={2.5} />
      </div>
      <div>
        <span className={`${s} font-bold tracking-tight text-white`}>AirSense</span>
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-blue-400">AI Powered</span>
      </div>
    </div>
  )
}
