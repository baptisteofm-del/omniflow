'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { DemoGeelark } from './DemoGeelark'
import { DemoAdspower } from './DemoAdspower'
import { DemoTelegram } from './DemoTelegram'
import { DemoKling } from './DemoKling'
import { TrendingUp } from 'lucide-react'

const tabs = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'Twitter', icon: '𝕏' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'kling', label: 'Génération IA', icon: '✨' },
]

const demoComponents = {
  instagram: DemoGeelark,
  twitter: DemoAdspower,
  telegram: DemoTelegram,
  kling: DemoKling,
}

export function DemosSection() {
  const [activeTab, setActiveTab] = useState<keyof typeof demoComponents>('instagram')

  const ActiveComponent = demoComponents[activeTab]

  return (
    <section id="demos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-6">
            <TrendingUp size={14} />
            Démonstrations interactives
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Voyez OmniFlow en{' '}
            <span className="gradient-text">action</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tout ce que font vos VAs, OmniFlow le fait mieux, plus vite, sans erreur
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

        {/* Demo content */}
        <div className="flex justify-center">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
