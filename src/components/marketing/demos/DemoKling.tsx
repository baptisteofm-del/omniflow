'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check, Sparkles } from 'lucide-react'

const generatedVideos = [
  { id: 1, duration: '5s', ratio: '9:16' },
  { id: 2, duration: '5s', ratio: '9:16' },
  { id: 3, duration: '5s', ratio: '9:16' },
]

export function DemoKling() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // Progress bar animation
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

  // Reset animation
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
      className="flex flex-col items-center gap-8 w-full"
    >
      {/* Generator interface */}
      <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-4 flex items-center gap-3">
          <Sparkles size={20} className="text-white" />
          <div>
            <div className="font-bold text-white">Kling v1.5</div>
            <div className="text-cyan-100 text-xs">AI Video Generator</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium">Prompt</label>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-white text-sm leading-relaxed">
                Glamorous woman at a luxury penthouse rooftop, golden hour, cinematic lighting, 4K quality, professional photography
              </p>
            </div>
          </div>

          {/* Generation progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white text-sm">
                {isComplete ? 'Génération complète' : 'Génération en cours...'}
              </div>
              <div className="text-cyan-400 font-mono text-sm">
                {Math.min(Math.round(progress), 100)}%
              </div>
            </div>
            <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
              />
            </div>
          </div>

          {/* Status message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-400 text-sm font-semibold"
            >
              <Check size={16} />
              3 vidéos prêtes à poster
            </motion.div>
          )}

          {/* Generated videos grid */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 mt-6"
            >
              {generatedVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group"
                >
                  {/* Video thumbnail */}
                  <div className="aspect-[9/16] rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                      <div className="text-2xl mb-2">▶️</div>
                      <div className="text-white text-xs font-semibold opacity-80">Video</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                    <div className="text-white text-xs font-semibold flex items-center gap-2">
                      <span>{video.ratio}</span>
                      <span>•</span>
                      <span>{video.duration}</span>
                      <Check size={12} className="ml-auto text-green-400" />
                    </div>
                  </div>

                  {/* Ready badge */}
                  <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Prête
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">
          Des Reels IA prêts à poster en 3 minutes
        </h3>
        <p className="text-gray-400 text-sm">Kling — Génération vidéo IA ultra-rapide</p>
      </div>
    </motion.div>
  )
}
