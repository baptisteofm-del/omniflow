'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

interface GeneratedContent {
  type: 'script' | 'texte' | 'idees' | 'campagne'
  items: string[]
}

const generatedContents: Record<string, GeneratedContent> = {
  script: {
    type: 'script',
    items: [
      '📸 Teaser 15s: Zoom sur visage, regards caméra, "Tu vas aimer ça..."',
      '🎬 Présentation 30s: Montre le contenu, parle des bénéfices',
      '💬 Call-to-action: "Link en bio" + urgence (24h promo)',
      '🎥 Variante vertical: Même script format 9:16',
    ]
  },
  texte: {
    type: 'texte',
    items: [
      'Contenu NSFW exclusif pour toi sur ma plateforme 👀',
      'Accès immédiat | Contenu 🔞 | Une surprise qui te plaire',
      'Vidéos HD inédites | Photos exclusive | Chat privé 💋',
      '+ 50 plans de texte personnalisés par audience',
    ]
  },
  idees: {
    type: 'idees',
    items: [
      '✨ Défi TikTok: "Montre ce que tu veux..." trend',
      '🔥 Transition rapide: Avant/Après déguisement',
      '🎭 Behind-the-scenes: Coulisse studio (teasing)',
      '🌙 Contenu minuit: "24h pour 15€"',
    ]
  },
  campagne: {
    type: 'campagne',
    items: [
      'Week-end exclusif: Vendredi-dimanche -20% (scarcité)',
      'Système "Early bird": Les premiers ont accès complet',
      'Bundle: 3 mois à prix réduit + contenus bonus',
      'Affiliate: Enrôle 3 amies, gagne 50€ de crédit',
    ]
  }
}

export function DemoGenerationIA() {
  const [activeTab, setActiveTab] = useState<keyof typeof generatedContents>('script')
  const [displayedItems, setDisplayedItems] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generationTime, setGenerationTime] = useState(2.3)

  useEffect(() => {
    const sequence = () => {
      setIsGenerating(true)
      setProgress(0)
      setDisplayedItems([])

      // Progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 30
        })
      }, 200)

      // Display items one by one
      const content = generatedContents[activeTab]
      content.items.forEach((item, idx) => {
        setTimeout(() => {
          setDisplayedItems((prev) => [...prev, item])
        }, 600 + idx * 400)
      })

      // Complete
      setTimeout(() => {
        setIsGenerating(false)
        setProgress(100)
        setGenerationTime(2.3 + Math.random() * 0.5)
      }, 2500)
    }

    sequence()
    const interval = setInterval(sequence, 8000)
    return () => clearInterval(interval)
  }, [activeTab])

  const tabs: Array<{ key: keyof typeof generatedContents; label: string; icon: string }> = [
    { key: 'script', label: 'Script', icon: '🎬' },
    { key: 'texte', label: 'Textes', icon: '✍️' },
    { key: 'idees', label: 'Idées', icon: '💡' },
    { key: 'campagne', label: 'Campagne', icon: '📈' },
  ]

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
            <span className="text-gray-400 text-xs font-medium ml-auto">Génération IA</span>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 min-h-[500px] flex flex-col">
            {/* Input section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase">Votre demande</label>
              <div className="p-4 rounded-lg border border-purple-500/20 bg-slate-900/50 backdrop-blur">
                <p className="text-gray-200 font-mono text-sm">
                  Génère un script pour promouvoir mon OF ce week-end
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Génération en cours...</span>
                  <span className="text-xs text-gray-400">{Math.floor(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-purple-500/20">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-purple-500/20 overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Generated content */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {displayedItems.length === 0 && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <button
                    onClick={() => setIsGenerating(true)}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-purple-300 font-semibold hover:from-purple-500/40 hover:to-cyan-500/40 transition-all flex items-center gap-2"
                  >
                    <Zap size={18} />
                    Générer le contenu
                  </button>
                </motion.div>
              )}

              {displayedItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-slate-900/50 border border-purple-500/20 text-gray-200 text-sm"
                >
                  {item}
                </motion.div>
              ))}
            </div>

            {/* Stats footer */}
            {displayedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-purple-500/20 pt-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Génération complète</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">GPT-4 Turbo</p>
                  <motion.p
                    key={generationTime}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm font-semibold text-cyan-400"
                  >
                    Généré en {generationTime.toFixed(1)}s
                  </motion.p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
