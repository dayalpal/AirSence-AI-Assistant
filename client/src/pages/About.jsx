import { motion } from 'framer-motion'
import { Wind, Shield, BarChart2, MessageCircle, Zap, Globe } from 'lucide-react'
import { AQI_LEVELS } from '../lib/aqi'

const FADE = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{staggerChildren:0.07}} }
const ITEM = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0} }

const FEATURES = [
  { icon:<Wind size={22}/>,          title:'Real-time AQI Analysis',   desc:'Instant interpretation of any AQI value with AI-powered health context.',        color:'from-blue-500/20 to-blue-600/5'    },
  { icon:<Shield size={22}/>,        title:'Health Advisories',         desc:'Personalized safety recommendations for general public, children & sensitive groups.',color:'from-indigo-500/20 to-indigo-600/5' },
  { icon:<BarChart2 size={22}/>,     title:'Pollutant Breakdown',       desc:'Visual breakdown of PM2.5, PM10, NO₂, O₃, CO, and SO₂ levels.',                  color:'from-purple-500/20 to-purple-600/5' },
  { icon:<MessageCircle size={22}/>, title:'AI Chat Assistant',         desc:'Conversational AI powered by Gemini 2.5 Flash for all your air quality questions.',color:'from-emerald-500/20 to-emerald-600/5'},
  { icon:<Zap size={22}/>,           title:'No Login Required',         desc:'Completely open to the public — no account, no sign-up, just instant access.',   color:'from-yellow-500/20 to-yellow-600/5' },
  { icon:<Globe size={22}/>,         title:'Global Coverage',           desc:'Check AQI for any location worldwide with sample data from major cities.',        color:'from-cyan-500/20 to-cyan-600/5'    },
]

const POLLUTANTS_INFO = [
  { name:'PM2.5', full:'Fine Particulate Matter', source:'Vehicle exhaust, industrial smoke, wildfires', risk:'Penetrates lungs, enters bloodstream; linked to heart & lung disease' },
  { name:'PM10',  full:'Coarse Particulate Matter',source:'Dust, construction, pollen',                  risk:'Irritates airways; triggers asthma and respiratory conditions' },
  { name:'NO₂',   full:'Nitrogen Dioxide',          source:'Combustion engines, power plants',           risk:'Inflames airways; increases risk of respiratory infections' },
  { name:'O₃',    full:'Ground-level Ozone',         source:'Sunlight + NOx + VOCs reactions',           risk:'Chest pain, coughing; damages lung tissue with prolonged exposure' },
  { name:'CO',    full:'Carbon Monoxide',            source:'Incomplete combustion, vehicles, stoves',   risk:'Reduces oxygen delivery to organs; can be fatal at high levels' },
  { name:'SO₂',   full:'Sulfur Dioxide',             source:'Coal burning, smelting, volcanoes',         risk:'Triggers bronchospasm; irritates eyes, nose, and throat' },
]

export default function About() {
  return (
    <motion.div variants={FADE} initial="hidden" animate="show" className="space-y-10">
      {/* Hero */}
      <motion.div variants={ITEM} className="glass rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent pointer-events-none rounded-3xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-4">
            <Wind size={12}/> Open & Free • No Login Required
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Understanding Air Quality<br/>
            <span className="gradient-text">Starts Here</span>
          </h1>
          <p className="text-white/55 leading-relaxed">
            AirSense is an AI-powered air quality monitoring assistant that helps you understand pollution levels,
            health impacts, and what actions to take — completely open to the public, no account needed.
          </p>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div variants={ITEM}>
        <h2 className="text-xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className={`glass rounded-2xl p-5 bg-gradient-to-br ${f.color} hover:border-white/15 hover:-translate-y-0.5 transition-all`}>
              <div className="text-blue-300 mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AQI Scale */}
      <motion.div variants={ITEM}>
        <h2 className="text-xl font-bold mb-4">AQI Scale Explained</h2>
        <div className="glass rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {AQI_LEVELS.map(l => (
              <div key={l.label} className="flex items-center gap-5 px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="w-14 h-2 rounded-full flex-shrink-0" style={{ background: l.color, boxShadow: `0 0 12px ${l.glow}66` }} />
                <div className="w-20 text-sm font-bold flex-shrink-0" style={{ color: l.color }}>
                  0–{l.max}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-white">{l.label}</p>
                </div>
                <div className={`px-3 py-0.5 rounded-full text-xs font-bold ${l.badge}`}>{l.badge.replace('badge-','').replace('veryunhealthy','Very Unhealthy').replace(/^\w/, c => c.toUpperCase())}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pollutants */}
      <motion.div variants={ITEM}>
        <h2 className="text-xl font-bold mb-4">Common Air Pollutants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {POLLUTANTS_INFO.map(p => (
            <div key={p.name} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold">{p.name}</span>
                <span className="text-sm font-semibold text-white/80">{p.full}</span>
              </div>
              <p className="text-xs text-white/40 mb-1"><span className="text-white/60 font-medium">Source: </span>{p.source}</p>
              <p className="text-xs text-white/40"><span className="text-red-400 font-medium">Risk: </span>{p.risk}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
