'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils/cn'
import type { BillingInterval } from '@/types'

export function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCryptoPay = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const response = await fetch('/api/nowpayments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const data = await response.json()
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      }
    } catch (error) {
      console.error('Crypto payment error:', error)
      alert('Erreur lors de l\'initiation du paiement. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choisissez votre <span className="gradient-text">formule</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            7 jours d'essai. Résiliez quand vous voulez.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all',
                interval === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                interval === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              Annuel
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl p-8 flex flex-col',
                plan.highlighted
                  ? 'bg-gradient-to-b from-purple-900/60 to-purple-800/20 border border-purple-500/50 glow'
                  : 'glass'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-sm font-medium">
                    <Zap size={12} />
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">
                    {interval === 'monthly' ? plan.price.monthly : plan.price.yearly}€
                  </span>
                  <span className="text-gray-400 mb-1">/mois</span>
                </div>
                {interval === 'yearly' && (
                  <p className="text-green-400 text-sm mt-1">
                    Économisez {(plan.price.monthly - plan.price.yearly) * 12}€/an
                  </p>
                )}
              </div>

              {/* CTA */}
              <Link
                href={`/register?plan=${plan.id}&interval=${interval}`}
                className={cn(
                  'block text-center py-3 rounded-xl font-semibold transition-all mb-2',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 glow-sm'
                    : 'glass border border-purple-500/30 hover:border-purple-500/60 hover:text-white'
                )}
              >
                Essai gratuit 7 jours
              </Link>

              {/* Crypto Payment Button */}
              <button
                onClick={() => handleCryptoPay(plan.id)}
                disabled={loadingPlan === plan.id}
                className="w-full text-center py-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loadingPlan === plan.id ? '⏳' : '₿'}</span> {loadingPlan === plan.id ? 'Chargement...' : 'Payer en crypto (USDT/BTC)'}
              </button>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f.name} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check size={16} className="text-green-400 flex-shrink-0" />
                    ) : (
                      <X size={16} className="text-gray-600 flex-shrink-0" />
                    )}
                    <span className={f.included ? 'text-gray-200' : 'text-gray-500'}>
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Crypto payment note */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            ✓ Période d'essai 7 jours · Aucun engagement · Annulation en 1 clic
          </p>
        </div>
      </div>
    </section>
  )
}
