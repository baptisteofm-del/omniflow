'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface Profile {
  name: string
  platform: string
  status: 'posted' | 'scheduled' | 'pending'
  views?: number
  schedule?: string
}

const profiles: Profile[] = [
  { name: '@carla', platform: 'Instagram', status: 'posted', views: 1200 },
  { name: '@carla', platform: 'TikTok', status: 'scheduled', schedule: '14h30' },
  { name: '@carla', platform: 'Telegram', status: 'scheduled', schedule: '16h00' },
]

export function DemoPosting() {
  const [timeLeft, setTimeLeft] = useState(9034) // 2h 30m 34s in seconds
  const [postsToday, setPostsToday] = useState(80)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 9034))
      setPostsToday((prev) => (prev >= 100 ? 80 : prev))
    }, 1000)

    return () => clearInterval(interval)
  }, [isAnimating])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', label: '🟢 Posté' }
      case 'scheduled':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: '⏳ Programmé' }
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', label: '⏸ Pause' }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Window container */}
      <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-2xl shadow-purple-900/50">
        {/* Window bar */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-xs font-medium ml-auto">📅 OmniFlow — Posting Automatique</span>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Scheduling Dashboard</h3>
            <p className="text-gray-400 text-sm">Gérez 100 profils sur AdsPower, GeeLark et bien d'autres</p>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-3 gap-4">
            {profiles.map((profile, idx) => {
              const badge = getStatusBadge(profile.status)
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border ${badge.border} ${badge.bg} backdrop-blur`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{profile.name}</p>
                      <p className="text-xs text-gray-400">{profile.platform}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${badge.text} mb-2`}>{badge.label}</div>
                  {profile.status === 'posted' && (
                    <div className="text-xs text-gray-300">+{profile.views}K 👁</div>
                  )}
                  {profile.status === 'scheduled' && (
                    <div className="text-xs text-gray-300">{profile.platform === 'TikTok' ? 'Reel #47' : 'VIP Chan'}</div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {/* Next post countdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">Prochain post</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{formatTime(timeLeft)} ⏱</div>
            </motion.div>

            {/* Active platforms */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}\n              className=\"p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur\"\n            >\n              <div className=\"text-xs font-semibold text-purple-400 mb-2\">Profils actifs</div>\n              <div className=\"space-y-1\">\n                <div className=\"text-sm text-white\">AdsPower <span className=\"text-purple-300 font-mono\">(47)</span></div>\n                <div className=\"text-sm text-white\">GeeLark <span className=\"text-purple-300 font-mono\">(23)</span></div>\n              </div>\n            </motion.div>\n\n            {/* Daily posts */}\n            <motion.div\n              initial={{ opacity: 0, y: 10 }}\n              animate={{ opacity: 1, y: 0 }}\n              transition={{ delay: 0.5 }}\n              className=\"p-4 rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur\"\n            >\n              <div className=\"text-xs font-semibold text-green-400 mb-2\">Posts aujourd'hui</div>\n              <div className=\"flex items-center gap-2\">\n                <div className=\"text-2xl font-bold text-white\">{Math.floor(postsToday / 10)}/10</div>\n                <div className=\"flex-1 h-2 bg-gray-700 rounded-full overflow-hidden\">\n                  <motion.div\n                    initial={{ width: '0%' }}\n                    animate={{ width: `${Math.floor(postsToday / 10) * 10}%` }}\n                    className=\"h-full bg-gradient-to-r from-green-500 to-cyan-500\"\n                  />\n                </div>\n              </div>\n            </motion.div>\n          </div>\n        </div>\n      </div>\n    </motion.div>\n  )\n}\n