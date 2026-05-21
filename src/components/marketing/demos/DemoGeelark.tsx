'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

const profiles = [
  { name: 'Carla', status: 'active' },
  { name: 'Carla', status: 'active' },
  { name: 'Carla', status: 'active' },
]

export function DemoGeelark() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          setIsPublished(true)
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 25
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isAnimating])

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setUploadProgress(0)
      setIsPublished(false)
      setIsAnimating(true)
    }, 5000)

    return () => clearTimeout(resetTimer)
  }, [isPublished])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Phone mockup */}
      <div className="relative w-80 h-96 rounded-3xl border-8 border-gray-800 bg-black shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl z-10" />

        {/* Screen content */}
        <div className="w-full h-full bg-white flex flex-col">
          {/* Status bar */}
          <div className="h-8 bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-between px-4 text-white text-xs font-semibold pt-2">
            <span>9:41</span>
            <span className="text-white">GeeLark Cloud</span>
          </div>

          {/* Instagram interface */}
          <div className="flex-1 bg-gray-50 flex flex-col p-4 gap-3">
            {/* Post header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Carla_official</div>
                <div className="text-xs text-gray-500">Just now</div>
              </div>
            </div>

            {/* Video preview */}
            <div className="aspect-square bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-3xl mb-1">🎬</div>
                <div className="text-xs">Reel Video</div>
              </div>
            </div>

            {/* Upload bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{Math.min(Math.round(uploadProgress), 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                />
              </div>
            </div>

            {/* Success state */}
            {isPublished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-green-600 text-sm font-semibold"
              >
                <Check size={16} />
                En cours de publication...
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Profile indicators */}
      <div className="flex items-center gap-3">
        {profiles.map((profile) => (
          <motion.div
            key={profile.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="text-sm font-medium text-gray-300">{profile.name}</span>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </motion.div>
        ))}
      </div>

      {/* Text */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">
          Enjoying the view ✨ link in bio 🔗
        </h3>
        <p className="text-gray-400 text-sm">GeeLark Cloud — 100 profils gérés simultanément</p>
      </div>
    </motion.div>
  )
}
