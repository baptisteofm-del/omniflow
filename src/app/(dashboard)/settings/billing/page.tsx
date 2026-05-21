'use client'

import { Suspense, useState, useEffect } from 'react'
import { CreditCard, Check, ArrowUpRight, X, Calendar, AlertCircle } from 'lucide-react'
import { SkeletonBillingPage, SkeletonCard } from '@/components/ui/Skeleton'
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
}

function BillingContent() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleChangePlan = async (priceId: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/settings/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout', priceId }),
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
                <button
                  onClick={() => handleChangePlan(`price_${plan.id}`)}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 text-sm"
                >
                  {actionLoading ? 'Chargement...' : 'Sélectionner'}
                </button>
              )}
            </div>
          ))}
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
            {/* Would display invoices here when available from Paddle API */}
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
