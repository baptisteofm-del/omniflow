'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { changePlan } from '@/lib/billing/actions'

interface Plan {
  id: string
  display_name: string
  monthly_price: number
  commission_rate: number
}

export function PlanSwitcher({ plans, currentPlanId }: { plans: Plan[]; currentPlanId: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
      <div className="flex gap-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          return (
            <button
              key={plan.id}
              disabled={isPending || isCurrent}
              onClick={() => {
                setError(null)
                startTransition(async () => {
                  try {
                    await changePlan(plan.id as 'copilot' | 'full_ai')
                    router.refresh()
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Une erreur est survenue')
                  }
                })
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs disabled:opacity-50 ${
                isCurrent
                  ? 'border-[color:var(--border-strong)] bg-white/10'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isCurrent ? `${plan.display_name} (actuel)` : `Passer à ${plan.display_name}`}
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-[color:var(--foreground-muted)]">
        Mode test — aucun paiement réel n&apos;est traité (fournisseur de paiement à brancher plus tard).
      </p>
    </div>
  )
}
