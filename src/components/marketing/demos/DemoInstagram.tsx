'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'

const reels = [
  {
    id: 1,
    account: '@sofia_officiel',
    caption: '🌴 Bali vibes only... ✨',
    likes: 4821,
    comments: 312,
    shares: 87,
    status: 'posted',
    timeAgo: '2 min',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 2,
    account: '@luna.premium',
    caption: '💫 Nouvelle collection déjà dispo...',
    likes: 3104,
    comments: 198,
    shares: 54,
    status: 'posting',
    timeAgo: 'En cours',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 3,
    account: '@camille.vip',
    caption: '🔥 Behind the scenes...',
    likes: 0,
    comments: 0,
    shares: 0,
    status: 'scheduled',
    timeAgo: '18h30',
    color: 'from-cyan-500 to-blue-600',
  },
]

export function DemoInstagram() {
  const [activeReel, setActiveReel] = useState(0)
  const [likesAnim, setLikesAnim] = useState(reels[0].likes)
  const [postingProgress, setPostingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReel((prev) => (prev + 1) % reels.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLikesAnim((prev) => prev + Math.floor(Math.random() * 8 + 1))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPostingProgress((prev) => (prev >= 100 ? 0 : prev + 4))
    }, 120)
    return () => clearInterval(interval)
  }, [])

  const current = reels[activeReel]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="rounded-2xl overflow-hidden border border-pink-500/30 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-pink-900/30">
        {/* Window bar */}
        <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-b border-pink-500/20 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-gray-300 text-xs font-medium">Instagram Auto-Posting</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Header stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
              <div className="text-xl font-bold text-white">47</div>
              <div className="text-xs text-pink-400">Profils actifs</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="text-xl font-bold text-white">12</div>
              <div className="text-xs text-purple-400">Posts aujourd'hui</div>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-xl font-bold text-white">+38%</div>
              <div className="text-xs text-green-400">Reach moyen</div>
            </div>
          </div>

          {/* Live Reel preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-black/30 overflow-hidden"
            >
              {/* IG post header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{current.account[1].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{current.account}</p>
                    <p className="text-gray-500 text-[10px]">{current.timeAgo}</p>
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-gray-500" />
              </div>

              {/* Reel thumbnail */}
              <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-20`} />
                <div className="relative text-center">
                  <div className="text-4xl mb-1">🎬</div>
                  <div className="text-white text-xs font-medium">Reel</div>
                </div>
                {/* Status overlay */}
                {current.status === 'posting' && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${postingProgress}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      />
                    </div>
                    <p className="text-xs text-pink-400 mt-1 text-center">Upload en cours... {postingProgress}%</p>
                  </div>
                )}
                {current.status === 'scheduled' && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40">
                    <span className="text-amber-400 text-[10px] font-medium">📅 {current.timeAgo}</span>
                  </div>
                )}
                {current.status === 'posted' && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40">
                    <span className="text-green-400 text-[10px] font-medium">✓ Publié</span>
                  </div>
                )}
              </div>

              {/* IG actions */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Heart size={16} className={current.status === 'posted' ? 'fill-pink-500 text-pink-500' : ''} />
                    <span className="text-xs">{current.status === 'posted' ? likesAnim.toLocaleString('fr-FR') : current.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MessageCircle size={16} />
                    <span className="text-xs">{current.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Send size={16} />
                    <span className="text-xs">{current.shares}</span>
                  </div>
                  <Bookmark size={16} className="text-gray-400 ml-auto" />
                </div>
                <p className="text-gray-300 text-xs">{current.caption}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Queue indicator */}
          <div className="flex items-center gap-2">
            {reels.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeReel
                    ? 'flex-1 bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'w-6 bg-gray-700'
                }`}
              />
            ))}
            <span className="text-gray-500 text-xs ml-2">File: 34 posts</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
