'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, DollarSign } from 'lucide-react'

const conversations = [
  { name: 'Emma R.', avatar: '👩‍🦰', time: '2s', preview: 'tu es là ce soir ? 🔥' },
  { name: 'Sophie M.', avatar: '👱‍♀️', time: '14s', preview: 'j\'ai vu ton post...' },
  { name: 'Léa D.', avatar: '🧕', time: '1min', preview: 'c\'est combien pour voir ?' },
  { name: 'Camille K.', avatar: '👩‍🦱', time: '3min', preview: 'tu peux m\'envoyer un preview' },
]

const sequences = [
  [
    { role: 'fan', text: 'tu es là ce soir ? 🔥', delay: 0 },
    { role: 'ai', text: 'Toujours là pour toi 😈 j\'ai quelque chose de très spécial ce soir...', delay: 1200 },
    { role: 'fan', text: 'c\'est quoi ?', delay: 2600 },
    { role: 'ai', text: 'Une surprise exclusive, juste pour mes vrais fans... tu veux voir ? 💋', delay: 3800 },
    { role: 'fan', text: 'oui vas-y !', delay: 5000 },
    { role: 'ai', text: 'Accès immédiat pour 15€ seulement ❤️‍🔥 Tu ne seras pas déçu(e)...', delay: 6200 },
    { role: 'fan', text: 'ok je prends', delay: 7400 },
    { role: 'ai', text: 'Merci babe 🥰 Je t\'envoie le lien. Reviens demain pour encore mieux 😉', delay: 8600 },
  ],
  [
    { role: 'fan', text: 'j\'ai vu ton dernier post, c\'était 🔥🔥🔥', delay: 0 },
    { role: 'ai', text: 'Ça me fait tellement plaisir que tu aimes 😍 Je t\'ai préparé quelque chose encore mieux...', delay: 1200 },
    { role: 'fan', text: 'vraiment ?', delay: 2400 },
    { role: 'ai', text: 'Rien que pour mes fans les plus fidèles 💎 Tu es l\'un d\'eux depuis longtemps...', delay: 3600 },
    { role: 'fan', text: 'aww merci ❤️', delay: 4800 },
    { role: 'ai', text: 'Contenu premium disponible maintenant, prix spécial fan historique : 12€ 🎁', delay: 6000 },
  ],
]

export function DemoChattingIA() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [activeConv, setActiveConv] = useState(0)
  const [stats, setStats] = useState({ msgs: 247, rate: 94, revenue: 1840, active: 12 })
  const [seqIdx, setSeqIdx] = useState(0)
  const [aiTyping, setAiTyping] = useState(false)

  useEffect(() => {
    let timers: NodeJS.Timeout[] = []

    const run = (seqIndex: number) => {
      setMessages([])
      setAiTyping(false)
      const seq = sequences[seqIndex % sequences.length]

      seq.forEach((msg, i) => {
        const t = setTimeout(() => {
          if (msg.role === 'ai') {
            setAiTyping(true)
            setTimeout(() => {
              setAiTyping(false)
              setMessages(prev => [...prev, msg])
              if (msg.role === 'ai') {
                setStats(s => ({ ...s, msgs: s.msgs + 1, revenue: s.revenue + Math.floor(Math.random() * 15) }))
              }
            }, 800)
          } else {
            setMessages(prev => [...prev, msg])
          }
        }, msg.delay)
        timers.push(t)
      })

      const reset = setTimeout(() => {
        setSeqIdx(i => i + 1)
        setActiveConv(c => (c + 1) % conversations.length)
      }, seq[seq.length - 1].delay + 3000)
      timers.push(reset)
    }

    run(seqIdx)
    return () => timers.forEach(clearTimeout)
  }, [seqIdx])

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
                OmniFlow — Chatting IA
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-400">{stats.active} actives</span>
            </div>
          </div>

          <div className="flex h-[460px]">
            {/* Conversations list */}
            <div className="w-44 border-r border-purple-500/10 bg-slate-900/50 flex flex-col">
              <div className="p-3 border-b border-purple-500/10">
                <p className="text-xs text-gray-500 font-semibold uppercase">Conversations</p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((c, i) => (
                  <motion.div key={i} onClick={() => setActiveConv(i)}
                    whileHover={{ x: 2 }}
                    className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                      activeConv === i
                        ? 'bg-purple-500/15 border-purple-500/30'
                        : 'border-transparent hover:bg-slate-800/50'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{c.avatar}</span>
                      <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{c.preview}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        className="w-1 h-1 rounded-full bg-green-500" />
                      <span className="text-xs text-gray-600">{c.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 border-t border-purple-500/10">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-xs text-purple-300 font-semibold">IA Active</p>
                  <p className="text-xs text-gray-500">Répond seule</p>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-purple-500/10 px-5 py-3 flex items-center justify-between bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{conversations[activeConv].avatar}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{conversations[activeConv].name}</p>
                    <div className="flex items-center gap-1.5">
                      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">IA répond automatiquement</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  <Zap size={10} className="text-purple-400" />
                  <span className="text-xs text-purple-300">Auto</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 flex flex-col justify-end">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                      className={`flex ${msg.role === 'fan' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-auto">
                          <Zap size={10} className="text-white" />
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'fan'
                          ? 'bg-slate-700/60 border border-gray-600/30 text-gray-200 rounded-br-sm'
                          : 'bg-gradient-to-br from-purple-600/30 to-purple-500/20 border border-purple-500/30 text-gray-100 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {aiTyping && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Zap size={10} className="text-white" />
                      </div>
                      <div className="px-4 py-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-purple-500/10 px-4 py-3 bg-slate-900/30">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 border border-gray-700/30">
                  <span className="text-xs text-gray-500 flex-1">L'IA rédige et envoie automatiquement...</span>
                  <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded-full">
                    <Zap size={9} className="text-purple-400" />
                    <span className="text-xs text-purple-300">Auto</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="w-36 border-l border-purple-500/10 bg-slate-900/40 p-4 flex flex-col gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={10} className="text-cyan-400" />
                  <p className="text-xs text-gray-500">Messages/h</p>
                </div>
                <motion.p key={stats.msgs} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-cyan-400">{stats.msgs}</motion.p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500">Engagement</p>
                <motion.p key={stats.rate} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-400">{stats.rate}%</motion.p>
                <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div animate={{ width: `${stats.rate}%` }} className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign size={10} className="text-pink-400" />
                  <p className="text-xs text-gray-500">Revenus</p>
                </div>
                <motion.p key={stats.revenue} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-pink-400">${stats.revenue}</motion.p>
              </div>

              <div className="mt-auto pt-3 border-t border-purple-500/10 space-y-2">
                {['Vente auto', 'Relance auto', 'Fidélisation', '24/7'].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
