'use client'
import { useState, useEffect } from 'react'
import { Clock, Zap, X, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface TrialBannerProps {
  daysRemaining: number
  endsAt: string
}

export function TrialBanner({ daysRemaining, endsAt }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Ne pas redismiss si < 2 jours restants
    if (daysRemaining <= 2) setDismissed(false)
  }, [daysRemaining])

  if (dismissed && daysRemaining > 2) return null

  const isUrgent = daysRemaining <= 2
  const isExpiring = daysRemaining <= 0

  if (isExpiring) {
    return (
      <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={15} className="text-red-400 flex-shrink-0" />
          <span className="text-red-300 font-medium">Votre essai a expiré.</span>
          <span className="text-red-400/80 hidden sm:inline">Souscrivez pour conserver vos données.</span>
        </div>
        <Link
          href="/settings/billing"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
        >
          <CreditCard size={12} />S'abonner maintenant
        </Link>
      </div>
    )
  }

  return (
    <div className={`border-b px-4 py-2 flex items-center justify-between gap-3 ${
      isUrgent
        ? 'bg-orange-500/10 border-orange-500/30'
        : 'bg-purple-500/10 border-purple-500/20'
    }`}>
      <div className="flex items-center gap-2 text-sm">
        <Zap size={14} className={isUrgent ? 'text-orange-400' : 'text-purple-400'} />
        <span className={`font-medium ${isUrgent ? 'text-orange-300' : 'text-purple-300'}`}>
          {isUrgent
            ? `⚠️ Plus que ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} d'essai`
            : `Essai gratuit — ${daysRemaining} jours restants`
          }
        </span>
        <span className="text-gray-500 text-xs hidden sm:inline">
          (expire le {new Date(endsAt).toLocaleDateString('fr-FR')})
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/settings/billing"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all ${
            isUrgent
              ? 'bg-orange-500 hover:bg-orange-400'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          <CreditCard size={12} />
          {isUrgent ? 'S\'abonner maintenant' : 'Voir les offres'}
        </Link>
        {!isUrgent && (
          <button onClick={() => setDismissed(true)} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
