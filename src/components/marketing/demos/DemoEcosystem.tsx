'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Node {
  id: string
  label: string
  icon: string
  angle: number
  x: number
  y: number
}

const nodes: Node[] = [
  { id: 'posting', label: 'Auto-Posting', icon: '📤', angle: 0, x: 0, y: 0 },
  { id: 'chatting', label: 'Chatting IA', icon: '💬', angle: 60, x: 0, y: 0 },
  { id: 'generation', label: 'Génération IA', icon: '✨', angle: 120, x: 0, y: 0 },
  { id: 'spoof', label: 'Édition & Spoof', icon: '🎬', angle: 180, x: 0, y: 0 },
  { id: 'prospection', label: 'Prospection', icon: '🎯', angle: 240, x: 0, y: 0 },
  { id: 'veille', label: 'Veille Trends', icon: '📈', angle: 300, x: 0, y: 0 },
]

// Calculate positions
nodes.forEach((node) => {
  const radius = 120
  const rad = (node.angle * Math.PI) / 180
  node.x = radius * Math.cos(rad)
  node.y = radius * Math.sin(rad)
})

export function DemoEcosystem() {
  const [totalMessages, setTotalMessages] = useState(127000)
  const [totalPosts, setTotalPosts] = useState(4200)
  const [uptime, setUptime] = useState(98)
  const [dataFlow, setDataFlow] = useState(0)

  useEffect(() => {
    const sequence = () => {
      setTotalMessages(127000)
      setTotalPosts(4200)
      setUptime(98)
      setDataFlow(0)

      // Animate data flow
      const flowInterval = setInterval(() => {
        setDataFlow((prev) => (prev + 2) % 100)
      }, 50)

      // Increment counters
      const msgInterval = setInterval(() => {
        setTotalMessages((prev) => prev + Math.floor(Math.random() * 100))
      }, 2000)

      const postsInterval = setInterval(() => {
        setTotalPosts((prev) => prev + Math.floor(Math.random() * 20))
      }, 2500)

      return () => {
        clearInterval(flowInterval)
        clearInterval(msgInterval)
        clearInterval(postsInterval)
      }
    }

    const cleanup = sequence()
    return () => cleanup()
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
            <span className="text-gray-400 text-xs font-medium ml-auto">Écosystème OmniFlow</span>
          </div>

          {/* Content */}
          <div className="p-12 min-h-[600px] flex flex-col items-center justify-center">
            {/* SVG Canvas for connections */}
            <svg
              width="400"
              height="400"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ opacity: 0.3 }}
            >
              {/* Center to nodes connections */}
              {nodes.map((node) => (
                <motion.line
                  key={`line-${node.id}`}
                  x1="200"
                  y1="200"
                  x2={200 + node.x}
                  y2={200 + node.y}
                  stroke="url(#gradientLine)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -10 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              ))}

              {/* Animated flow particles */}
              {[...Array(6)].map((_, idx) => (
                <motion.circle
                  key={`particle-${idx}`}
                  cx="200"
                  cy="200"
                  r="4"
                  fill="#a78bfa"
                  initial={{ cx: 200, cy: 200, opacity: 0 }}
                  animate={{
                    cx: 200 + nodes[idx].x * (dataFlow / 100),
                    cy: 200 + nodes[idx].y * (dataFlow / 100),
                    opacity: dataFlow > 50 ? 0 : 1,
                  }}
                  transition={{ duration: 0.05 }}
                />
              ))}

              <defs>
                <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center hexagon - OmniFlow */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                filter: ['drop-shadow(0 0 10px rgba(167, 139, 250, 0.3))', 'drop-shadow(0 0 20px rgba(167, 139, 250, 0.6))', 'drop-shadow(0 0 10px rgba(167, 139, 250, 0.3))'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <div className="w-24 h-24 rounded-lg border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm shadow-lg"
                   style={{ boxShadow: '0 0 30px rgba(167, 139, 250, 0.4)' }}>
                <div className="text-center">
                  <div className="text-4xl mb-1">⚙️</div>
                  <p className="text-xs font-bold text-purple-300">OmniFlow</p>
                </div>
              </div>
            </motion.div>

            {/* Peripheral nodes */}
            {nodes.map((node, idx) => (
              <motion.div
                key={node.id}
                className="absolute z-20"
                animate={{
                  x: node.x,
                  y: node.y,
                }}
                transition={{ duration: 0.05 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: (idx * 2) / nodes.length,
                  }}
                  className="w-20 h-20 rounded-lg border border-purple-500/30 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/60 hover:bg-slate-900/95 transition-all shadow-lg"
                  style={{
                    boxShadow: `0 0 15px rgba(139, 92, 246, 0.15)`,
                  }}
                >
                  <div className="text-3xl mb-1">{node.icon}</div>
                  <p className="text-xs font-semibold text-gray-200 text-center px-1 leading-tight">
                    {node.label.split(' ')[0]}
                  </p>
                </motion.div>
              </motion.div>
            ))}

            {/* Stats container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-40 w-full"
            >
              <div className="border-t border-purple-500/20 pt-8 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Messages envoyés</p>
                  <motion.p
                    key={totalMessages}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-cyan-400"
                  >
                    {totalMessages.toLocaleString()}
                  </motion.p>
                </div>

                <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Posts publiés</p>
                  <motion.p
                    key={totalPosts}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-green-400"
                  >
                    {totalPosts.toLocaleString()}
                  </motion.p>
                </div>

                <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur text-center">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Uptime</p>
                  <motion.p
                    key={uptime}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-pink-400"
                  >
                    {uptime}%
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
