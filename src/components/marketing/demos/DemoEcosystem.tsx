'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const nodes = [
  { id: 'ai', label: 'IA Core', icon: '🧠', x: 50, y: 50, color: 'from-purple-500 to-cyan-500', size: 'large' },
  { id: 'posting', label: 'Auto-Posting', icon: '📤', x: 15, y: 15, color: 'from-blue-500 to-cyan-500', size: 'medium' },
  { id: 'chatting', label: 'Chatting IA', icon: '💬', x: 85, y: 15, color: 'from-pink-500 to-rose-500', size: 'medium' },
  { id: 'generation', label: 'Génération', icon: '✨', x: 85, y: 85, color: 'from-amber-500 to-orange-500', size: 'medium' },
  { id: 'spoof', label: 'Édition', icon: '🎬', x: 15, y: 85, color: 'from-green-500 to-emerald-500', size: 'medium' },
  { id: 'prospection', label: 'Prospection', icon: '🎯', x: 15, y: 50, color: 'from-violet-500 to-purple-500', size: 'small' },
  { id: 'trends', label: 'Trends', icon: '📈', x: 85, y: 50, color: 'from-cyan-500 to-teal-500', size: 'small' },
]

const connections = [
  { from: 'ai', to: 'posting' }, { from: 'ai', to: 'chatting' },
  { from: 'ai', to: 'generation' }, { from: 'ai', to: 'spoof' },
  { from: 'ai', to: 'prospection' }, { from: 'ai', to: 'trends' },
  { from: 'trends', to: 'generation' }, { from: 'generation', to: 'spoof' },
  { from: 'spoof', to: 'posting' }, { from: 'prospection', to: 'chatting' },
]

const metrics = [
  { label: 'Revenus générés', value: '+€12,400', delta: '+28%', color: 'text-green-400' },
  { label: 'Temps économisé', value: '47h/sem', delta: '-82%', color: 'text-cyan-400' },
  { label: 'Taux conversion', value: '18.4%', delta: '+156%', color: 'text-pink-400' },
  { label: 'Fans engagés', value: '4,200', delta: '+340%', color: 'text-amber-400' },
]

const pulses = [
  { from: 'ai', to: 'chatting', delay: 0 },
  { from: 'ai', to: 'posting', delay: 0.5 },
  { from: 'trends', to: 'generation', delay: 1 },
  { from: 'ai', to: 'generation', delay: 1.5 },
  { from: 'prospection', to: 'chatting', delay: 2 },
  { from: 'generation', to: 'spoof', delay: 2.5 },
  { from: 'spoof', to: 'posting', delay: 3 },
]

export function DemoEcosystem() {
  const [activeConnections, setActiveConnections] = useState<string[]>([])
  const [activeNodes, setActiveNodes] = useState<string[]>(['ai'])
  const [metricIdx, setMetricIdx] = useState(0)

  useEffect(() => {
    const allConnIds = connections.map(c => `${c.from}-${c.to}`)
    const allNodeIds = nodes.map(n => n.id)

    let step = 0
    const interval = setInterval(() => {
      step = (step + 1) % (allConnIds.length + 3)

      if (step === 0) {
        setActiveConnections([])
        setActiveNodes(['ai'])
      } else if (step <= allConnIds.length) {
        setActiveConnections(prev => {
          if (prev.includes(allConnIds[step - 1])) return prev
          return [...prev, allConnIds[step - 1]]
        })
        const conn = connections[step - 1]
        setActiveNodes(prev => {
          const newNodes = [...prev]
          if (!newNodes.includes(conn.from)) newNodes.push(conn.from)
          if (!newNodes.includes(conn.to)) newNodes.push(conn.to)
          return newNodes
        })
      } else {
        setActiveConnections(allConnIds)
        setActiveNodes(allNodeIds)
      }
    }, 300)

    const metricInterval = setInterval(() => {
      setMetricIdx(i => (i + 1) % metrics.length)
    }, 2000)

    return () => { clearInterval(interval); clearInterval(metricInterval) }
  }, [])

  const getNodePos = (id: string) => nodes.find(n => n.id === id)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ perspective: '1200px' }}>
      <motion.div animate={{ rotateX: [-3, -6, -3], rotateY: [3, 6, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#080810]"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.2)' }}>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-400 bg-slate-800/80 px-4 py-1 rounded-full border border-gray-700/50">
                OmniFlow — Écosystème complet
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>

          <div className="flex h-[460px]">
            {/* Network graph */}
            <div className="flex-1 relative p-4">
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                {connections.map((conn, i) => {
                  const from = getNodePos(conn.from)
                  const to = getNodePos(conn.to)
                  if (!from || !to) return null
                  const isActive = activeConnections.includes(`${conn.from}-${conn.to}`)
                  return (
                    <motion.line key={i}
                      x1={`${from.x}%`} y1={`${from.y}%`}
                      x2={`${to.x}%`} y2={`${to.y}%`}
                      stroke={isActive ? 'rgba(139,92,246,0.5)' : 'rgba(75,85,99,0.15)'}
                      strokeWidth={isActive ? 1.5 : 1}
                      strokeDasharray={isActive ? '4 2' : '2 4'}
                    />
                  )
                })}

                {/* Animated pulses */}
                {pulses.map((pulse, i) => {
                  const from = getNodePos(pulse.from)
                  const to = getNodePos(pulse.to)
                  if (!from || !to) return null
                  return (
                    <motion.circle key={i} r="3" fill="rgba(139,92,246,0.8)"
                      animate={{
                        cx: [`${from.x}%`, `${to.x}%`],
                        cy: [`${from.y}%`, `${to.y}%`],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: pulse.delay,
                        ease: 'easeInOut',
                        repeatDelay: pulses.length * 0.5,
                      }}
                    />
                  )
                })}
              </svg>

              {/* Nodes */}
              {nodes.map(node => {
                const isActive = activeNodes.includes(node.id)
                const isCore = node.id === 'ai'
                return (
                  <motion.div key={node.id}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isCore ? 10 : 5,
                    }}
                    animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.4 }}
                    transition={{ duration: 0.3 }}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br ${node.color} bg-opacity-20 border ${
                        isCore ? 'w-14 h-14 border-purple-500/50' : node.size === 'medium' ? 'w-11 h-11 border-white/10' : 'w-9 h-9 border-white/10'
                      }`}
                        style={{ background: `linear-gradient(135deg, rgba(15,15,25,0.9), rgba(15,15,25,0.8))`, boxShadow: isActive && isCore ? '0 0 20px rgba(139,92,246,0.4)' : isActive ? '0 0 10px rgba(139,92,246,0.2)' : 'none' }}>
                        {isActive && (
                          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 rounded-xl bg-gradient-to-br ${node.color} opacity-20`} />
                        )}
                        <span className={isCore ? 'text-2xl' : node.size === 'medium' ? 'text-lg' : 'text-base'}>{node.icon}</span>
                      </div>
                      <span className={`text-center font-medium leading-tight ${isCore ? 'text-xs text-purple-300' : 'text-xs text-gray-400'}`}
                        style={{ maxWidth: '60px' }}>
                        {node.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Right: Metrics */}
            <div className="w-36 border-l border-purple-500/10 p-4 flex flex-col gap-3 bg-slate-900/30">
              <p className="text-xs font-semibold text-gray-500 uppercase">Performance</p>

              {metrics.map((m, i) => (
                <motion.div key={i}
                  animate={{ opacity: metricIdx === i ? 1 : 0.35, scale: metricIdx === i ? 1.02 : 1 }}
                  className="p-2.5 rounded-xl bg-slate-900/50 border border-gray-700/30">
                  <p className="text-xs text-gray-500 leading-tight mb-1">{m.label}</p>
                  <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-green-400 font-semibold">{m.delta}</span>
                    <span className="text-xs text-gray-600">vs avant</span>
                  </div>
                </motion.div>
              ))}

              <div className="mt-auto pt-3 border-t border-purple-500/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">6 outils actifs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs text-gray-400">IA 24/7</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-xs text-gray-400">Flux auto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
