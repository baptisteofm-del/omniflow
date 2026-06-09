'use client'
import { Lock, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface LimitGuardProps {
  feature: string
  description?: string
  currentPlan?: string
  requiredPlan?: string
  isTrial?: boolean
  children: React.ReactNode
  showPreview?: boolean
}

/**
 * Wrapper qui affiche une UI "locked" par-dessus le contenu ou le remplace
 */
export function LimitGuard({
  feature,
  description,
  currentPlan,
  requiredPlan,
  isTrial,
  children,
  showPreview = false,
}: LimitGuardProps) {
  const planLabels: Record<string, string> = {
    trial: 'Essai', starter: 'Starter', pro: 'Pro', agency: 'Agency'
  }
  const planColors: Record<string, string> = {
    starter: 'from-blue-600 to-blue-500',
    pro: 'from-purple-600 to-cyan-600',
    agency: 'from-amber-600 to-orange-500',
  }

  const upgradeLabel = planLabels[requiredPlan || ''] || requiredPlan
  const gradientClass = planColors[requiredPlan || ''] || 'from-purple-600 to-cyan-600'

  return (
    <div className="relative">
      {/* Preview flou ou contenu caché */}
      {showPreview ? (
        <div className="pointer-events-none select-none opacity-40 blur-[2px] filter">
          {children}
        </div>
      ) : null}

      {/* Overlay de blocage */}
      <div className={`${showPreview ? 'absolute inset-0' : ''} flex flex-col items-center justify-center p-8 text-center`}>
        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
          <Lock size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{feature}</h3>
        {description && (
          <p className="text-gray-400 text-sm mb-5 max-w-sm leading-relaxed">{description}</p>
        )}
        {isTrial ? (
          <p className="text-xs text-gray-500 mb-4">
            Fonctionnalité disponible après souscription
          </p>
        ) : (
          <p className="text-xs text-gray-500 mb-4">
            Disponible à partir du plan <strong className="text-white">{upgradeLabel}</strong>
          </p>
        )}
        <Link
          href="/settings/billing"
          className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${gradientClass} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all`}
        >
          <Zap size={14} />
          {isTrial ? 'S\'abonner pour accéder' : `Passer au plan ${upgradeLabel}`}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

/**
 * Composant léger pour afficher un quota avec barre de progression
 */
export function QuotaBar({
  label,
  current,
  limit,
  color = 'purple',
}: {
  label: string
  current: number
  limit: number
  color?: 'purple' | 'cyan' | 'green' | 'orange' | 'red'
}) {
  if (limit === -1) return null

  const pct = Math.min((current / limit) * 100, 100)
  const isWarning = pct >= 80
  const isFull = pct >= 100

  const colorClass = isFull
    ? 'bg-red-500'
    : isWarning
    ? 'bg-orange-500'
    : {
        purple: 'bg-purple-500',
        cyan: 'bg-cyan-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
      }[color]

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={isFull ? 'text-red-400 font-semibold' : isWarning ? 'text-orange-400' : 'text-gray-500'}>
          {current}/{limit === -1 ? '∞' : limit}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
