'use client'

import { Suspense, useState, useEffect } from 'react'
import { CreditCard, Check, ArrowUpRight, X, Calendar, AlertCircle, BarChart3, Clock, Zap, Download, Loader2 } from 'lucide-react'
import { getPlanById, PLANS } from '@/lib/plans'
import { CreditsSection } from '@/components/billing/CreditsSection'
import type { PlanId } from '@/types'

interface BillingData {
  agency: {
    id: string
    name: string
    planId: PlanId
    subscriptionId?: string
    subscriptionStatus?: string
    trialEndsAt?: string
    trialDaysRemaining?: number
  }
  plan: ReturnType<typeof getPlanById>
  subscription?: unknown
  invoices: unknown[]
  usage?: {
    models: number
    postsScheduled: number
    aiGenerations: number
    teamMembers: number
    contentWatches: number
    telegramBots: number
    accountsLinked: number
  }
}

function BillingContentInner() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'crypto' | null>(null)

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch('/api/settings/billing')
        if (!res.ok) throw new Error('Failed to fetch billing')
        const data = await res.json()
        setBillingData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading billing')
      } finally {
        setLoading(false)
      }
    }

    fetchBilling()
  }, [])

  const handleChangePlan = async (planId: string, method: 'card' | 'crypto' = 'card') => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/settings/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          priceId: `price_${planId}`,
          method,
        }),
      })

      if (!res.ok) throw new Error('Failed to initiate checkout')
      const { checkoutUrl } = await res.json()

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr ? Votre abonnement sera annulé à la fin de la période de facturation.')) {
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch('/api/settings/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel-subscription' }),
      })

      if (!res.ok) throw new Error('Failed to cancel subscription')
      setBillingData((prev) =>
        prev
          ? { ...prev, agency: { ...prev.agency, subscriptionStatus: 'canceled' } }
          : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 flex gap-4 items-start border border-red-500/30">
        <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
        <div>
          <h3 className="font-semibold text-red-400">Erreur</h3>
          <p className="text-red-300/80 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-gray-400">Aucune information de facturation disponible</p>
      </div>
    )
  }

  const currentPlan = billingData.plan
  const isTrialing = billingData.agency.subscriptionStatus === 'trialing'
  const isCanceled = billingData.agency.subscriptionStatus === 'canceled'
  const usage = billingData.usage || {}

  // Get plan limits
  const limits = currentPlan?.limits || {}
  const getUsagePercent = (key: keyof typeof limits): number => {
    const limit = limits[key] as number
    const used = usage[key as keyof typeof usage] as number || 0
    if (!limit || limit === -1) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const cryptoPaymentMethods = [
    {
      name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-500 to-yellow-500', bg: '#F7931A',
      logo: <svg viewBox="0 0 32 32" width="20" height="20" fill="white"><path d="M15.9 3C9.1 3 3.6 8.5 3.6 15.3s5.5 12.3 12.3 12.3 12.3-5.5 12.3-12.3S22.7 3 15.9 3zm4.3 14.3c-.2 2.1-1.8 3.1-4 3.4v1.7h-1.5v-1.7h-1.2v1.7H12v-1.7H9.8v-1.9h1.1c.5 0 .7-.1.7-.6v-7.1c0-.5-.2-.6-.7-.6H9.8V8.8H12v-1.7h1.5v1.7h1.2V7.1h1.5v1.7c1.8.2 3.2.9 3.5 2.6.2.9 0 1.8-.9 2.5 1.2.3 1.7 1.2 1.4 3.4zm-3.5-3.1c.4-.1.7-.5.7-1.1 0-.7-.4-1.1-1.2-1.2H14v2.5h1.9c.3 0 .6-.1.8-.2zm.8 2.6c0-.8-.5-1.3-1.6-1.3H14v2.8h1.9c1.1 0 1.6-.5 1.6-1.5z"/></svg>
    },
    {
      name: 'Ethereum', symbol: 'ETH', color: 'from-blue-500 to-purple-500', bg: '#627EEA',
      logo: <svg viewBox="0 0 32 32" width="20" height="20" fill="white"><path opacity=".6" d="M16 4L8 16.5l8 4.7 8-4.7z"/><path d="M16 4l8 12.5-8 4.7V4z"/><path opacity=".6" d="M16 26.8L8 18.8l8 4.5 8-4.5z"/><path d="M16 23.3l8-4.5-8 8z"/></svg>
    },
    {
      name: 'USD Coin', symbol: 'USDC', color: 'from-blue-400 to-cyan-400', bg: '#2775CA',
      logo: <svg viewBox="0 0 32 32" width="20" height="20" fill="white"><circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="2"/><text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">$</text></svg>
    },
  ]

  return (
    <div className="space-y-8">
      {/* Trial banner */}
      {isTrialing && billingData.agency.trialDaysRemaining !== undefined && (
        <div className="glass rounded-2xl p-4 border border-purple-500/30 bg-purple-500/10 flex gap-3">
          <AlertCircle className="text-purple-400 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-300">
              Essai gratuit — {billingData.agency.trialDaysRemaining} jours restants
            </p>
            <p className="text-xs text-purple-300/70">
              Votre essai gratuit prend fin le {new Date(billingData.agency.trialEndsAt!).toLocaleDateString('fr-FR')}
            </p>
            {/* Trial progress bar */}
            <div className="mt-3 w-full bg-purple-900/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                style={{ width: `${Math.max((billingData.agency.trialDaysRemaining / 7) * 100, 0)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current plan card */}
      {currentPlan && (
        <div className="glass rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400">Plan actuel</p>
              <h2 className="text-3xl font-bold">{currentPlan.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{currentPlan.description}</p>
            </div>
            {currentPlan.highlighted && (
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-xs font-semibold">
                Populaire
              </div>
            )}
          </div>

          {/* Plan details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Cycle de facturation</p>
              <p className="text-sm font-semibold mt-1">
                {billingData.agency.subscriptionStatus === 'active' ? 'Actif' : billingData.agency.subscriptionStatus === 'trialing' ? 'En essai' : 'Actif'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Prochain renouvellement</p>
              <p className="text-sm font-semibold mt-1">
                {billingData.agency.trialEndsAt
                  ? new Date(billingData.agency.trialEndsAt).toLocaleDateString('fr-FR')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Statut</p>
              <p className={`text-sm font-semibold mt-1 ${
                isCanceled ? 'text-red-400' : isTrialing ? 'text-purple-400' : 'text-green-400'
              }`}>
                {isCanceled ? 'Annulé' : isTrialing ? 'En essai' : 'Actif'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                // Show plan selection modal or redirect to upgrade
                const urlParams = new URLSearchParams(window.location.search)
                urlParams.set('change-plan', 'true')
                window.location.href = `?${urlParams.toString()}`
              }}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
            >
              <ArrowUpRight size={16} />
              Changer de plan
            </button>

            {billingData.agency.subscriptionStatus === 'active' && !isCanceled && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-semibold rounded-lg transition-all duration-200"
              >
                <X size={16} />
                Annuler l'abonnement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Usage & Limits Section */}
      {Object.keys(usage).length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-400" />
            <h2 className="font-semibold text-white">Limites & Utilisation</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[
                { key: 'models', label: 'Modèles gérées', icon: null },
                { key: 'postsScheduled', label: 'Posts schedulés', icon: null },
                { key: 'aiGenerations', label: 'Générations IA', icon: null },
                { key: 'teamMembers', label: 'Membres équipe', icon: null },
                { key: 'contentWatches', label: 'Veilles contenu', icon: null },
                { key: 'telegramBots', label: 'Bots Telegram', icon: null },
              ].map(item => {
                const usageKey = item.key as keyof typeof usage
                const limitKey = (item.key === 'postsScheduled' ? 'postSchedules' :
                                  item.key === 'aiGenerations' ? 'aiGenerations' :
                                  item.key === 'teamMembers' ? 'teamMembers' :
                                  item.key === 'contentWatches' ? 'contentWatches' :
                                  item.key === 'telegramBots' ? 'telegramBots' :
                                  'models') as keyof typeof limits
                const limit = limits[limitKey] as number
                const used = usage[usageKey] as number || 0

                if (limit === undefined) return null

                const percent = limit === -1 ? 0 : (used / limit) * 100
                const isUnlimited = limit === -1
                const isWarning = percent > 80 && percent < 100
                const isMax = percent >= 100

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">{item.label}</label>
                      <span className={`text-sm font-semibold ${
                        isMax ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-gray-300'
                      }`}>
                        {used}/{isUnlimited ? '∞' : limit}
                      </span>
                    </div>
                    {!isUnlimited && (
                      <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isMax ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Plan comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Explorer les plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                plan.id === currentPlan?.id
                  ? 'ring-2 ring-purple-500'
                  : 'hover:border-purple-500/30'
              }`}
            >
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-1">{plan.name}</h4>
                <p className="text-xs text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-2xl font-bold">
                  {plan.price.monthly}€<span className="text-sm text-gray-400">/mois</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">ou <strong className="text-gray-300">{plan.price.yearly}€/mois</strong> facturé annuellement</p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6 flex-1">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {feature.included ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <X size={14} className="text-gray-600" />
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {plan.id !== currentPlan?.id && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleChangePlan(plan.id, 'card')}
                    disabled={actionLoading}
                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 text-sm"
                  >
                    {actionLoading ? 'Chargement...' : 'Choisir ce plan'}
                  </button>
                </div>
              )}
              {plan.id === currentPlan?.id && (
                <div className="w-full py-2 px-4 bg-green-500/20 text-green-400 text-center font-semibold rounded-lg text-sm">
                  ✓ Plan actuel
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Mode de paiement</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Payment */}
            <button
              onClick={() => {
                setSelectedMethod('card')
                alert('Redirection vers Paddle pour paiement par carte...')
              }}
              className="flex items-center gap-4 p-4 glass rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <CreditCard size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white">Payer par carte</p>
                <p className="text-xs text-gray-400">Visa, Mastercard, Amex</p>
              </div>
              <ArrowUpRight size={18} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            </button>

            {/* Crypto Payment */}
            <button
              onClick={() => setSelectedMethod('crypto')}
              className="flex items-center gap-4 p-4 glass rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                <Zap size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white">Payer en crypto</p>
                <p className="text-xs text-gray-400">Bitcoin · Ethereum · USDC</p>
              </div>
              <ArrowUpRight size={18} className="text-gray-400 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>

          {/* Crypto methods expansion */}
          {selectedMethod === 'crypto' && (
            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-gray-300 mb-4">Choisissez une cryptomonnaie :</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cryptoPaymentMethods.map(method => (
                  <button
                    key={method.name}
                    onClick={() => handleChangePlan(currentPlan?.id || 'starter', 'crypto')}
                    disabled={actionLoading}
                    className={`p-4 rounded-lg bg-gradient-to-br ${method.color} text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-xl mb-1">{method.symbol}</div>
                    {actionLoading ? '...' : method.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credits Section */}
      <Suspense fallback={<div>Chargement...</div>}>
        <CreditsSection />
      </Suspense>

      {/* Invoices section */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-purple-400" />
          Historique des factures
        </h3>

        {billingData.invoices && billingData.invoices.length > 0 ? (
          <div className="space-y-2">
            {billingData.invoices.map((invoice: any, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-white">{invoice.description || 'Facture'}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-white">{invoice.amount}€</p>
                  <p className="text-xs text-gray-400 capitalize">{invoice.status || 'payée'}</p>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Download size={18} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucune facture disponible pour le moment
          </p>
        )}
      </div>
    </div>
  )
}

export default function BillingContent() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={32} /></div>}>
      <BillingContentInner />
    </Suspense>
  )
}
