'use client'
import { useState, useEffect } from 'react'
import { hasFeature, getUpgradePlan } from '@/lib/plans'

interface UsageData {
  plan: { id: string; name: string }
  usage: Record<string, { current: number; limit: number }>
  agency: { id: string; name: string }
}

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const planId = data?.plan?.id || 'starter'

  return {
    loading,
    planId,
    planName: data?.plan?.name || 'Starter',
    usage: data?.usage || {},
    hasFeature: (feature: string) => hasFeature(planId, feature),
    upgradePlan: getUpgradePlan(planId),
    isLimited: (key: string) => {
      const u = data?.usage[key]
      if (!u || u.limit === -1) return false
      return u.current >= u.limit
    },
    usagePct: (key: string) => {
      const u = data?.usage[key]
      if (!u || u.limit === -1) return 0
      return Math.min((u.current / u.limit) * 100, 100)
    },
  }
}
