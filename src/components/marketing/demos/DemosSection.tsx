'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { DemoPosting } from './DemoPosting'
import { DemoKling } from './DemoKling'
import { DemoChatting } from './DemoChatting'
import { DemoAnalytics } from './DemoAnalytics'
import { DemoInstagram } from './DemoInstagram'
import { DemoTwitter } from './DemoTwitter'

const tabs = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏' },
  { id: 'posting', label: 'Multi-Posting', icon: '🎬' },
  { id: 'kling', label: 'Génération Kling', icon: '✨' },
  { id: 'chatting', label: 'Chatting IA', icon: '💬' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
]

const demoComponents = {
  instagram: DemoInstagram,
  twitter: DemoTwitter,
  posting: DemoPosting,
  kling: DemoKling,
  chatting: DemoChatting,
  analytics: DemoAnalytics,
}

const tabFeatures = {
  instagram: [
    '47 profils IG en simultané',
    'Reels + Stories + Posts',
    'Zéro ban grâce à GeeLark',
    'Likes & comments en hausse',
  ],
  twitter: [
    'Threads & tweets auto-générés',
    '28 tweets en file d\'attente',
    'Analytics temps réel (vues, likes)',
    'Horaires optimisés par l\'IA',
  ],
  posting: [
    '100 profils simultanément',
    'AdsPower + GeeLark natif',
    'Zéro ban, zéro détection',
    'Scheduling intelligent',
  ],
  kling: [
    'Kling v1 / v1.5 / v2',
    'Format 9:16 pour Reels',
    'Prêt en 2-4 minutes',
    '200 générations/mois (Pro)',
  ],
  chatting: [
    'Répond en moins de 30s',
    'Détecte les opportunités PPV',
    'Mémoire fan permanente',
    'Scripts personnalisés importables',
  ],
  analytics: [
    'Dashboard temps réel',
    'Tracking par modèle',
    'Commission IA détaillée',
    'Export PDF automatique',
  ],
}

export function DemosSection() {
  const [activeTab, setActiveTab] = useState<keyof typeof demoComponents>('instagram')

  const ActiveComponent = demoComponents[activeTab]
  const features = tabFeatures[activeTab]

  return (
    <section id="demos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Voyez OmniFlow en{' '}
            <span className="gradient-text">action</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tout ce que font vos VAs, OmniFlow le fait mieux, plus vite, 24h/24
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as keyof typeof demoComponents)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'glass bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-white'
                  : 'glass border border-gray-600/30 text-gray-300 hover:border-purple-500/30'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Demo content with features */}
        <div className="flex gap-8 lg:gap-12 items-stretch">
          {/* Features list - 30% */}
          <motion.div
            key={`features-${activeTab}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:flex flex-col gap-4 w-1/3"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-300 font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo preview - 70% */}
          <motion.div
            key={`demo-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
