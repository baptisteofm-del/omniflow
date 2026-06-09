'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Bot, Users, Sparkles, RefreshCw, TrendingUp } from 'lucide-react'
import { PLANS, RUN_PRICE_EUR, RUN_UNITS } from '@/lib/plans'
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

  // Afficher uniquement les plans payants (starter, pro, agency)
  const displayPlans = PLANS.filter(p => p.id !== 'trial')

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 gradient-bg">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choisissez votre <span className="gradient-text">formule</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            7 jours d'essai gratuit · Résiliez quand vous voulez
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setInterval('monthly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all',
                interval === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              )}>
              Mensuel
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={cn(
                'px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                interval === 'yearly' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              )}>
              Annuel
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* ── Plans ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {displayPlans.map((plan) => {
            const price = interval === 'monthly' ? plan.price.monthly : plan.price.yearly
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-2xl p-8 flex flex-col',
                  plan.highlighted
                    ? 'bg-gradient-to-b from-purple-900/60 to-purple-800/20 border border-purple-500/50 glow'
                    : 'glass'
                )}>

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
                    <span className="text-4xl font-bold">{price}€</span>
                    <span className="text-gray-400 mb-1">/mois</span>
                  </div>
                  {interval === 'yearly' && (
                    <p className="text-green-400 text-sm mt-1">
                      Économisez {(plan.price.monthly - plan.price.yearly) * 12}€/an
                    </p>
                  )}
                </div>

                {/* ── Key specs ── */}
                <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-white/5 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{plan.limits.models}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Sparkles size={9} />modèles
                    </div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="text-lg font-bold text-white">{plan.limits.telegramBots}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Bot size={9} />bots
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{plan.limits.teamMembers}</div>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Users size={9} />membres
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/register?plan=${plan.id}&interval=${interval}`}
                  className={cn(
                    'block text-center py-3 rounded-xl font-semibold transition-all mb-2',
                    plan.highlighted
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 glow-sm'
                      : 'glass border border-purple-500/30 hover:border-purple-500/60 hover:text-white'
                  )}>
                  Essai gratuit 7 jours
                </Link>

                {/* Crypto */}
                <button
                  onClick={() => handleCryptoPay(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className="w-full text-center py-2 text-sm text-gray-400 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2 mb-6 disabled:opacity-50">
                  <span>{loadingPlan === plan.id ? '⏳' : '₿'}</span>
                  {loadingPlan === plan.id ? 'Chargement...' : 'Payer en crypto (USDT/BTC)'}
                </button>

                {/* Features list */}
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.name} className="flex items-center gap-3 text-sm">
                      {f.included
                        ? <Check size={16} className="text-green-400 flex-shrink-0" />
                        : <X size={16} className="text-gray-600 flex-shrink-0" />}
                      <span className={f.included ? 'text-gray-200' : 'text-gray-500'}>
                        {f.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ── Veille Instagram ── */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-pink-400" />
                <h3 className="text-xl font-bold">Veille Instagram quotidienne</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Chaque matin, Omniflow analyse automatiquement les meilleurs contenus Instagram
                et vous propose les trends les plus performantes — adaptées à votre niche.
              </p>
              <p className="text-gray-500 text-xs">
                Système de recommandation évolutif : aimez ou ignorez les trends pour affiner vos suggestions.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
              <div className="glass rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-xs text-gray-400 mt-0.5">trends/jour</div>
                <div className="text-xs text-pink-400 font-medium mt-1">Starter</div>
              </div>
              <div className="glass rounded-xl px-5 py-3 border border-purple-500/30">
                <div className="text-2xl font-bold text-white">10</div>
                <div className="text-xs text-gray-400 mt-0.5">trends/jour</div>
                <div className="text-xs text-purple-400 font-medium mt-1">Pro</div>
              </div>
              <div className="glass rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">20</div>
                <div className="text-xs text-gray-400 mt-0.5">trends/jour</div>
                <div className="text-xs text-cyan-400 font-medium mt-1">Agency</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Système RUN ── */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw size={20} className="text-cyan-400" />
                <h3 className="text-xl font-bold">Système RUN</h3>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Dépassez votre quota mensuel à la demande, sans engagement.
                Chaque RUN génère <strong className="text-white">{RUN_UNITS} unités</strong> au choix :
                générations IA ou nouvelles trends Instagram.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mt-3">
                <li className="flex items-center gap-2"><Check size={12} className="text-green-400" />10 générations IA supplémentaires</li>
                <li className="flex items-center gap-2"><Check size={12} className="text-green-400" />10 nouvelles trends Instagram</li>
                <li className="flex items-center gap-2"><Check size={12} className="text-green-400" />Valable 30 jours</li>
              </ul>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="glass rounded-2xl px-10 py-6 border border-cyan-500/20">
                <div className="text-5xl font-bold gradient-text mb-1">{RUN_PRICE_EUR}€</div>
                <div className="text-gray-400 text-sm">par RUN</div>
                <div className="text-gray-500 text-xs mt-2">{RUN_UNITS} générations incluses</div>
                <div className="text-xs text-cyan-400 mt-1">{(RUN_PRICE_EUR / RUN_UNITS).toFixed(2)}€ / génération</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            ✓ Période d'essai 7 jours · Aucun engagement · Annulation en 1 clic
          </p>
        </div>

      </div>
    </section>
  )
}
