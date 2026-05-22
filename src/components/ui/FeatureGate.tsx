'use client'
import { Lock, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { UpgradeModal } from './UpgradeModal'
import { PLAN_FEATURES } from '@/lib/plans'

interface FeatureGateProps {
  feature: string              // feature key e.g. 'chatting_ai'
  planId: string               // current plan id
  requiredPlan?: string        // 'pro' | 'agency'
  children: React.ReactNode
  mode?: 'blur' | 'overlay'   // blur = dim + blur, overlay = full overlay
}

export function FeatureGate({ feature, planId, requiredPlan, children, mode = 'blur' }: FeatureGateProps) {
  const [showModal, setShowModal] = useState(false)

  const hasAccess = PLAN_FEATURES[planId]?.includes(feature) ?? false

  if (hasAccess) return <>{children}</>

  // Determine which plan unlocks this
  const target = requiredPlan || (
    PLAN_FEATURES.pro?.includes(feature) ? 'pro' : 'agency'
  )

  return (
    <>
      <div className="relative group">
        {/* Dimmed children */}
        <div className={`pointer-events-none select-none transition-all ${
          mode === 'blur' ? 'opacity-30 blur-[2px]' : 'opacity-20'
        }`}>
          {children}
        </div>

        {/* Lock overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-xl"
          onClick={() => setShowModal(true)}
        >
          <div className="bg-[#12111a]/90 border border-purple-500/40 rounded-2xl px-6 py-4 text-center shadow-xl backdrop-blur-sm">
            <Lock size={24} className="text-purple-400 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm mb-1">
              Plan {target === 'pro' ? 'Pro' : 'Agency'} requis
            </p>
            <button
              className="flex items-center gap-1.5 mx-auto text-xs text-purple-400 hover:text-purple-300 font-medium mt-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-all"
              onClick={e => { e.stopPropagation(); setShowModal(true) }}
            >
              Passer au plan supérieur <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentPlan={planId}
        targetPlan={target}
        feature={feature}
      />
    </>
  )
}
