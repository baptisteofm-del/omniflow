'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Star, Send, TrendingUp } from 'lucide-react'

const profiles = [
  { username: '@victoria_ofm', followers: '127K', niche: 'Lifestyle', score: 96, avatar: '👩‍🦳', platform: 'IG' },
  { username: '@sophie_create', followers: '84K', niche: 'Fitness', score: 91, avatar: '👩‍🦱', platform: 'TK' },
  { username: '@leamia_official', followers: '203K', niche: 'Fashion', score: 88, avatar: '👱‍♀️', platform: 'IG' },
  { username: '@emma.studios', followers: '56K', niche: 'Beauty', score: 85, avatar: '🧕', platform: 'IG' },
  { username: '@nina.content', followers: '178K', niche: 'Travel', score: 82, avatar: '👩', platform: 'TK' },
]

const outreachMsg = `Bonjour Victoria 👋

J'ai remarqué ton contenu — ta façon d'engager ta communauté est vraiment unique.

Notre agence travaille avec des créatrices comme toi pour maximiser leur revenus sur OnlyFans/MYM grâce à nos outils IA.

Résultats typiques : +340% de revenus en 60 jours.

Disponible pour un appel de 15min cette semaine ? 🚀`

export function DemoProspection() {
  const [phase, setPhase] = useState<'search' | 'results' | 'profile' | 'outreach'>('search')
  const [visibleProfiles, setVisibleProfiles] = useState<typeof profiles>([])
  const [selectedProfile, setSelectedProfile] = useState<typeof profiles[0] | null>(null)
  const [typedMsg, setTypedMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [scanned, setScanned] = useState(0)

  useEffect(() => {
    const run = () => {
      setPhase('search')
      setVisibleProfiles([])
      setSelectedProfile(null)
      setTypedMsg('')
      setSent(false)
      setScanned(0)

      // Scan counter
      let s = 0
      const scanInterval = setInterval(() => {
        s += Math.floor(Math.random() * 8) + 3
        setScanned(Math.min(s, 127))
        if (s >= 127) clearInterval(scanInterval)
      }, 80)

      // Show results
      setTimeout(() => {
        setPhase('results')
        profiles.forEach((p, i) => {
          setTimeout(() => {
            setVisibleProfiles(prev => [...prev, p])
          }, i * 300)
        })
      }, 1800)

      // Select profile
      setTimeout(() => {
        setPhase('profile')
        setSelectedProfile(profiles[0])
      }, 4000)

      // Type outreach
      setTimeout(() => {
        setPhase('outreach')
        let i = 0
        const typeInterval = setInterval(() => {
          setTypedMsg(outreachMsg.slice(0, i + 1))
          i++
          if (i >= outreachMsg.length) clearInterval(typeInterval)
        }, 20)
      }, 5500)

      // Send
      setTimeout(() => setSent(true), 9000)
    }

    run()
    const interval = setInterval(run, 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ perspective: '1200px' }}>
      <motion.div animate={{ rotateX: [-3, -6, -3], rotateY: [3, 6, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#080810]"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.2)' }}>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-400 bg-slate-800/80 px-4 py-1 rounded-full border border-gray-700/50">
                OmniFlow — Prospection
              </span>
            </div>
            <span className="text-xs text-cyan-400">{scanned} profils scannés</span>
          </div>

          <div className="flex h-[460px]">
            {/* Left panel */}
            <div className="w-1/2 border-r border-purple-500/10 p-4 flex flex-col gap-3">
              {/* Search bar */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-purple-500/20">
                <Search size={14} className="text-purple-400" />
                <span className="text-sm text-gray-300">Créatrices 50K-250K abonnés</span>
                {phase === 'search' && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="ml-auto w-3 h-3 border border-purple-400 border-t-transparent rounded-full" />
                )}
                {phase !== 'search' && (
                  <span className="ml-auto text-xs text-green-400">✓</span>
                )}
              </div>

              {/* Profile list */}
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                <AnimatePresence>
                  {visibleProfiles.map((p, i) => (
                    <motion.div key={p.username}
                      initial={{ opacity: 0, x: -15, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedProfile(p)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${
                        selectedProfile?.username === p.username
                          ? 'bg-purple-500/15 border-purple-500/30'
                          : 'border-transparent hover:bg-slate-800/50'
                      }`}>
                      <span className="text-xl">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{p.username}</p>
                        <p className="text-xs text-gray-500">{p.followers} · {p.niche}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-amber-400">{p.score}</span>
                        </div>
                        <span className="text-xs text-gray-600">{p.platform}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {phase === 'search' && (
                  <div className="flex flex-col gap-1.5">
                    {[...Array(3)].map((_, i) => (
                      <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="h-12 rounded-xl bg-slate-800/40" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="w-1/2 p-4 flex flex-col gap-3">
              <AnimatePresence mode="wait">
                {phase === 'search' && (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center gap-4">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Search size={24} className="text-purple-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">Scraping en cours...</p>
                      <p className="text-xs text-gray-500">Instagram · TikTok</p>
                    </div>
                    <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                    </div>
                  </motion.div>
                )}

                {(phase === 'profile' || phase === 'outreach') && selectedProfile && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-purple-500/20">
                      <span className="text-3xl">{selectedProfile.avatar}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{selectedProfile.username}</p>
                        <p className="text-xs text-gray-400">{selectedProfile.followers} abonnés · {selectedProfile.niche}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{selectedProfile.score}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[['Engagement', '8.4%', 'text-cyan-400'], ['Croissance', '+2.1K/j', 'text-green-400'], ['Conversion', 'Haute', 'text-pink-400']].map(([l, v, c], i) => (
                        <div key={i} className="flex-1 p-2 rounded-lg bg-slate-900/50 border border-gray-700/30 text-center">
                          <p className={`text-xs font-bold ${c}`}>{v}</p>
                          <p className="text-xs text-gray-600">{l}</p>
                        </div>
                      ))}
                    </div>

                    {phase === 'outreach' && (
                      <div className="flex-1 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-gray-400">Message IA généré</p>
                        <div className="flex-1 p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 overflow-y-auto">
                          <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">{typedMsg}
                            {!sent && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                              className="inline-block w-0.5 h-3 bg-purple-400 ml-0.5 align-middle" />}
                          </p>
                        </div>
                        <AnimatePresence>
                          {sent && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/30">
                              <Send size={14} className="text-green-400" />
                              <span className="text-xs font-semibold text-green-400">Message envoyé · Dans le pipeline</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
