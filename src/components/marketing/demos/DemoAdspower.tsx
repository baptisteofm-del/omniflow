'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

const tweetText = "can't stop thinking about last night... 🌛 you know what I mean 😘 link in bio for more"

export function DemoAdspower() {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isPosted, setIsPosted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // Typewriter effect
  useEffect(() => {
    if (!isAnimating) return

    let index = 0
    const interval = setInterval(() => {
      if (index <= tweetText.length) {
        setDisplayedText(tweetText.substring(0, index))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isAnimating])

  // Auto post after text is complete
  useEffect(() => {
    if (isComplete && !isPosted) {
      const timer = setTimeout(() => {
        setIsPosted(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, isPosted])

  // Reset animation
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setDisplayedText('')
      setIsComplete(false)
      setIsPosted(false)
      setIsAnimating(true)
    }, 6000)

    return () => clearTimeout(resetTimer)
  }, [isPosted])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 w-full"
    >
      {/* Browser window */}
      <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 ml-4">
            <div className="bg-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 font-mono">
              local.adspower.net — Profil: @leelou_of
            </div>
          </div>
        </div>

        {/* Twitter interface */}
        <div className="bg-black p-8 min-h-96 flex flex-col gap-4">
          {/* Tweet composer header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />
            <div>
              <div className="font-bold text-white">Carla</div>
              <div className="text-gray-500 text-sm">@carla.of</div>
            </div>
          </div>

          {/* Tweet text box */}
          <div className="flex-1 pt-4">
            <div className="text-white text-xl leading-normal min-h-24 font-normal">
              {displayedText}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-1 h-6 ml-1 bg-cyan-500"
                />
              )}
            </div>
          </div>

          {/* Tweet footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex gap-4 text-cyan-500 text-sm">
              <span>🎨</span>
              <span>😊</span>
              <span>📅</span>
            </div>

            {/* Post button */}
            <motion.button
              animate={
                isComplete && !isPosted
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 0.6, repeat: Infinity }}
              disabled={!isComplete}
              className={`px-6 py-2 rounded-full font-bold text-white transition-all ${
                isComplete && !isPosted
                  ? 'bg-cyan-500 hover:bg-cyan-600 cursor-pointer'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {isPosted ? 'Posté ✓' : 'Post'}
            </motion.button>
          </div>

          {/* Posted notification */}
          {isPosted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm font-semibold"
            >
              <Check size={16} />
              Tweet publié ✓
            </motion.div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">
          Postez sur X/Twitter sans limites
        </h3>
        <p className="text-gray-400 text-sm">AdsPower — 100 profils gérés, zéro ban</p>
      </div>
    </motion.div>
  )
}
