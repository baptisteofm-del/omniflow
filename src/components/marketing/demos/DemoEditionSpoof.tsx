'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Upload, Scissors, Layers, Check, Zap } from 'lucide-react'

const steps = [
  { id: 'import', label: 'Import vidéo', icon: Upload, color: 'blue' },
  { id: 'edit', label: 'Édition auto', icon: Scissors, color: 'purple' },
  { id: 'variants', label: '3 variantes', icon: Layers, color: 'cyan' },
  { id: 'spoof', label: 'Spoof & export', icon: Zap, color: 'pink' },
]

const variants = [
  { label: 'Variante A', duration: '0:32', platform: 'Instagram', style: 'Original', score: 94 },
  { label: 'Variante B', duration: '0:28', platform: 'TikTok', style: 'Crop vertical', score: 87 },
  { label: 'Variante C', duration: '0:45', platform: 'Telegram', style: 'Extended', score: 79 },
]

const modifications = [
  { label: 'Metadata nettoyées', done: true },
  { label: 'Fingerprint modifié', done: true },
  { label: 'Metadata vidéo effacées', done: true },
  { label: 'Hash unique généré', done: false },
  { label: 'Export optimisé', done: false },
]

export function DemoEditionSpoof() {
  const [currentStep, setCurrentStep] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [editProgress, setEditProgress] = useState(0)
  const [modIdx, setModIdx] = useState(0)
  const [spoofDone, setSpoofDone] = useState(false)
  const [savedTime, setSavedTime] = useState(0)

  useEffect(() => {
    const run = () => {
      setCurrentStep(0)
      setImportProgress(0)
      setEditProgress(0)
      setModIdx(0)
      setSpoofDone(false)
      setSavedTime(0)

      // Step 0: Import
      let prog = 0
      const importInterval = setInterval(() => {
        prog += 12
        setImportProgress(Math.min(prog, 100))
        if (prog >= 100) {
          clearInterval(importInterval)
          setTimeout(() => setCurrentStep(1), 400)
        }
      }, 100)

      // Step 1: Edit
      setTimeout(() => {
        let p = 0
        const editInterval = setInterval(() => {
          p += 5
          setEditProgress(Math.min(p, 100))
          if (p >= 100) {
            clearInterval(editInterval)
            setTimeout(() => setCurrentStep(2), 400)
          }
        }, 80)
      }, 1500)

      // Step 2: Variants appear (handled by currentStep)

      // Step 3: Spoof
      setTimeout(() => {
        setCurrentStep(3)
        let i = 0
        const modInterval = setInterval(() => {
          setModIdx(i + 1)
          i++
          if (i >= modifications.length) {
            clearInterval(modInterval)
            setSpoofDone(true)
            setSavedTime(45)
          }
        }, 400)
      }, 4500)
    }

    run()
    const interval = setInterval(run, 10000)
    return () => clearInterval(interval)
  }, [])

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
                OmniFlow — Édition & Spoof
              </span>
            </div>
            <AnimatePresence>
              {savedTime > 0 && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-xs text-green-400 font-semibold">{savedTime}min économisées</motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="p-5 flex flex-col gap-4 min-h-[460px]">
            {/* Steps */}
            <div className="flex gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon
                const done = i < currentStep
                const active = i === currentStep
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div animate={{
                      backgroundColor: done ? 'rgba(34,197,94,0.2)' : active ? 'rgba(139,92,246,0.2)' : 'rgba(30,41,59,0.5)',
                      borderColor: done ? 'rgba(34,197,94,0.5)' : active ? 'rgba(139,92,246,0.5)' : 'rgba(75,85,99,0.3)',
                    }} className="w-10 h-10 rounded-xl border flex items-center justify-center">
                      {done
                        ? <Check size={16} className="text-green-400" />
                        : <Icon size={16} className={active ? 'text-purple-400' : 'text-gray-600'} />
                      }
                    </motion.div>
                    <span className={`text-xs text-center leading-tight ${done ? 'text-green-400' : active ? 'text-purple-300' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className="absolute hidden" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Step 0: Import */}
              <AnimatePresence>
                {currentStep === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3">
                    <div className="h-24 border-2 border-dashed border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-900/40">
                      <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Upload size={24} className="text-purple-400" />
                      </motion.div>
                      <span className="text-sm text-gray-400">video_shoot_raw.mp4</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Import en cours...</span>
                        <span className="text-purple-300">{importProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${importProgress}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Editing */}
              <AnimatePresence>
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-purple-500/20 space-y-2">
                      <p className="text-xs font-semibold text-gray-400">Édition automatique IA</p>
                      {['Détection des meilleures scènes', 'Optimisation rythme', 'Ajout transitions', 'Calibration couleurs'].map((t, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: editProgress > i * 25 ? 1 : 0.3, x: 0 }}
                          className="flex items-center gap-2 text-xs">
                          {editProgress > (i + 1) * 25
                            ? <Check size={12} className="text-green-400" />
                            : <motion.div animate={{ rotate: editProgress > i * 25 ? 360 : 0 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full" />
                          }
                          <span className="text-gray-300">{t}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${editProgress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Variants */}
              <AnimatePresence>
                {currentStep >= 2 && currentStep < 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">3 variantes générées</p>
                    {variants.map((v, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-purple-500/20">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                          <span className="text-lg">🎬</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{v.label}</p>
                          <p className="text-xs text-gray-500">{v.platform} · {v.style} · {v.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">{v.score}%</p>
                          <p className="text-xs text-gray-600">score</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Spoof */}
              <AnimatePresence>
                {currentStep >= 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400">Spoof automatique</p>
                    {modifications.map((m, i) => (
                      <motion.div key={i} animate={{ opacity: i < modIdx ? 1 : 0.3 }}
                        className="flex items-center gap-2 text-xs">
                        {i < modIdx
                          ? <Check size={11} className="text-green-400" />
                          : <div className="w-3 h-3 rounded-full border border-gray-600" />
                        }
                        <span className={i < modIdx ? 'text-gray-300' : 'text-gray-600'}>{m.label}</span>
                      </motion.div>
                    ))}
                    <AnimatePresence>
                      {spoofDone && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                          <Zap size={16} className="text-green-400" />
                          <div>
                            <p className="text-sm font-semibold text-green-400">3 vidéos prêtes à publier</p>
                            <p className="text-xs text-gray-400">45 minutes économisées</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
