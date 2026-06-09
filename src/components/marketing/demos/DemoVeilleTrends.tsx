'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

interface Trend {
  id: number
  icon: string
  title: string
  views: number
  engagement: number
  badge: 'viral' | 'hausse' | 'explosif'
  relevance: number
}

const initialTrends: Trend[] = [
  { id: 1, icon: '🔥', title: 'Trend "Confidence Challenge"', views: 2400, engagement: 94, badge: 'viral', relevance: 92 },
  { id: 2, icon: '💃', title: 'Dance Transition Routine', views: 1800, engagement: 87, badge: 'hausse', relevance: 85 },
  { id: 3, icon: '🎵', title: 'Audio "Shut up" Remix', views: 3200, engagement: 91, badge: 'explosif', relevance: 88 },
]

const formatSuggestions = [
  'Format vertical (9:16) pour TikTok',
  'Transition rapide < 3 secondes',
  'Utiliser l\'audio trending #1',
  'Appel-à-action fort en fin',
]

export function DemoVeilleTrends() {
  const [displayedTrends, setDisplayedTrends] = useState<Trend[]>([])
  const [isScraping, setIsScraping] = useState(false)
  const [scrapingText, setScrapingText] = useState('')
  const [analyzedVideos, setAnalyzedVideos] = useState(847)
  const [detectedTrends, setDetectedTrends] = useState(12)
  const [selectedTrendSuggestions, setSelectedTrendSuggestions] = useState<string[]>([])

  const scrapingMessages = [
    'Scraping en cours...',
    'Analysant TikTok trends...',
    'Scanning Instagram Reels...',
    'YouTube Shorts en cours...',
  ]

  useEffect(() => {
    let messageIdx = 0
    let trendIdx = 0

    const sequence = () => {
      setIsScraping(true)
      setScrapingText('')
      setDisplayedTrends([])
      setSelectedTrendSuggestions([])
      setAnalyzedVideos(847)
      setDetectedTrends(12)

      // Rotating messages
      const messageInterval = setInterval(() => {
        setScrapingText(scrapingMessages[messageIdx % scrapingMessages.length])
        messageIdx++
      }, 800)

      // Display trends one by one
      const trendInterval = setInterval(() => {
        if (trendIdx < initialTrends.length) {
          setDisplayedTrends((prev) => [...prev, initialTrends[trendIdx]])
          setDetectedTrends((prev) => prev + 1)
          trendIdx++
        } else {
          clearInterval(trendInterval)
        }
      }, 600)

      // Complete scraping
      setTimeout(() => {
        setIsScraping(false)
        setScrapingText('')
        clearInterval(messageInterval)
      }, 2500)

      // Select trend and show suggestions
      setTimeout(() => {
        setSelectedTrendSuggestions(formatSuggestions)
      }, 3000)

      // Increment analyzed videos
      const videoInterval = setInterval(() => {
        setAnalyzedVideos((prev) => prev + Math.floor(Math.random() * 50))
      }, 1000)

      setTimeout(() => clearInterval(videoInterval), 4500)

      // Reset
      setTimeout(() => {
        setDisplayedTrends([])
        setSelectedTrendSuggestions([])
      }, 7000)
    }

    sequence()
    const interval = setInterval(sequence, 9000)
    return () => clearInterval(interval)
  }, [])

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'viral':
        return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', label: '🔥 Viral' }
      case 'hausse':
        return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', label: '📈 En hausse' }
      case 'explosif':
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', label: '⚡ Explosif' }
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', label: 'Normal' }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full perspective"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{ rotateX: -5, rotateY: 5 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0a0a10] shadow-2xl"
             style={{ boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
          {/* Mac window bar */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-xs font-medium ml-auto">Veille Trends</span>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 min-h-[500px] flex flex-col">
            {/* Scraping status */}
            {isScraping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-center gap-3 p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full"
                />
                <span className="text-cyan-300 text-sm font-semibold">{scrapingText}</span>
              </motion.div>
            )}

            {/* Trends grid */}
            <div className="grid grid-cols-3 gap-4">
              {displayedTrends.map((trend, idx) => {
                const badgeStyle = getBadgeStyle(trend.badge)
                return (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="p-4 rounded-xl border border-purple-500/20 bg-slate-900/50 backdrop-blur hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">{trend.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-white truncate">{trend.title}</p>
                      </div>

                      {/* Badge */}
                      <motion.div
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${badgeStyle.border} ${badgeStyle.bg} ${badgeStyle.text}`}
                      >
                        {badgeStyle.label}
                      </motion.div>

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Engagement</span>
                            <span className="text-xs font-semibold text-cyan-400">{trend.engagement}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: `${trend.engagement}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.15 + 0.2 }}
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <TrendingUp size={14} />
                          <span>{trend.views}K vues</span>
                        </div>

                        {/* Pertinence */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Pertinence</span>
                            <span className="text-xs font-semibold text-green-400">{trend.relevance}%</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: `${trend.relevance}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.15 + 0.3 }}
                              className="h-full bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Suggestions section */}
            {selectedTrendSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-purple-500/20 pt-6"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Suggestions de formats</p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedTrendSuggestions.map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-lg bg-slate-900/50 border border-purple-500/20 text-sm text-gray-200 flex items-start gap-2"
                    >
                      <span className="text-purple-400 font-bold flex-shrink-0 mt-0.5">→</span>
                      <span>{suggestion}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stats footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-auto border-t border-purple-500/20 pt-6 grid grid-cols-2 gap-4"
            >
              <div>
                <p className="text-xs text-gray-400 mb-2">Vidéos analysées</p>
                <motion.p
                  key={analyzedVideos}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-cyan-400"
                >
                  {analyzedVideos}
                </motion.p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Trends détectés</p>
                <motion.p
                  key={detectedTrends}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-400"
                >
                  {detectedTrends}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
