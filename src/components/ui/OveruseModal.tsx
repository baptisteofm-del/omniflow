'use client'
import { useState } from 'react'
import { X, Zap, CreditCard, ChevronRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OveruseModalProps {
  feature: 'ai_generation' | 'trend_run' | 'chatting_ai' | 'prospection_run'
  onClose: () => void
  onSuccess?: () => void
}

const FEATURE_INFO = {
  ai_generation:   { label: 'Génération IA',      icon: '🎬', desc: 'Vous avez atteint votre quota mensuel de générations vidéo.' },
  trend_run:       { label: 'Veille Trends',       icon: '📊', desc: 'Vous avez atteint votre quota journalier de scraping Trends.' },
  chatting_ai:     { label: 'Chatting IA',         icon: '🤖', desc: 'Vous avez atteint votre quota mensuel de messages Chatting IA.' },
  prospection_run: { label: 'Recrutement IA',      icon: '🔍', desc: 'Vous avez atteint votre quota mensuel de runs Recrutement.' },
}

const PACK_PRICING = {
  ai_generation:   { price: 2.50, pack: 5,   unit: '5 générations supplémentaires' },
  trend_run:       { price: 0.99, pack: 10,  unit: '10 sessions Veille supplémentaires' },
  chatting_ai:     { price: 4.90, pack: 500, unit: '500 messages supplémentaires' },
  prospection_run: { price: 3.90, pack: 3,   unit: '3 runs Recrutement supplémentaires' },
}

export function OveruseModal({ feature, onClose, onSuccess }: OveruseModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const info = FEATURE_INFO[feature]
  const pack = PACK_PRICING[feature]

  const handleBuy = async () => {
    setLoading(true)
    // Redirige vers la page de billing avec le paramètre overuse
    router.push(`/settings/billing?overuse=${feature}&pack=${pack.pack}&price=${pack.price}`)
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

          {/* Option 1: Acheter un pack */}
          <div className="p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">Pack supplémentaire</p>
                <p className="text-xs text-gray-400 mt-0.5">{pack.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{pack.price.toFixed(2)}€</p>
                <p className="text-xs text-gray-500">paiement unique</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-3">
              <li className="flex items-center gap-1.5"><Zap size={10} className="text-purple-400" />Débloqué immédiatement après paiement</li>
              <li className="flex items-center gap-1.5"><Zap size={10} className="text-purple-400" />Valide 30 jours</li>
            </ul>
            <button onClick={handleBuy} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              Acheter ce pack
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
