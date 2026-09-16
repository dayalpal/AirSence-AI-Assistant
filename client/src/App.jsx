import { useState, useEffect } from 'react'
import { LayoutDashboard, Activity, MessageCircle, Info, Menu, X, AlertTriangle } from 'lucide-react'
import Logo from './components/Logo'
import Dashboard from './pages/Dashboard'
import Analyzer  from './pages/Analyzer'
import Chat      from './pages/Chat'
import About     from './pages/About'
import { checkStatus } from './lib/api'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={18}/> },
  { id: 'analyzer',  label: 'Analyzer',   icon: <Activity size={18}/> },
  { id: 'chat',      label: 'AI Chat',    icon: <MessageCircle size={18}/> },
  { id: 'about',     label: 'About',      icon: <Info size={18}/> },
]

export default function App() {
  const [page, setPage]              = useState('dashboard')
  const [apiReady, setApiReady]      = useState(false)
  const [modelName, setModelName]    = useState('')
  const [sidebarOpen, setSidebar]    = useState(false)
  const [chatContext, setChatContext] = useState('')
  const [bannerDismissed, setBanner] = useState(false)

  useEffect(() => {
    const refresh = () =>
      checkStatus()
        .then(r => {
          setApiReady(r.data.ready)
          if (r.data.model) setModelName(r.data.model)
        })
        .catch(() => {})
    refresh()
    // Poll every 5s so UI updates as soon as key is saved
    const t = setInterval(() => refresh(false), 5000)
    return () => clearInterval(t)
  }, [])

  function navigate(id) {
    setPage(id)
    setSidebar(false)
  }

  const pageProps = { setPage: navigate, apiReady, setApiReady, modelName }

  return (
    <div className="relative min-h-screen bg-[#080d17]">
      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 flex min-h-screen">
        {/* ── Sidebar ───────────────────────────────── */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebar(false)} />
        )}

        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen z-30 lg:z-auto
          w-64 flex flex-col
          bg-[#080d17]/90 backdrop-blur-2xl border-r border-white/8
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo */}
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <Logo />
            <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebar(false)}>
              <X size={18}/>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV.map(n => (
              <button key={n.id} onClick={() => navigate(n.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${page === n.id
                    ? 'nav-active'
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}>
                <span className={page === n.id ? 'text-blue-400' : 'text-white/40'}>{n.icon}</span>
                {n.label}
                {n.id === 'chat' && !apiReady && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-yellow-500/80" title="API key needed"/>
                )}
              </button>
            ))}
          </nav>

          {/* API status */}
          <div className="p-4 border-t border-white/8">
            <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-white/3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${apiReady ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'}`}/>
                <span className="text-xs text-white/45 font-medium">{apiReady ? 'Gemini Connected' : 'API Not Configured'}</span>
              </div>
              {modelName && (
                <p className="text-[10px] text-white/25 font-mono pl-4 truncate" title={modelName}>{modelName}</p>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile topbar */}
          <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#080d17]/80 backdrop-blur-xl border-b border-white/8">
            <button onClick={() => setSidebar(true)} className="text-white/60 hover:text-white">
              <Menu size={22}/>
            </button>
            <Logo size="sm" />
            <div className={`w-2.5 h-2.5 rounded-full ${apiReady ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'}`}/>
          </header>

          {/* ── API Key Banner ── */}
          {!apiReady && !bannerDismissed && (
            <div className="mx-5 mt-5 sm:mx-8 sm:mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300">
              <AlertTriangle size={17} className="flex-shrink-0 text-yellow-400" />
              <p className="text-sm flex-1">
                <span className="font-semibold">Gemini is not configured on the server.</span>
                {' '}Ask the developer to add GEMINI_API_KEY to server/.env.
              </p>
              <button onClick={() => setBanner(true)} className="text-yellow-500/50 hover:text-yellow-300 transition-colors ml-1">
                <X size={16}/>
              </button>
            </div>
          )}

          {/* Page */}
          <main className="flex-1 p-5 sm:p-8 overflow-auto">
            {page === 'dashboard' && <Dashboard {...pageProps} />}
            {page === 'analyzer'  && <Analyzer  {...pageProps} setChatContext={setChatContext} />}
            {page === 'chat'      && <Chat       {...pageProps} initialContext={chatContext} clearContext={() => setChatContext('')} />}
            {page === 'about'     && <About      {...pageProps} />}
          </main>
        </div>
      </div>
    </div>
  )
}
