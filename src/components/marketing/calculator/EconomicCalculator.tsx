'use client'

import { useMemo, useState } from 'react'

const FULL_AI_SUBSCRIPTION = 199
const OMNIFLOW_COMMISSION_RATE = 0.025

function formatEUR(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value)) + '€'
}

export function EconomicCalculator() {
  const [revenue, setRevenue] = useState(100000)
  const [chatterCostPercent, setChatterCostPercent] = useState(10)

  const { traditionalCost, omniflowCost, savings } = useMemo(() => {
    const traditionalCost = revenue * (chatterCostPercent / 100)
    const omniflowCost = revenue * OMNIFLOW_COMMISSION_RATE + FULL_AI_SUBSCRIPTION
    return { traditionalCost, omniflowCost, savings: Math.max(0, traditionalCost - omniflowCost) }
  }, [revenue, chatterCostPercent])

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Combien vous coûte réellement votre chatting ?
        </h2>
      </div>

      <div className="glass rounded-2xl p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-[color:var(--foreground-muted)]" htmlFor="revenue">
              Revenu mensuel de chatting
            </label>
            <div className="mb-2 text-2xl font-semibold">{formatEUR(revenue)}</div>
            <input
              id="revenue"
              type="range"
              min={5000}
              max={300000}
              step={1000}
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full accent-[color:var(--violet)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[color:var(--foreground-muted)]" htmlFor="chatter-cost">
              Coût actuel de vos chatters (%)
            </label>
            <div className="mb-2 text-2xl font-semibold">{chatterCostPercent}%</div>
            <input
              id="chatter-cost"
              type="range"
              min={5}
              max={25}
              step={1}
              value={chatterCostPercent}
              onChange={(e) => setChatterCostPercent(Number(e.target.value))}
              className="w-full accent-[color:var(--violet)]"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[color:var(--surface-elevated)] p-5">
            <p className="text-xs text-[color:var(--foreground-muted)]">Coût actuel estimé</p>
            <p className="mt-1 text-xl font-semibold">{formatEUR(traditionalCost)}<span className="text-sm font-normal text-[color:var(--foreground-muted)]">/mois</span></p>
          </div>
          <div className="rounded-xl bg-[color:var(--surface-elevated)] p-5">
            <p className="text-xs text-[color:var(--foreground-muted)]">Commission OmniFlow (2,5%) + abonnement</p>
            <p className="mt-1 text-xl font-semibold">{formatEUR(omniflowCost)}<span className="text-sm font-normal text-[color:var(--foreground-muted)]">/mois</span></p>
          </div>
          <div className="gradient-bg-signature rounded-xl p-5">
            <p className="text-xs text-white/80">Différence potentielle</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatEUR(savings)}<span className="text-sm font-normal text-white/80">/mois</span></p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--foreground-muted)]">
          Estimation indicative basée sur les valeurs saisies, à titre d&apos;exemple — pas une économie garantie.
        </p>
      </div>
    </section>
  )
}
