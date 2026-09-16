import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wind, Activity, MessageCircle, Info, MapPin, Search, Loader2 } from 'lucide-react'
import AqiGauge from '../components/AqiGauge'
import PollutantGrid from '../components/PollutantGrid'
import { getAqiLevel } from '../lib/aqi'
import { analyzeAqi, searchAirQuality } from '../lib/api'

const FADE = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } } }
const ITEM = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const SAMPLE_DATA = [
  { label: 'Delhi',    aqi: 187, pm25: 142, pm10: 236, no2: 82,  o3: 48, co: 3.1, so2: 18 },
  { label: 'Mumbai',   aqi: 74,  pm25: 48,  pm10: 91,  no2: 34,  o3: 61, co: 1.2, so2: 9  },
  { label: 'New York', aqi: 42,  pm25: 22,  pm10: 39,  no2: 21,  o3: 55, co: 0.7, so2: 4  },
  { label: 'Beijing',  aqi: 156, pm25: 118, pm10: 205, no2: 76, o3: 39, co: 2.7, so2: 21 },
  { label: 'London',   aqi: 38,  pm25: 18,  pm10: 31,  no2: 28,  o3: 47, co: 0.6, so2: 3  },
  { label: 'Tokyo',    aqi: 51,  pm25: 31,  pm10: 57,  no2: 25,  o3: 52, co: 0.8, so2: 5  },
]

export default function Dashboard({ setPage }) {
  const [aqi, setAqi] = useState(null)
  const [pollValues, setPollValues] = useState({})
  const [inputAqi, setInputAqi] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [analysisText, setAnalysisText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)
  const [error, setError] = useState('')

  const level = aqi != null ? getAqiLevel(aqi) : null

  async function handleCheck() {
    const val = parseInt(inputAqi)
    if (isNaN(val) || val < 0 || val > 500) { setError('Enter a valid AQI (0–500)'); return }
    setError('')
    setAqi(val)
    setLoading(true)
    setAnalysisText('')
    try {
      const res = await analyzeAqi({ aqi: val, location, pollutants: pollValues })
      setAnalysisText(res.data.analysis)
    } catch (e) {
      setAnalysisText(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCitySearch() {
    const query = city.trim()
    if (!query) { setError('Enter a city or place to search'); return }
    setError('')
    setAnalysisText('')
    setCityLoading(true)
    try {
      const res = await searchAirQuality(query)
      const data = res.data
      setLocation(data.location)
      setInputAqi(String(data.aqi))
      setAqi(data.aqi)
      setPollValues(data.pollutants)
      try {
        const analysis = await analyzeAqi({ aqi: data.aqi, location: data.location, pollutants: data.pollutants })
        setAnalysisText(analysis.data.analysis)
      } catch (analysisError) {
        setAnalysisText(analysisError.response?.data?.error || analysisError.message)
      }
    } catch (searchError) {
      setError(searchError.response?.data?.error || searchError.message)
    } finally {
      setCityLoading(false)
    }
  }

  function loadSample(s) {
    setLocation(s.label)
    setCity(s.label)
    setInputAqi(String(s.aqi))
    setAqi(s.aqi)
    setPollValues({ pm25: s.pm25, pm10: s.pm10, no2: s.no2, o3: s.o3, co: s.co, so2: s.so2 })
  }

  return (
    <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-6">
      {/* Hero */}
      <motion.div variants={ITEM} className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent pointer-events-none rounded-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="flex-shrink-0 w-64">
            <AqiGauge value={aqi} />
            {level && (
              <div className={`mt-2 text-center px-4 py-1.5 rounded-full text-sm font-bold ${level.badge} mx-auto inline-block`}
                style={{ display: 'block', width: 'fit-content', margin: '8px auto 0' }}>
                {level.label}
              </div>
            )}
          </div>

          {/* Input + stats */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Search a city or place</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                    placeholder="e.g. New Delhi, London, Tokyo"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 outline-none focus:border-blue-500/60 transition-all"
                  />
                </div>
                <button onClick={handleCitySearch} disabled={cityLoading || !city.trim()}
                  className="px-5 py-3 rounded-xl border border-blue-400/30 bg-blue-500/15 text-blue-200 font-bold hover:bg-blue-500/25 transition-all disabled:opacity-40 flex items-center gap-2">
                  {cityLoading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
                  Search
                </button>
              </div>
              {location && <p className="text-xs text-emerald-300/70">Showing live air quality for {location}</p>}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Quick AQI Check</h2>
              <p className="text-white/50 text-sm">Enter an AQI reading to get instant AI analysis</p>
            </div>
            <div className="flex gap-3">
              <input
                type="number" min="0" max="500"
                value={inputAqi}
                onChange={e => setInputAqi(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                placeholder="Enter AQI value (0–500)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all text-lg font-semibold"
              />
              <button
                onClick={handleCheck}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Activity size={18} /> Analyze
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {/* Quick samples */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/30 self-center">Try sample:</span>
              {SAMPLE_DATA.map(s => (
                <button key={s.label} onClick={() => loadSample(s)}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:border-white/25 hover:text-white/90 transition-all">
                  {s.label} ({s.aqi})
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Analysis Result */}
      {(loading || analysisText) && (
        <motion.div variants={ITEM} className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Wind size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm">AI Health Advisory</span>
            {level && <span className={`ml-auto px-3 py-0.5 rounded-full text-xs font-bold ${level.badge}`}>AQI {aqi} — {level.label}</span>}
          </div>
          {loading ? (
            <div className="flex items-center gap-3 text-white/40 text-sm">
              <div className="flex gap-1"><span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/></div>
              Generating AI analysis…
            </div>
          ) : (
            <div className="prose-chat text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{analysisText}</div>
          )}
        </motion.div>
      )}

      {/* Pollutants */}
      <motion.div variants={ITEM}>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Pollutant Breakdown</h3>
        <PollutantGrid values={pollValues} />
      </motion.div>

      {/* City cards */}
      <motion.div variants={ITEM}>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Global AQI Snapshot</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SAMPLE_DATA.map(s => {
            const lv = getAqiLevel(s.aqi)
            return (
              <button key={s.label} onClick={() => loadSample(s)}
                className="glass rounded-2xl p-4 text-left hover:border-white/20 hover:-translate-y-0.5 transition-all">
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: lv.color }}>{s.aqi}</p>
                <p className="text-[10px] mt-1 font-semibold" style={{ color: lv.color }}>{lv.label}</p>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* CTA cards */}
      <motion.div variants={ITEM} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Activity size={20}/>, title: 'Deep Analyzer', desc: 'Enter full pollutant data for detailed AI insights', color: 'from-blue-500/20 to-indigo-600/10', page: 'analyzer' },
          { icon: <MessageCircle size={20}/>, title: 'AI Chat', desc: 'Ask anything about air quality & health', color: 'from-indigo-500/20 to-purple-600/10', page: 'chat' },
          { icon: <Info size={20}/>, title: 'Learn More', desc: 'Understand AQI scales and pollutants', color: 'from-emerald-500/20 to-cyan-600/10', page: 'about' },
        ].map(c => (
          <button key={c.title} onClick={() => setPage(c.page)}
            className={`glass rounded-2xl p-5 text-left bg-gradient-to-br ${c.color} hover:border-white/20 hover:-translate-y-0.5 transition-all`}>
            <div className="text-blue-400 mb-2">{c.icon}</div>
            <p className="font-semibold mb-1">{c.title}</p>
            <p className="text-xs text-white/40">{c.desc}</p>
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}
