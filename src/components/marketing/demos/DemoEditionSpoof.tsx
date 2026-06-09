'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Upload, Check } from 'lucide-react'

interface Variant {
  id: number
  thumbnail: string
  label: string
}

export function DemoEditionSpoof() {
  const [uploadedFile, setUploadedFile] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [progress, setProgress] = useState(0)
  const [variants, setVariants] = useState<Variant[]>([])
  const [completedChecks, setCompletedChecks] = useState<string[]>([])
  const [timeSaved, setTimeSaved] = useState(45)

  useEffect(() => {
    const sequence = () => {
      setUploadedFile(true)
      setIsTransforming(true)
      setProgress(0)
      setVariants([])
      setCompletedChecks([])
      setTimeSaved(45)

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 25
        })
      }, 300)

      // Checks completion
      const checks = ['Fingerprint modifié ✓', 'Métadonnées nettoyées ✓', 'Ratio ajusté ✓']
      checks.forEach((check, idx) => {
        setTimeout(() => {
          setCompletedChecks((prev) => [...prev, check])
        }, 400 + idx * 600)
      })

      // Generate variants
      setTimeout(() => {
        const newVariants: Variant[] = [
          { id: 1, thumbnail: '🎬', label: 'Variant 1' },
          { id: 2, thumbnail: '📹', label: 'Variant 2' },
          { id: 3, thumbnail: '🎥', label: 'Variant 3' },
        ]
        setVariants(newVariants)
      }, 2500)

      // Complete
      setTimeout(() => {
        setIsTransforming(false)
        setProgress(100)
        setTimeSaved(45 + Math.floor(Math.random() * 15))
      }, 3500)

      // Reset for loop
      setTimeout(() => {
        setUploadedFile(false)
        setVariants([])
        setCompletedChecks([])
      }, 8000)
    }

    sequence()
    const interval = setInterval(sequence, 10000)
    return () => clearInterval(interval)
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
            <span className="text-gray-400 text-xs font-medium ml-auto">Édition & Spoof</span>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 min-h-[500px]">
            <div className="grid grid-cols-2 gap-8">
              {/* Left: Upload */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-white">Importer vidéo</h3>

                <motion.div
                  animate={{
                    borderColor: uploadedFile ? 'rgba(34, 197, 94, 0.5)' : 'rgba(139, 92, 246, 0.3)',
                    backgroundColor: uploadedFile ? 'rgba(34, 197, 94, 0.05)' : 'rgba(139, 92, 246, 0.05)',
                  }}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]"
                >
                  <motion.div
                    animate={{ scale: uploadedFile ? 1.2 : 1 }}
                    className="mb-4"
                  >
                    {uploadedFile ? (
                      <Check size={40} className="text-green-400" />
                    ) : (
                      <Upload size={40} className="text-purple-400" />
                    )}
                  </motion.div>

                  <p className="text-sm text-gray-300 font-semibold">
                    {uploadedFile ? 'Fichier importé ✓' : 'Drag & drop votre vidéo'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">MP4, MOV • Max 1GB</p>
                </motion.div>

                {/* Progress */}
                {isTransforming && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Transformation</span>
                      <span className="text-xs font-semibold text-cyan-400">{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Checks */}
                <div className="space-y-2">
                  {completedChecks.map((check, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-green-400"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                      {check}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Variants */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-white">Variantes générées (3)</h3>

                <div className="grid grid-cols-3 gap-4">
                  {variants.length === 0 ? (
                    // Empty state
                    Array(3)
                      .fill(null)
                      .map((_, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ opacity: [0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 flex items-center justify-center"
                        >
                          <div className="text-4xl opacity-30">🎬</div>
                        </motion.div>
                      ))
                  ) : (
                    variants.map((variant, idx) => (
                      <motion.div
                        key={variant.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="aspect-video rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/50 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-all group"
                      >
                        <div className="text-4xl group-hover:scale-110 transition-transform">
                          {variant.thumbnail}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Download button */}
                {variants.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-purple-300 font-semibold hover:from-purple-500/40 hover:to-cyan-500/40 transition-all"
                  >
                    Télécharger les 3 variantes
                  </motion.button>
                )}
              </div>
            </div>

            {/* Time saved footer */}
            {completedChecks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-purple-500/20 pt-6 flex items-center justify-between"
              >
                <span className="text-gray-400 text-sm">Temps économisé</span>
                <motion.div
                  key={timeSaved}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-3xl font-bold text-green-400">{timeSaved}</span>
                  <span className="text-gray-400">min de montage</span>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
