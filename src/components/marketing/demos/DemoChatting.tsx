'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function DemoChatting() {
  const [displayText, setDisplayText] = useState('')
  const [showOpportunity, setShowOpportunity] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  const aiResponse = "Toujours pour toi babe 😈\nj'ai quelque chose de special ce soir...\ntu veux voir ? 👀"

  useEffect(() => {
    if (!isAnimating || displayText.length >= aiResponse.length) {
      setShowOpportunity(displayText.length >= aiResponse.length)
      return
    }

    const timeout = setTimeout(() => {
      setDisplayText((prev) => prev + aiResponse[prev.length])
    }, 20)

    return () => clearTimeout(timeout)
  }, [displayText, isAnimating, aiResponse])

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setDisplayText('')
      setShowOpportunity(false)
      setIsAnimating(true)
    }, 8000)

    return () => clearTimeout(resetTimer)
  }, [showOpportunity])

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
          <span className="text-gray-400 text-xs font-medium ml-auto">Chatting IA</span>
        </div>

        {/* Chat content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700/50 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Carla (@carla_of)</h3>
              <p className="text-xs text-gray-400">Active 2 min ago</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
          </div>

          {/* Messages */}
          <div className="space-y-4 min-h-32">
            {/* Fan message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50">
                <p className="text-gray-200 text-sm">hey t'es dispo ce soir ? 🔥</p>
              </div>
            </motion.div>

            {/* AI generating indicator */}
            {displayText.length < aiResponse.length && !showOpportunity && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end items-center gap-2"
              >
                <span className="text-xs text-cyan-400 font-medium">IA genere...</span>
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: 0.1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: 0.2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                  />
                </div>
              </motion.div>
            )}

            {/* AI response */}
            {displayText.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-xs px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50">
                  <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{displayText}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Opportunity detection */}
          {showOpportunity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3"
            >
              <div className="flex items-start gap-2">
                <div className="text-lg flex-shrink-0 mt-0.5">⚠️</div>
                <div>
                  <p className="text-amber-400 font-semibold text-sm">Opportunite PPV detectable - fan chaud 🔥</p>
                  <p className="text-amber-300/70 text-xs mt-1">Cet utilisateur est tres engage. Suggerer du contenu premium (15€)?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-semibold hover:bg-amber-500/40 transition-colors">
                  [Oui]
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg bg-gray-600/30 border border-gray-500/50 text-gray-300 text-xs font-semibold hover:bg-gray-600/40 transition-colors">
                  [Non]
                </button>
              </div>
            </motion.div>
          )}

          {/* Action buttons */}
          {showOpportunity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 pt-2 border-t border-gray-700/50"
            >
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-semibold hover:bg-green-500/30 transition-colors text-sm">
                ✓ Envoyer
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600/50 text-gray-300 font-semibold hover:bg-gray-700/40 transition-colors text-sm">
                Modifier
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
