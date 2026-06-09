'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Play, Heart, Bookmark, ExternalLink, TrendingUp, Zap } from 'lucide-react'

const trends = [
  {
    id: 1, title: 'Transition miroir — slow motion', author: '@creator.studio', engagement: '2.4M',
    score: 97, why: 'Format ultra-viral — +420% en 48h', views: '8.1M', saved: false,
    gradient: 'from-pink-500/20 to-purple-500/20',
  },
  {
    id: 2, title: 'GRWM intime — lumière naturelle', author: '@morning.vibe', engagement: '1.8M',
    score: 93, why: 'Format "intimité" en explosion', views: '5.3M', saved: false,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 3, title: 'POV cinématique — coulisses', author: '@pov.films', engagement: '3.1M',
    score: 91, why: 'Curiosité + coulisses = combo gagnant', views: '12M', saved: false,
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 4, title: 'Teasing mystère — texte animé', author: '@teaser.ia', engagement: '987K',
    score: 88, why: 'Rétention maximale — 94% complétion', views: '3.2M', saved: false,
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
]

export function DemoVeilleTrends() {
  const [visibleTrends, setVisibleTrends] = useState<typeof trends>([])
  const [scanning, setScanning] = useState(true)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [scanned, setScanned] = useState(0)
  const [detectedAt, setDetectedAt] = useState('')

  useEffect(() => {
    const run = () => {
      setVisibleTrends([])
      setScanning(true)
      setScanned(0)
      setSavedIds([])
      setPlayingId(null)

      let n = 0
      const scanInterval = setInterval(() => {
        n += Math.floor(Math.random() * 15) + 5
        setScanned(Math.min(n, 847))
        if (n >= 847) clearInterval(scanInterval)
      }, 60)

      setTimeout(() => {
        setScanning(false)
        setDetectedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
        trends.forEach((t, i) => {
          setTimeout(() => setVisibleTrends(prev => [...prev, t]), i * 400)
        })
      }, 2000)

      // Auto-play first
      setTimeout(() => setPlayingId(1), 3500)
      setTimeout(() => setPlayingId(null), 5000)

      // Auto-save top one
      setTimeout(() => setSavedIds([1]), 5500)
    }

    run()
    const interval = setInterval(run, 11000)
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
                OmniFlow — Veille Trends
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {scanning
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full" />
                : <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500" />
              }
              <span className="text-xs text-gray-400">{scanned} vidéos</span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3 min-h-[460px]">
            {/* Header strip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">
                  {scanning ? 'Scraping Instagram...' : `${visibleTrends.length} trends détectées`}
                </span>
              </div>
              {!scanning && detectedAt && (
                <span className="text-xs text-gray-500">Mis à jour {detectedAt}</span>
              )}
            </div>

            {/* Scanning state */}
            <AnimatePresence>
              {scanning && (
                <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="relative w-20 h-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-3 rounded-full border-2 border-cyan-500/30 border-t-cyan-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap size={20} className="text-purple-400" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-white">Analyse en cours</p>
                    <p className="text-xs text-gray-500">{scanned} vidéos Instagram scannées</p>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${(scanned / 847) * 100}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trends grid */}
            {!scanning && (
              <div className="grid grid-cols-2 gap-3 flex-1">
                <AnimatePresence>
                  {visibleTrends.map((trend, idx) => (
                    <motion.div key={trend.id}
                      initial={{ opacity: 0, y: 15, scale: 0.93 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                      className={`relative rounded-xl bg-gradient-to-br ${trend.gradient} border border-white/5 overflow-hidden group cursor-pointer`}>

                      {/* Video preview placeholder */}
                      <div className="h-24 bg-gradient-to-br from-slate-800/60 to-slate-900/60 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                        {/* Fake video bars */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-0.5 px-2 pb-1 h-10">
                          {[...Array(20)].map((_, i) => (
                            <motion.div key={i}
                              animate={{ height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 60}%`] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05, repeatType: 'reverse' }}
                              className="flex-1 bg-purple-400/30 rounded-sm" />
                          ))}
                        </div>
                        <motion.div
                          animate={playingId === trend.id ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className={`absolute inset-0 flex items-center justify-center`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            playingId === trend.id
                              ? 'bg-purple-500/80 border border-purple-400'
                              : 'bg-black/40 border border-white/20'
                          }`}>
                            <Play size={12} className="text-white ml-0.5" />
                          </div>
                        </motion.div>

                        {/* Score badge */}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full">
                          <div className="w-1 h-1 rounded-full bg-green-500" />
                          <span className="text-xs font-bold text-white">{trend.score}</span>
                        </div>

                        {idx === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-amber-500/80 px-1.5 py-0.5 rounded-full">
                            <span className="text-xs font-bold text-black">#1 VIRAL</span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-1.5">
                        <p className="text-xs font-semibold text-white leading-tight line-clamp-1">{trend.title}</p>
                        <p className="text-xs text-gray-500">{trend.author}</p>
                        <div className="flex items-center gap-1.5">
                          <Heart size={9} className="text-pink-400" />
                          <span className="text-xs text-gray-400">{trend.engagement}</span>
                        </div>
                        <p className="text-xs text-cyan-400 leading-tight line-clamp-1">{trend.why}</p>
                        <div className="flex gap-1 pt-0.5">
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setSavedIds(ids => ids.includes(trend.id) ? ids.filter(i => i !== trend.id) : [...ids, trend.id])}
                            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs border transition-all ${
                              savedIds.includes(trend.id)
                                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                                : 'border-gray-700/30 text-gray-500 hover:border-purple-500/20'
                            }`}>
                            <Bookmark size={9} />
                            {savedIds.includes(trend.id) ? 'Sauvé' : 'Sauver'}
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-6 h-6 rounded-lg border border-gray-700/30 text-gray-500 hover:border-purple-500/20">
                            <ExternalLink size={9} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
