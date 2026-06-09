'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CreditsData {
  balance: number
  autoTopup: {
    enabled: boolean
    threshold: number
    amount: number
  }
  lifetimePurchased: number
}

export function CreditsWidget() {
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/credits/balance')
        if (res.ok) {
          const data = await res.json()
          setCredits(data)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [])

  if (loading || !credits) {
    return null
  }

  const progressPercentage = Math.min((credits.balance / 100) * 100, 100)

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Crédits</h3>
        </div>
        {credits.autoTopup.enabled && (
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
            Auto top-up
          </span>
        )}
      </div>

      {/* Balance Display */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">
          {credits.balance}
        </span>
        <span className="text-xs text-gray-400">crédits</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          1 crédit = 1 génération IA ou 1 trend
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500">Acheté à vie</p>
          <p className="text-sm font-semibold text-white">
            {credits.lifetimePurchased}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Seuil auto top-up</p>
          <p className="text-sm font-semibold text-white">
            {credits.autoTopup.threshold}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href="/settings/billing"
        className="w-full flex items-center justify-between p-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Acheter</span>
        </div>
        <ChevronRight className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  )
}
