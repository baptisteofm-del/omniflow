'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

const generatedVideos = [
  { id: 1, duration: '5s', ratio: '9:16' },
  { id: 2, duration: '5s', ratio: '9:16' },
  { id: 3, duration: '5s', ratio: '9:16' },
]

export function DemoKling() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true)
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 20 + 5
      })
    }, 400)

    return () => clearInterval(interval)
  }, [isAnimating])

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setProgress(0)
      setIsComplete(false)
      setIsAnimating(true)
    }, 6000)

    return () => clearTimeout(resetTimer)
  }, [isComplete])

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
          <span className="text-gray-400 text-xs font-medium ml-auto">✨ OmniFlow — Génération IA</span>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Kling v2 Génération</h3>
            <p className="text-gray-400 text-xs">Prompt: "Carla at a luxury rooftop, sunset..."</p>
          </div>

          {/* Settings */}
          <div className="flex gap-3 text-xs text-gray-300">
            <div className="px-3 py-1 rounded-lg bg-gray-700/30 border border-gray-600/30">Modèle: Kling v2</div>
            <div className="px-3 py-1 rounded-lg bg-gray-700/30 border border-gray-600/30">Format: 9:16</div>
            <div className="px-3 py-1 rounded-lg bg-gray-700/30 border border-gray-600/30">Durée: 5s</div>
          </div>

          {/* Generation progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white text-sm">
                {isComplete ? 'Génération complète ✓' : `Finalisation... ${Math.min(Math.round(progress), 100)}%`}
              </div>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Generated videos grid */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 mt-8"
            >
              {generatedVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative"
                >
                  {/* Video thumbnail */}
                  <div className="aspect-[9/16] rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/40 to-cyan-500/40 border border-purple-500/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">▶️</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-2 text-center">
                    <div className="text-white text-xs font-semibold">✓ Prête</div>
                    <div className="text-gray-400 text-xs">5s</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cost info */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mt-6"
            >
              <div className="text-green-400 text-sm font-semibold">💰 Coût: 0.03€ par vidéo</div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
