'use client'
import { X, Zap, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  targetPlan?: string        // 'pro' | 'agency'
  feature?: string           // what triggered the modal
  limitInfo?: { current: number; limit: number; feature: string }
}

export function UpgradeModal({ isOpen, onClose, currentPlan = 'starter', targetPlan = 'pro', feature, limitInfo }: UpgradeModalProps) {
  if (!isOpen) return null

  const target = PLANS.find(p => p.id === targetPlan) || PLANS[1]
  const current = PLANS.find(p => p.id === currentPlan) || PLANS[0]

  const FEATURE_LABELS: Record<string, string> = {
    models: 'modèles',
    postSchedules: 'posts schedulés',
    aiGenerations: 'générations IA',
    telegramBots: 'bots Telegram',
    teamMembers: 'membres d\'équipe',
    chatting_ai: 'Chatting IA',
    ai_generation: 'Génération IA Kling',
    prospection: 'Prospection de modèles',
    chatting_reports: 'Rapports Chatting',
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className="bg-[#12111a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-purple-900/50 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={18} />
        </button>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                Passez au plan {target.name}
              </h3>
              <p className="text-gray-500 text-sm">{target.description}</p>
            </div>
          </div>

          {/* Limit info */}
          {limitInfo && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-300 text-sm font-medium">
                🔒 Limite atteinte — {FEATURE_LABELS[limitInfo.feature] || limitInfo.feature}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {limitInfo.current}/{limitInfo.limit} utilisés sur votre plan {current.name}
              </p>
            </div>
          )}

          {feature && !limitInfo && (
            <div className="mb-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-purple-300 text-sm font-medium">
                ✨ {FEATURE_LABELS[feature] || feature} disponible sur {target.name}+
              </p>
            </div>
          )}

          {/* Price */}
          <div className="text-center mb-5 p-4 rounded-xl bg-white/3 border border-white/10">
            <p className="text-gray-500 text-sm mb-1">Plan {target.name}</p>
            <p className="text-4xl font-bold text-white">{target.price.monthly}€<span className="text-gray-500 text-lg">/mois</span></p>
            <p className="text-green-400 text-xs mt-1">ou {target.price.yearly}€/mois en annuel</p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            {target.features.filter(f => f.included).slice(0, 6).map(f => (
              <div key={f.name} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{f.name}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/settings/billing"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-center flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Passer au plan {target.name} <ArrowRight size={18} />
          </Link>
          <p className="text-center text-xs text-gray-600 mt-3">
            Sans engagement · Changement immédiat
          </p>
        </div>
      </div>
    </div>
  )
}
