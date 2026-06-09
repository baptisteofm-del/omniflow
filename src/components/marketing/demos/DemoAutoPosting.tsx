'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Camera, Check } from 'lucide-react'

const typewriterText = "Contenu premium exclusive pour ce week-end. Code promo WEEKEND20 ✨"

export function DemoAutoPosting() {
  const [displayedText, setDisplayedText] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [postPublished, setPostPublished] = useState(false)
  const [monthlyPosts, setMonthlyPosts] = useState(47)
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % typewriterText.length)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setDisplayedText(typewriterText.substring(0, textIndex))
  }, [textIndex])

  useEffect(() => {
    const platformSequence = () => {
      setSelectedPlatforms([])
      setPostPublished(false)
      
      setTimeout(() => setSelectedPlatforms(['instagram']), 500)
      setTimeout(() => setSelectedPlatforms(['instagram', 'twitter']), 1000)
      setTimeout(() => {
        setPostPublished(true)
        setMonthlyPosts((prev) => prev + 1)
      }, 2500)
      setTimeout(() => {
        setDisplayedText('')
        setTextIndex(0)
      }, 4000)
    }

    const timer = setInterval(platformSequence, 6000)
    return () => clearInterval(timer)
  }, [])

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
            <span className="text-gray-400 text-xs font-medium ml-auto">Auto-Posting</span>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 min-h-[500px] flex flex-col">
            {/* Text input with typewriter effect */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase">Message</label>
              <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur min-h-20">
                <p className="text-gray-200 font-mono text-sm leading-relaxed">
                  {displayedText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-1 h-4 bg-purple-500 ml-1"
                  />
                </p>
              </div>
            </div>

            {/* Platform selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase">Plateformes</label>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setSelectedPlatforms(prev => 
                    prev.includes('instagram') ? prev.filter(p => p !== 'instagram') : [...prev, 'instagram']
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    selectedPlatforms.includes('instagram')
                      ? 'border-pink-500/50 bg-pink-500/10'
                      : 'border-gray-600/30 bg-gray-900/30'
                  }`}
                >
                  <span className="text-lg">📸</span>
                  <span className={selectedPlatforms.includes('instagram') ? 'text-pink-300' : 'text-gray-400'}>
                    Instagram
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => setSelectedPlatforms(prev => 
                    prev.includes('twitter') ? prev.filter(p => p !== 'twitter') : [...prev, 'twitter']
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    selectedPlatforms.includes('twitter')
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-gray-600/30 bg-gray-900/30'
                  }`}
                >
                  <span className="text-lg">𝕏</span>
                  <span className={selectedPlatforms.includes('twitter') ? 'text-blue-300' : 'text-gray-400'}>
                    X/Twitter
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Publish button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                postPublished
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-purple-300 hover:from-purple-500/40 hover:to-cyan-500/40'
              }`}
            >
              {postPublished ? (
                <div className="flex items-center justify-center gap-2">
                  <Check size={20} />
                  Publié ✓
                </div>
              ) : (
                'Publier sur les plateformes'
              )}
            </motion.button>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-auto pt-6 border-t border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-400">Posts publiés ce mois</span>
                </div>
                <span className="text-2xl font-bold text-white">{monthlyPosts}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
