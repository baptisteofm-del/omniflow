'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Heart, Repeat2, MessageSquare, BarChart2, Bookmark } from 'lucide-react'

const tweets = [
  {
    id: 1,
    account: '@sofiaa_vip',
    handle: 'Sofia ✨',
    content: 'Nouvelle surprise ce soir pour les abonnés 🔥 Vous savez ce que vous avez à faire... 👀',
    likes: 1204,
    retweets: 89,
    replies: 143,
    views: 28400,
    status: 'posted',
    timeAgo: 'il y a 4 min',
    color: 'from-blue-500 to-cyan-500',
    verified: true,
  },
  {
    id: 2,
    account: '@luna_of',
    handle: 'Luna 💜',
    content: 'Thread : Comment j\'ai passé mes revenus de 2k à 12k/mois en 6 semaines 🧵',
    likes: 3401,
    retweets: 512,
    replies: 267,
    views: 94200,
    status: 'scheduled',
    timeAgo: '20h00',
    color: 'from-purple-500 to-violet-500',
    verified: false,
  },
  {
    id: 3,
    account: '@camille.x',
    handle: 'Camille 🌙',
    content: 'Drop exclusif dans 1h... les 50 premiers ont une réduction 👇',
    likes: 0,
    retweets: 0,
    replies: 0,
    views: 0,
    status: 'pending',
    timeAgo: 'Demain 12h',
    color: 'from-pink-500 to-rose-500',
    verified: false,
  },
]

const liveMetrics = [
  { label: 'Impressions', value: '142K', delta: '+8.2K', color: 'text-blue-400' },
  { label: 'Profil visits', value: '3 401', delta: '+234', color: 'text-cyan-400' },
  { label: 'Link clicks', value: '892', delta: '+47', color: 'text-green-400' },
]

export function DemoTwitter() {
  const [activeTweet, setActiveTweet] = useState(0)
  const [likesAnim, setLikesAnim] = useState(tweets[0].likes)
  const [viewsAnim, setViewsAnim] = useState(tweets[0].views)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTweet((prev) => (prev + 1) % tweets.length)
    }, 3800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLikesAnim((prev) => prev + Math.floor(Math.random() * 5 + 1))
      setViewsAnim((prev) => prev + Math.floor(Math.random() * 120 + 30))
      setTick((prev) => prev + 1)
    }, 900)
    return () => clearInterval(interval)
  }, [])

  const current = tweets[activeTweet]

  const formatNum = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="rounded-2xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-blue-900/30">
        {/* Window bar */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border-b border-blue-500/20 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-gray-300 text-xs font-medium">X / Twitter Auto-Posting</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Live metrics */}
          <div className="grid grid-cols-3 gap-3">
            {liveMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className={`text-lg font-bold text-white ${tick % 3 === i ? 'text-blue-300' : ''}`}>{m.value}</div>
                <div className={`text-[10px] ${m.color}`}>{m.delta} / 24h</div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Tweet preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3"
            >
              {/* Tweet header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{current.handle[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm font-bold">{current.handle}</span>
                      {current.verified && (
                        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81C14.67 2.88 13.43 2 12 2c-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81C9.33 21.12 10.57 22 12 22c1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91C21.12 14.67 22 13.43 22 12zm-6.41-4L10 13.59 7.91 11.5 6.5 12.91l3.5 3.5 7.09-7.09-1.5-1.32z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-gray-500 text-[11px]">{current.account} · {current.timeAgo}</p>
                  </div>
                </div>
                {/* Status badge */}
                <div className={`px-2 py-1 rounded-lg text-[10px] font-medium ${
                  current.status === 'posted'
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : current.status === 'scheduled'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-gray-500/20 border border-gray-500/40 text-gray-400'
                }`}>
                  {current.status === 'posted' ? '✓ Publié' : current.status === 'scheduled' ? `📅 ${current.timeAgo}` : `⏳ ${current.timeAgo}`}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-200 text-sm leading-relaxed">{current.content}</p>

              {/* Engagement */}
              <div className="flex items-center gap-5 pt-1 text-gray-500">
                <div className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                  <MessageSquare size={15} />
                  <span className="text-xs">{current.replies}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-green-400 cursor-pointer">
                  <Repeat2 size={15} />
                  <span className="text-xs">{current.retweets}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-pink-400 cursor-pointer">
                  <Heart size={15} className={current.status === 'posted' ? 'fill-pink-500 text-pink-500' : ''} />
                  <span className="text-xs">{current.status === 'posted' ? likesAnim.toLocaleString('fr-FR') : current.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <BarChart2 size={15} />
                  <span className="text-xs">{current.status === 'posted' ? formatNum(viewsAnim) : '—'}</span>
                </div>
                <Bookmark size={15} />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Queue indicator */}
          <div className="flex items-center gap-2">
            {tweets.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeTweet
                    ? 'flex-1 bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'w-6 bg-gray-700'
                }`}
              />
            ))}
            <span className="text-gray-500 text-xs ml-2">File: 28 tweets</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
