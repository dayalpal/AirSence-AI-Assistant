import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, MessageCircle, AlertTriangle } from 'lucide-react'
import AqiGauge from '../components/AqiGauge'
import PollutantGrid from '../components/PollutantGrid'
import MarkdownText from '../components/MarkdownText'
import { analyzeAqi } from '../lib/api'
import { getAqiLevel, POLLUTANTS } from '../lib/aqi'

const FADE = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{staggerChildren:0.07}} }
const ITEM = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} }

export default function Analyzer({ setPage, setChatContext }) {
  const [aqi, setAqi] = useState('')
  const [location, setLocation] = useState('')
  const [pollInputs, setPollInputs] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const aqiNum = parseInt(aqi)
  const validAqi = !isNaN(aqiNum) && aqiNum >= 0 && aqiNum <= 500
  const level = validAqi ? getAqiLevel(aqiNum) : null

  async function handleAnalyze() {
    if (!validAqi) { setError('Please enter a valid AQI value (0–500)'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const pollutants = {}
      POLLUTANTS.forEach(p => { if (pollInputs[p.id] !== '' && pollInputs[p.id] != null) pollutants[p.id] = Number(pollInputs[p.id]) })
      const res = await analyzeAqi({ aqi: aqiNum, location, pollutants })
      setResult(res.data.analysis)
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  function sendToChat() {
    setChatContext(`Here is an AQI analysis for AQI ${aqiNum}${location ? ` in ${location}` : ''}:\n\n${result}\n\nPlease provide additional recommendations.`)
    setPage('chat')
  }

  return (
    <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={ITEM}>
        <h1 className="text-3xl font-bold mb-1">AQI Analyzer</h1>
        <p className="text-white/40 text-sm">Input pollutant levels for deep AI-powered health analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <motion.div variants={ITEM} className="glass rounded-3xl p-7 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Input Parameters</h3>

          {/* AQI */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">AQI Value *</label>
            <input type="number" min="0" max="500" value={aqi} onChange={e => setAqi(e.target.value)}
              placeholder="0 – 500"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-blue-500/60 transition-all text-2xl font-bold" />
            {level && (
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${level.badge}`}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: level.color }} />
                {level.label}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Location (optional)</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. New Delhi, India"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-blue-500/60 transition-all" />
          </div>

          {/* Pollutants */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Pollutant Levels (optional)</label>
            <div className="grid grid-cols-2 gap-3">
              {POLLUTANTS.map(p => (
                <div key={p.id}>
                  <label className="text-[11px] text-white/40 mb-1 block">{p.label} ({p.unit})</label>
                  <input type="number" min="0" value={pollInputs[p.id] ?? ''}
                    onChange={e => setPollInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="--"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/20 outline-none focus:border-blue-500/50 transition-all text-sm" />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button onClick={handleAnalyze} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing…</> : <><Search size={18} /> Run AI Analysis</>}
          </button>
        </motion.div>

        {/* Result Panel */}
        <motion.div variants={ITEM} className="glass rounded-3xl p-7 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">AI Analysis Result</h3>

          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <Search size={28} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm">Results will appear here</p>
              <p className="text-white/20 text-xs">Enter an AQI value and click "Run AI Analysis"</p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Analyzing with Gemini AI…</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex-1 flex flex-col gap-4">
              {level && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${level.badge} self-start`}>
                  AQI {aqiNum} — {level.label}
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <MarkdownText text={result} />
              </div>
              <div className="pt-4 border-t border-white/8 flex gap-3">
                <button onClick={sendToChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/25 hover:text-white transition-all">
                  <MessageCircle size={15} /> Continue in Chat
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Live gauge preview */}
      {validAqi && (
        <motion.div variants={ITEM} className="glass rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Gauge Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <AqiGauge value={aqiNum} />
            </div>
            <PollutantGrid values={Object.fromEntries(POLLUTANTS.map(p => [p.id, pollInputs[p.id] ? Number(pollInputs[p.id]) : null]).filter(([,v]) => v != null))} />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
