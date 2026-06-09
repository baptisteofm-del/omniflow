'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import type { PromoDiscount } from '@/lib/promos'

interface PromoCodeInputProps {
  onApply: (discount: PromoDiscount) => void
  planId?: string
  amount?: number
  className?: string
}

export function PromoCodeInput({
  onApply,
  planId,
  amount,
  className = '',
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<
    'idle' | 'valid' | 'invalid' | 'loading'
  >('idle')
  const [discount, setDiscount] = useState<PromoDiscount | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code promo')
      return
    }

    setLoading(true)
    setState('loading')
    setError(null)

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          planId,
          amount,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.valid) {
        setState('invalid')
        setError(data.error || 'Code promo invalide')
        return
      }

      setState('valid')
      setDiscount(data.discount)
      onApply(data.discount)
    } catch (err) {
      setState('invalid')
      setError('Erreur lors de la validation du code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  const handleReset = () => {
    setCode('')
    setState('idle')
    setDiscount(null)
    setError(null)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-white">
        Code promo
      </label>

      {state === 'idle' || state === 'loading' || state === 'invalid' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              if (state === 'invalid') {
                setState('idle')
                setError(null)
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="SUMMER2024..."
            disabled={loading}
            className={`flex-1 px-3 py-2.5 bg-white/5 border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              state === 'invalid'
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-white/10 focus:ring-purple-500/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Appliquer'
            )}
          </button>
        </div>
      ) : null}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Valid Discount Display */}
      {state === 'valid' && discount && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-400">
                Code promo appliqué ✓
              </p>
              <div className="mt-1 space-y-1">
                {discount.type === 'percent' && (
                  <p className="text-xs text-gray-400">
                    Réduction: {discount.value}%
                  </p>
                )}
                {discount.type === 'fixed' && (
                  <p className="text-xs text-gray-400">
                    Réduction: {discount.value}€
                  </p>
                )}
                {discount.type === 'credits' && (
                  <p className="text-xs text-gray-400">
                    {discount.creditsBonus} crédits bonus offerts
                  </p>
                )}
                {discount.finalAmount > 0 && (
                  <p className="text-xs text-gray-300 font-medium">
                    Montant final: {discount.finalAmount.toFixed(2)}€
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Utiliser un autre code
          </button>
        </div>
      )}
    </div>
  )
}
