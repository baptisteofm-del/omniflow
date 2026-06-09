'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Loader2, Settings2 } from 'lucide-react'
import { RUN_UNITS, RUN_PRICE_EUR } from '@/lib/plans'
import { PromoCodeInput } from '@/components/ui/PromoCodeInput'
import type { PromoDiscount } from '@/lib/promos'

interface CreditsData {
  balance: number
  autoTopup: {
    enabled: boolean
    threshold: number
    amount: number
  }
  lifetimePurchased: number
}

interface Transaction {
  id: string
  created_at: string
  type: 'purchase' | 'consumption' | 'bonus' | 'refund' | 'promo'
  amount: number
  balance_after: number
  description: string
  feature: string | null
}

export function CreditsSection() {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const [runCount, setRunCount] = useState(1)
  const [appliedDiscount, setAppliedDiscount] = useState<PromoDiscount | null>(null)
  const [autoTopupLoading, setAutoTopupLoading] = useState(false)

  useEffect(() => {
    fetchCreditsData()
  }, [])

  const fetchCreditsData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/credits/balance')
      if (res.ok) {
        const data = await res.json()
        setCredits(data)
      }

      // Fetch transactions
      const txRes = await fetch('/api/credits/transactions')
      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = async () => {
    if (!runCount || runCount < 1) return

    setBuyLoading(true)
    try {
      const res = await fetch('/api/credits/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runCount,
          promoCode: appliedDiscount ? undefined : undefined,
        }),
      })

      if (res.ok) {
        const { invoiceUrl } = await res.json()
        if (invoiceUrl) {
          window.location.href = invoiceUrl
        }
      }
    } catch (error) {
      console.error('Error buying credits:', error)
    } finally {
      setBuyLoading(false)
    }
  }

  const handleAutoTopupChange = async (enabled: boolean) => {
    if (!credits) return

    setAutoTopupLoading(true)
    try {
      const res = await fetch('/api/credits/auto-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          threshold: enabled ? credits.autoTopup.threshold : undefined,
          amount: enabled ? credits.autoTopup.amount : undefined,
        }),
      })

      if (res.ok) {
        await fetchCreditsData()
      }
    } catch (error) {
      console.error('Error updating auto topup:', error)
    } finally {
      setAutoTopupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Crédits</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-white/10 rounded" />
          <div className="h-20 bg-white/10 rounded" />
        </div>
      </div>
    )
  }

  if (!credits) {
    return null
  }

  const totalCost = runCount * RUN_PRICE_EUR
  const discount = appliedDiscount
    ? appliedDiscount.type === 'percent'
      ? Math.round((totalCost * appliedDiscount.value) / 100)
      : Math.min(appliedDiscount.value, totalCost)
    : 0
  const finalCost = totalCost - discount

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Solde de crédits</h2>
            </div>
            <p className="text-sm text-gray-400">
              Utilisez les crédits pour les générations IA et les trends Instagram
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Solde actuel</p>
            <p className="text-3xl font-bold text-white">{credits.balance}</p>
            <p className="text-xs text-gray-500 mt-1">crédits</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Acheté à vie</p>
            <p className="text-3xl font-bold text-white">{credits.lifetimePurchased}</p>
            <p className="text-xs text-gray-500 mt-1">crédits</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Progression du solde</p>
            <p className="text-sm font-semibold text-white">
              {credits.balance} / 100
            </p>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${Math.min((credits.balance / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Buy Credits Section */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="font-semibold text-white">Acheter des crédits</h3>
          <p className="text-sm text-gray-400">
            1 RUN = {RUN_UNITS} crédits = {RUN_PRICE_EUR}€
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Run Selector */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nombre de RUNs
              </label>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setRunCount(Math.max(1, runCount - 1))}
                  className="px-3 py-2 hover:bg-white/10 rounded transition-all"
                >
                  −
                </button>
                <input
                  type="number"
                  value={runCount}
                  onChange={(e) => setRunCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-transparent text-center text-white font-semibold focus:outline-none"
                  min="1"
                />
                <button
                  onClick={() => setRunCount(runCount + 1)}
                  className="px-3 py-2 hover:bg-white/10 rounded transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Display */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Coût total
              </label>
              <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/20 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    {discount > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        {totalCost.toFixed(2)}€
                      </p>
                    )}
                    <p className="text-2xl font-bold text-white">
                      {finalCost.toFixed(2)}€
                    </p>
                  </div>
                  {discount > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      −{discount.toFixed(2)}€
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <PromoCodeInput
            onApply={setAppliedDiscount}
            amount={totalCost}
          />

          {/* Buy Button */}
          <button
            onClick={handleBuyCredits}
            disabled={buyLoading || runCount < 1}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 disabled:opacity-50 rounded-lg text-white font-semibold transition-all"
          >
            {buyLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Procéder au paiement
          </button>
        </div>
      </div>

      {/* Auto Top-up Configuration */}
      <div className="glass rounded-2xl p-6 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-white">Auto top-up</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Rechargez automatiquement vos crédits au-dessous d'un certain seuil
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={credits.autoTopup.enabled}
              onChange={(e) => handleAutoTopupChange(e.target.checked)}
              disabled={autoTopupLoading}
              className="w-5 h-5 rounded accent-purple-500"
            />
          </label>
        </div>

        {credits.autoTopup.enabled && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-400 mb-2">Seuil de déclenchement</p>
              <p className="text-lg font-semibold text-white">
                {credits.autoTopup.threshold}
              </p>
              <p className="text-xs text-gray-500">crédits restants</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Montant du recharge</p>
              <p className="text-lg font-semibold text-white">
                {credits.autoTopup.amount}
              </p>
              <p className="text-xs text-gray-500">crédits</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="font-semibold text-white mb-4">
            Historique des transactions (10 dernières)
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-gray-400'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Solde: {tx.balance_after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
