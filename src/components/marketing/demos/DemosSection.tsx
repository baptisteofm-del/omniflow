'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { DemoAutoPosting } from './DemoAutoPosting'
import { DemoChattingIA } from './DemoChattingIA'
import { DemoGenerationIA } from './DemoGenerationIA'
import { DemoEditionSpoof } from './DemoEditionSpoof'
import { DemoProspection } from './DemoProspection'
import { DemoVeilleTrends } from './DemoVeilleTrends'
import { DemoEcosystem } from './DemoEcosystem'

const tabs = [
  { id: 'posting', label: 'Auto-Posting', icon: '📤' },
  { id: 'chatting', label: 'Chatting IA', icon: '💬' },
  { id: 'generation', label: 'Génération IA', icon: '✨' },
  { id: 'spoof', label: 'Édition & Spoof', icon: '🎬' },
  { id: 'prospection', label: 'Prospection', icon: '🎯' },
  { id: 'veille', label: 'Veille Trends', icon: '📈' },
  { id: 'ecosystem', label: 'Écosystème', icon: '⚙️' },
]

const demoComponents = {
  posting: DemoAutoPosting,
  chatting: DemoChattingIA,
  generation: DemoGenerationIA,
  spoof: DemoEditionSpoof,
  prospection: DemoProspection,
  veille: DemoVeilleTrends,
  ecosystem: DemoEcosystem,
}

const tabFeatures = {
  posting: [
    'Publication multi-plateformes',
    'Scheduling intelligent',
    'Zéro ban garanti',
    '100 profils simultanément',
  ],
  chatting: [
    'Chatting 100% automatisé',
    'Conversations ultra naturelles',
    'IA entraînée pour la vente',
    'IA entraînée pour la fidélisation',
    'Relationnel avancé',
    'Engagement automatique',
    'Conversion optimisée',
    'Disponible 24h/24',
  ],
  generation: [
    'Scripts en 2 secondes',
    'Textes ultra-naturels',
    'Idées de campagnes',
    'Formats optimisés',
  ],
  spoof: [
    'Spoof automatique',
    '45 min économisées par vidéo',
    '3 variantes générées',
    'Fingerprint modifié',
  ],
  prospection: [
    '127 profils analysés/heure',
    'Score de compatibilité IA',
    'Message de contact auto-généré',
    'Pipeline automatisé',
  ],
  veille: [
    '847 vidéos analysées',
    'Détection en temps réel',
    'Suggestions de formats',
    'Contenus qui explosent',
  ],
  ecosystem: [
    '6 outils connectés',
    'Flux de données automatisés',
    '98% uptime',
    'IA au centre du système',
  ],
}

export function DemosSection() {
  const [activeTab, setActiveTab] = useState<keyof typeof demoComponents>('posting')

  const ActiveComponent = demoComponents[activeTab]
  const features = tabFeatures[activeTab]

  return (
    <section id="demos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Voir OmniFlow en{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              action
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            7 démos animées ultra-premium. Tout ce que font vos VAs, OmniFlow le fait mieux, plus vite, 24h/24.
          </p>
        </motion.div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 overflow-x-auto pb-4 sm:pb-0">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as keyof typeof demoComponents)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap backdrop-blur border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                  : 'border-gray-600/30 text-gray-300 hover:border-purple-500/30'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm sm:text-base">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo content with features */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Features list - Hidden on mobile, 30% on desktop */}
          <motion.div
            key={`features-${activeTab}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:flex lg:w-1/3 flex-col gap-4"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3 group"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.08 + 0.1 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </motion.div>
                <span className="text-gray-300 font-medium group-hover:text-gray-100 transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo preview - Full width on mobile, 70% on desktop */}
          <motion.div
            key={`demo-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full lg:w-2/3"
          >
            <ActiveComponent />
          </motion.div>
        </div>

        {/* Gradient background elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
      </div>
    </section>
  )
}
