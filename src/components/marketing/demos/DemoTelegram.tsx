'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const messages = [
  {
    id: 1,
    text: '🔥 Contenu exclusif VIP mis à jour',
    time: '14:23',
  },
  {
    id: 2,
    text: '💎 Rejoins la communauté premium pour plus de contenu',
    time: '14:25',
  },
  {
    id: 3,
    text: '✨ Nouveau set photo disponible',
    time: '14:27',
  },
]

export function DemoTelegram() {
  const [displayedMessages, setDisplayedMessages] = useState<typeof messages>([])
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    let messageIndex = 0
    const interval = setInterval(() => {
      if (messageIndex < messages.length) {
        setDisplayedMessages((prev) => [...prev, messages[messageIndex]])
        messageIndex++
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isAnimating])

  // Reset animation
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setDisplayedMessages([])
      setIsAnimating(true)
    }, 8000)

    return () => clearTimeout(resetTimer)
  }, [displayedMessages.length])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8 w-full"
    >
      {/* Telegram channel interface */}
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-blue-900 to-blue-950 shadow-2xl overflow-hidden border border-blue-700/50">
        {/* Header */}
        <div className="bg-blue-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-blue-900">
              L
            </div>
            <div>
              <div className="font-bold text-white text-sm">🔥 Leelou OF VIP</div>
              <div className="text-blue-300 text-xs">3 247 members</div>
            </div>
          </div>
          <div className="text-white text-lg">⋮</div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 min-h-80 max-h-80 overflow-y-auto flex flex-col justify-end">
          {displayedMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-2"
            >
              {/* Avatar */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0 mt-1" />

              {/* Message bubble */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-200">Omniflow Bot</span>
                  <span className="text-xs text-blue-400/60">Bot</span>
                  <span className="text-xs text-blue-400/50 ml-auto">{msg.time}</span>
                </div>
                <div className="bg-blue-700/50 rounded-lg px-3 py-2 text-white text-sm leading-relaxed break-words max-w-xs">
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Cursor blinking when waiting for next message */}
          {displayedMessages.length < messages.length && (
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-blue-400/60 text-sm"
            >
              ● ● ●
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="bg-blue-800/60 px-4 py-3 flex items-center gap-2 border-t border-blue-700/30">
          <div className="flex-1 bg-blue-700/40 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="text-blue-400 text-lg">😊</span>
            <input
              type="text"
              placeholder="Type message..."
              disabled
              className="bg-transparent text-blue-300 text-sm placeholder-blue-500/50 outline-none flex-1"
            />
          </div>
          <div className="text-blue-400">📎</div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">
          Vos canaux Telegram actifs 24h/24 sans intervention
        </h3>
        <p className="text-gray-400 text-sm">Bots Telegram — Automatisation complète</p>
      </div>
    </motion.div>
  )
}
