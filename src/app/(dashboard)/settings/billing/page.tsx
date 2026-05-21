'use client'

import { Suspense, useState, useEffect } from 'react'
import { CreditCard, Check, ArrowUpRight, X, Calendar, AlertCircle, BarChart3, Clock, Zap, Download } from 'lucide-react'
import { SkeletonBillingPage } from '@/components/ui/Skeleton'
import { getPlanById, PLANS } from '@/lib/plans'
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

function BillingContent() {
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
    return <SkeletonBillingPage />
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="glass rounded-2xl p-6 flex gap-4 items-start border border-red-500/30">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-red-400">Erreur</h3>
            <p className="text-red-300/80 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!billingData) {
    return (
      <div className="p-8">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-gray-400">Aucune information de facturation disponible</p>
        </div>
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
    { name: 'Bitcoin', symbol: '₿', color: 'from-orange-600 to-yellow-600' },
    { name: 'Ethereum', symbol: 'Ξ', color: 'from-blue-600 to-purple-600' },
    { name: 'USDT', symbol: '$', color: 'from-green-600 to-emerald-600' },
    { name: 'Solana', symbol: '◎', color: 'from-purple-600 to-pink-600' },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="text-purple-400" />
          Facturation & Abonnement
        </h1>
        <p className="text-gray-400 mt-1">Gérez votre plan et vos paiements</p>
      </div>

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
                {billingData.agency.subscriptionStatus === 'active' ? 'Actif' : 'Essai gratuit'}
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
                { key: 'models', label: 'Modèles gérées', icon: '👤' },
                { key: 'postsScheduled', label: 'Posts schedulés', icon: '📅' },
                { key: 'aiGenerations', label: 'Générations IA', icon: '✨' },
                { key: 'teamMembers', label: 'Membres équipe', icon: '👥' },
                { key: 'contentWatches', label: 'Veilles contenu', icon: '👀' },
                { key: 'telegramBots', label: 'Bots Telegram', icon: '🤖' },
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
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </label>
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
                <p className="text-xs text-gray-500 mt-1">{plan.price.yearly}€/an (facturation annuelle)</p>
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
                <p className="text-xs text-gray-400">BTC, ETH, USDT, SOL</p>
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
                    onClick={() => {
                      alert(`Redirection vers NOWPayments pour ${method.name}...`)
                    }}
                    className={`p-4 rounded-lg bg-gradient-to-br ${method.color} text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all`}
                  >
                    <div className="text-xl mb-1">{method.symbol}</div>
                    {method.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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

export default function BillingPage() {
  return (
    <Suspense fallback={<SkeletonBillingPage />}>
      <BillingContent />
    </Suspense>
  )
}
