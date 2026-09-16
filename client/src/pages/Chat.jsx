import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Trash2, Wind } from 'lucide-react'
import MarkdownText from '../components/MarkdownText'
import { sendChat } from '../lib/api'

const QUICK_PROMPTS = [
  { label: 'What is AQI?',          prompt: 'What is AQI and how is it calculated?' },
  { label: 'PM2.5 risks',           prompt: 'What are the health effects of PM2.5 particles?' },
  { label: 'Protect myself',        prompt: 'How can I protect myself on high pollution days?' },
  { label: 'Indoor air quality',    prompt: 'How can I improve indoor air quality at home?' },
  { label: 'Children & pollution',  prompt: 'How does air pollution affect children specifically?' },
  { label: 'Best air purifiers',    prompt: 'What should I look for in an air purifier?' },
]

const INIT_MSG = {
  role: 'bot',
  text: `**Hello! I'm AirSense AI 👋**\n\nI'm your expert air quality assistant. I can help you with:\n- Understanding AQI values and health categories\n- Pollutants: PM2.5, PM10, NO₂, SO₂, CO, O₃\n- Personalized health & safety recommendations\n- Indoor and outdoor air quality tips\n\nWhat would you like to know?`,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

export default function Chat({ initialContext, clearContext, modelName }) {
  const [messages, setMessages] = useState([INIT_MSG])
  const [input, setInput]   = useState(initialContext || '')
  const [loading, setLoading] = useState(false)
  const history = useRef([])
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // If a context was injected (from Analyzer)
  useEffect(() => {
    if (initialContext) {
      setInput(initialContext)
      clearContext()
    }
  }, [initialContext])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg) return

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: msg, time }])
    setInput('')
    setLoading(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await sendChat(msg, history.current)
      const reply = res.data.reply
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: botTime }])
      history.current = [...history.current, { role: 'user', text: msg }, { role: 'model', text: reply }].slice(-20)
    } catch (e) {
      const errMsg = e.response?.data?.error || e.message
      setMessages(prev => [...prev, { role: 'bot', text: `⚠️ ${errMsg}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([INIT_MSG])
    history.current = []
  }

  function autoResize(e) {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Powered by <span className="font-mono text-blue-400/70">{modelName || 'Gemini AI'}</span>
          </p>
        </div>
        <button onClick={clearChat}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/25 hover:text-white transition-all">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Chat window */}
      <div className="glass rounded-3xl flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                ${m.role === 'bot'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
                {m.role === 'bot'
                  ? <Wind size={15} className="text-white" />
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                }
              </div>
              {/* Bubble */}
              <div className={`max-w-[78%] space-y-1 ${m.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'bot'
                    ? 'bg-white/5 text-white/80 rounded-tl-sm'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm'}`}>
                  {m.role === 'bot' ? <MarkdownText text={m.text} /> : <span>{m.text}</span>}
                </div>
                <span className="text-[11px] text-white/25 px-1">{m.time}</span>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Wind size={15} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 rounded-tl-sm flex gap-1.5 items-center">
                <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(q => (
              <button key={q.label} onClick={() => handleSend(q.prompt)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/55 hover:border-blue-500/40 hover:text-white hover:bg-blue-500/10 transition-all">
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/8 p-4 flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e) }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Ask about air quality, pollutants, health tips…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-blue-500/50 resize-none transition-all text-sm leading-relaxed"
          />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:opacity-85 hover:scale-105 transition-all disabled:opacity-40 disabled:scale-100 shadow-lg shadow-blue-500/30">
            <Send size={17} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
