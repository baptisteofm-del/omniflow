'use client'
import { useState, useEffect } from 'react'
import { X, Zap, CreditCard, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RUN_UNITS, RUN_PRICE_EUR } from '@/lib/plans'

interface OveruseModalProps {
  feature: 'ai_generation' | 'trend_run' | 'chatting_ai' | 'prospection_run'
  onClose: () => void
  onSuccess?: () => void
}

interface CreditsData {
  balance: number
  autoTopup: {
    enabled: boolean
    threshold: number
    amount: number
  }
}

const FEATURE_INFO = {
  ai_generation:   { label: 'Génération IA',      icon: '🎬', desc: 'Vous avez atteint votre quota mensuel de générations vidéo.' },
  trend_run:       { label: 'Veille Trends',       icon: '📊', desc: 'Vous avez atteint votre quota journalier de scraping Trends.' },
  chatting_ai:     { label: 'Chatting IA',         icon: '🤖', desc: 'Vous avez atteint votre quota mensuel de messages Chatting IA.' },
  prospection_run: { label: 'Recrutement IA',      icon: '🔍', desc: 'Vous avez atteint votre quota mensuel de runs Recrutement.' },
}

export function OveruseModal({ feature, onClose, onSuccess }: OveruseModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const info = FEATURE_INFO[feature]

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/credits/balance')
        if (res.ok) {
          const data = await res.json()
          setCredits(data)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setCreditsLoading(false)
      }
    }

    fetchCredits()
  }, [])

  const handleBuyRun = async () => {
    setLoading(true)
    router.push('/settings/billing?tab=credits')
    onClose()
  }

  const handleUpgrade = () => {
    router.push('/settings/billing')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{info.icon}</span>
            <h3 className="font-semibold text-white text-sm">Quota atteint — {info.label}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-400">{info.desc}</p>

          {/* Current Credits Display */}
          {!creditsLoading && credits && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Vos crédits actuels</p>
              <p className="text-2xl font-bold text-white">{credits.balance} crédits</p>
            </div>
          )}

          {/* Option 1: Buy Credits */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">Système de crédits unifié</p>
                <p className="text-xs text-gray-400 mt-0.5">1 RUN = {RUN_UNITS} crédits = {RUN_PRICE_EUR}€</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{RUN_PRICE_EUR}€</p>
                <p className="text-xs text-gray-500">par RUN</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-3">
              <li className="flex items-center gap-1.5"><Zap size={10} className="text-purple-400" />{RUN_UNITS} générations IA ou {RUN_UNITS} trends</li>
              <li className="flex items-center gap-1.5"><Zap size={10} className="text-purple-400" />Crédits valides indéfiniment</li>
              <li className="flex items-center gap-1.5"><Zap size={10} className="text-purple-400" />Configurez l'auto top-up dans les paramètres</li>
            </ul>
            <button onClick={handleBuyRun} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              Acheter des crédits
            </button>
          </div>

          {/* Option 2: Upgrade plan */}
          <button onClick={handleUpgrade}
            className="w-full flex items-center justify-between p-3 bg-white/3 border border-white/8 rounded-xl hover:bg-white/8 transition-all">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <div className="text-left">
                <p className="text-xs font-medium text-white">Passer au plan supérieur</p>
                <p className="text-xs text-gray-500">Plus de quotas inclus chaque mois</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
