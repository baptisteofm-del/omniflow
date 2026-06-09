'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Star, ArrowRight, Shield } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils/cn'
import type { BillingInterval } from '@/types'

// ── Config visuelle par plan ─────────────────────────────────
const PLAN_META: Record<string, {
  accent: string
  ctaClass: string
  checkBg: string
  checkColor: string
  cardClass: string
  badge?: string
  scale?: boolean
}> = {
  starter: {
    accent: 'text-gray-300',
    ctaClass: 'bg-white/8 border border-white/15 text-white hover:bg-white/12 hover:border-white/25',
    checkBg: 'bg-green-500/10',
    checkColor: 'text-green-400',
    cardClass: 'glass border-white/8',
  },
  pro: {
    accent: 'text-purple-300',
    ctaClass: 'bg-gradient-to-r from-purple-600 to-violet-700 text-white hover:opacity-90 shadow-lg shadow-purple-500/20',
    checkBg: 'bg-purple-500/10',
    checkColor: 'text-purple-400',
    cardClass: 'bg-gradient-to-b from-purple-900/30 to-purple-900/10 border border-purple-500/25',
    badge: 'Recommandé',
    scale: true,
  },
  agency: {
    accent: 'text-cyan-300',
    ctaClass: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:opacity-90 shadow-xl shadow-cyan-500/25',
    checkBg: 'bg-cyan-500/10',
    checkColor: 'text-cyan-400',
    cardClass: 'bg-gradient-to-b from-[#0d2030] to-[#100d20] border border-cyan-500/35',
  },
}

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
      if (!response.ok) throw new Error('Failed to initiate payment')
      const data = await response.json()
      if (data.invoiceUrl) window.location.href = data.invoiceUrl
    } catch (error) {
      console.error('Crypto payment error:', error)
      alert('Erreur lors de l\'initiation du paiement. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-5">
            <Zap size={13} />
            Tarifs transparents · sans engagement
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choisissez votre <span className="gradient-text">formule</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Résiliez quand vous voulez
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center glass rounded-xl p-1 mt-8">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all',
                interval === 'monthly' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              )}>
              Mensuel
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                interval === 'yearly' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              )}>
              Annuel
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>
        </div>

        {/* ── Grille des plans ── */}
        {/* Agency est au centre sur desktop, donc on réordonne pour mobile : Starter, Pro, Agency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => {
            const meta = PLAN_META[plan.id]
            const price = interval === 'monthly' ? plan.price.monthly : plan.price.yearly
            const includedFeatures = plan.features.filter(f => f.included)
            const excludedFeatures = plan.features.filter(f => !f.included)
            const isScaled = !!meta.scale

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl flex flex-col transition-all duration-300',
                  meta.cardClass,
                  isScaled
                    ? 'p-8 md:scale-105 md:z-10 shadow-2xl shadow-black/40'
                    : 'p-7'
                )}>

                {/* Badge Recommandé */}
                {meta.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-sm font-semibold text-white shadow-lg shadow-purple-500/30">
                      <Star size={12} fill="currentColor" />
                      {meta.badge}
                    </div>
                  </div>
                )}

                {/* ── En-tête du plan ── */}
                <div className={cn('mb-6', isScaled && 'mt-2')}>
                  <h3 className={cn('text-xl font-bold mb-1', meta.accent)}>{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-5 leading-relaxed">{plan.description}</p>

                  {/* Prix */}
                  <div className="flex items-end gap-1.5">
                    <span className={cn('font-extrabold tracking-tight', isScaled ? 'text-5xl text-white' : 'text-4xl text-white')}>
                      {price}€
                    </span>
                    <span className="text-gray-500 mb-1.5 text-sm">/mois</span>
                  </div>

                  {interval === 'yearly' && (
                    <p className="text-green-400 text-xs mt-2 font-medium">
                      💰 Économisez {(plan.price.monthly - plan.price.yearly) * 12}€ par an
                    </p>
                  )}
                </div>

                {/* ── CTA ── */}
                <div className="mb-7 space-y-2">
                  <Link
                    href={`/register?plan=${plan.id}&interval=${interval}`}
                    className={cn(
                      'flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-sm',
                      meta.ctaClass
                    )}>
                    Choisir ce plan
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    onClick={() => handleCryptoPay(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="w-full text-center py-1.5 text-xs text-gray-600 hover:text-yellow-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40">
                    <span>{loadingPlan === plan.id ? '⏳' : '₿'}</span>
                    {loadingPlan === plan.id ? 'Chargement...' : 'Payer en crypto (USDT / BTC)'}
                  </button>
                </div>

                {/* ── Séparateur ── */}
                <div className="border-t border-white/8 mb-5" />

                {/* ── Fonctionnalités incluses ── */}
                <ul className="space-y-2.5 flex-1">
                  {includedFeatures.map((f) => (
                    <li key={f.name} className="flex items-center gap-3 text-sm">
                      <span className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                        meta.checkBg
                      )}>
                        <Check size={11} className={meta.checkColor} strokeWidth={2.5} />
                      </span>
                      <span className="text-gray-200">{f.name}</span>
                    </li>
                  ))}
                </ul>

                {/* ── Fonctionnalités non incluses ── */}
                {excludedFeatures.length > 0 && (
                  <>
                    <div className="border-t border-white/5 mt-5 mb-4" />
                    <ul className="space-y-2">
                      {excludedFeatures.map((f) => (
                        <li key={f.name} className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-white/4 flex items-center justify-center flex-shrink-0 flex-shrink-0">
                            <X size={10} className="text-gray-700" strokeWidth={2.5} />
                          </span>
                          <span className="text-gray-600 line-through decoration-gray-700/60">{f.name}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Footer ── */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 text-gray-600 text-sm">
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-gray-700" />
              Paiement sécurisé
            </span>
            <span className="text-gray-800">·</span>
            <span>Sans engagement</span>
            <span className="text-gray-800">·</span>
            <span>Résiliez quand vous voulez</span>
          </div>
        </div>

      </div>
    </section>
  )
}
