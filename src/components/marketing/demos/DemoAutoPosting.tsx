'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check, Clock, Send, Zap } from 'lucide-react'

const platforms = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: 'pink' },
  { id: 'twitter', label: 'X / Twitter', emoji: '𝕏', color: 'blue' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', color: 'cyan' },
]

const postContent = "Nouveau contenu exclusif disponible maintenant 🔥 Rejoins-moi pour découvrir la surprise du week-end... 💋"

const schedule = [
  { time: '09:00', label: 'Matin', status: 'done' },
  { time: '14:00', label: 'Après-midi', status: 'done' },
  { time: '20:00', label: 'Soir', status: 'active' },
  { time: '23:00', label: 'Nuit', status: 'pending' },
]

const publishSteps = [
  { label: 'Préparation du contenu', icon: '📝' },
  { label: 'Sélection plateformes', icon: '🎯' },
  { label: 'Planification IA', icon: '🧠' },
  { label: 'Publication automatique', icon: '🚀' },
]

export function DemoAutoPosting() {
  const [step, setStep] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [publishStep, setPublishStep] = useState(-1)
  const [published, setPublished] = useState(false)
  const [totalPosts, setTotalPosts] = useState(1247)

  useEffect(() => {
    const run = () => {
      setStep(0)
      setTypedText('')
      setSelectedPlatforms([])
      setPublishStep(-1)
      setPublished(false)

      // Type text
      let i = 0
      const typeInterval = setInterval(() => {
        setTypedText(postContent.slice(0, i + 1))
        i++
        if (i >= postContent.length) clearInterval(typeInterval)
      }, 35)

      // Select platforms
      setTimeout(() => {
        setStep(1)
        setSelectedPlatforms(['instagram'])
      }, 2000)
      setTimeout(() => setSelectedPlatforms(['instagram', 'twitter']), 2800)
      setTimeout(() => setSelectedPlatforms(['instagram', 'twitter', 'tiktok']), 3500)

      // Publish steps
      setTimeout(() => { setStep(2); setPublishStep(0) }, 4500)
      setTimeout(() => setPublishStep(1), 5200)
      setTimeout(() => setPublishStep(2), 5900)
      setTimeout(() => setPublishStep(3), 6600)
      setTimeout(() => { setPublished(true); setTotalPosts(p => p + 1) }, 7300)
    }

    run()
    const interval = setInterval(run, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full" style={{ perspective: '1200px' }}>
      <motion.div animate={{ rotateX: [-3, -6, -3], rotateY: [3, 6, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#080810]"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.2), 0 0 120px rgba(139,92,246,0.05)' }}>

          {/* Titlebar */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium bg-slate-800/80 px-4 py-1 rounded-full border border-gray-700/50">
                OmniFlow — Auto-Posting
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>

          <div className="flex h-[460px]">
            {/* LEFT: Editor */}
            <div className="flex-1 p-5 flex flex-col gap-4 border-r border-purple-500/10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contenu</label>
                <div className="p-4 rounded-xl border border-purple-500/20 bg-slate-900/60 min-h-[90px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                  <p className="text-gray-200 text-sm leading-relaxed relative z-10">
                    {typedText}
                    <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle" />
                  </p>
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plateformes</label>
                <div className="flex flex-col gap-2">
                  {platforms.map((p, idx) => (
                    <motion.div key={p.id}
                      animate={{ borderColor: selectedPlatforms.includes(p.id) ? 'rgba(139,92,246,0.5)' : 'rgba(75,85,99,0.3)' }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedPlatforms.includes(p.id)
                          ? 'bg-purple-500/10 border-purple-500/40'
                          : 'bg-slate-900/30 border-gray-700/30'
                      }`}>
                      <span className="text-lg">{p.emoji}</span>
                      <span className={`text-sm font-medium flex-1 ${selectedPlatforms.includes(p.id) ? 'text-white' : 'text-gray-500'}`}>
                        {p.label}
                      </span>
                      <AnimatePresence>
                        {selectedPlatforms.includes(p.id) && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <AnimatePresence>
                {publishStep >= 0 && !published && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    {publishSteps.slice(0, publishStep + 1).map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-xs text-gray-300">
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                        {i < publishStep && <Check size={11} className="ml-auto text-green-400" />}
                        {i === publishStep && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="ml-auto w-3 h-3 border border-purple-400 border-t-transparent rounded-full" />}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {published && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Zap size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-400">Publié sur 3 plateformes</p>
                      <p className="text-xs text-gray-400">Instagram · X/Twitter · TikTok</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Schedule + Stats */}
            <div className="w-44 p-4 flex flex-col gap-4 bg-slate-900/40">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Planning</label>
                {schedule.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                    s.status === 'active' ? 'bg-purple-500/10 border border-purple-500/30' :
                    s.status === 'done' ? 'opacity-50' : 'opacity-30'
                  }`}>
                    <Clock size={11} className={s.status === 'active' ? 'text-purple-400' : 'text-gray-500'} />
                    <div>
                      <p className={`text-xs font-bold ${s.status === 'active' ? 'text-purple-300' : 'text-gray-400'}`}>{s.time}</p>
                      <p className="text-xs text-gray-600">{s.label}</p>
                    </div>
                    {s.status === 'done' && <Check size={10} className="ml-auto text-green-400" />}
                    {s.status === 'active' && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-purple-500/10">
                <div>
                  <p className="text-xs text-gray-500">Posts publiés</p>
                  <motion.p key={totalPosts} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="text-xl font-bold text-white">{totalPosts.toLocaleString()}</motion.p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ce mois</p>
                  <p className="text-xl font-bold text-cyan-400">847</p>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Actif 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
