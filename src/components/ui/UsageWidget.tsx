'use client'
import { useState, useEffect } from 'react'
import { Zap, Users, Calendar, Bot, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UsageData {
  plan: { id: string; name: string; price: { monthly: number } }
  usage: Record<string, { current: number; limit: number }>
}

export function UsageWidget() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !data) return null

  const { plan, usage } = data

  const items = [
    { key: 'models', label: 'Modèles', icon: <Users size={14} />, color: 'from-violet-500 to-violet-600' },
    { key: 'postSchedules', label: 'Posts/mois', icon: <Calendar size={14} />, color: 'from-cyan-500 to-cyan-600' },
    { key: 'aiGenerations', label: 'Générations IA', icon: <Zap size={14} />, color: 'from-amber-500 to-orange-500' },
    { key: 'telegramBots', label: 'Bots Telegram', icon: <Bot size={14} />, color: 'from-blue-500 to-blue-600' },
  ].filter(item => (usage[item.key]?.limit ?? -1) !== -1) // hide unlimited

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-center">
        <p className="text-xs text-gray-400">✨ Plan {plan.name} — Tout illimité</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Utilisation</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-medium">
          {plan.name}
        </span>
      </div>

      {items.map(item => {
        const u = usage[item.key]
        if (!u) return null
        const pct = u.limit > 0 ? Math.min((u.current / u.limit) * 100, 100) : 0
        const isCritical = pct >= 90
        const isWarning = pct >= 70 && pct < 90

        return (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-gray-500'}>{item.icon}</span>
                {item.label}
              </div>
              <span className={`text-xs font-semibold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-gray-400'}`}>
                {u.current.toLocaleString('fr-FR')}/{u.limit === -1 ? '∞' : u.limit.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  isCritical ? 'from-red-500 to-red-600' :
                  isWarning ? 'from-amber-500 to-orange-500' :
                  item.color
                } transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {isCritical && (
              <p className="text-xs text-red-400 mt-0.5">⚠ Limite presque atteinte</p>
            )}
          </div>
        )
      })}

      <Link
        href="/settings/billing"
        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium hover:from-purple-500/30 hover:to-cyan-500/30 transition-all mt-1"
      >
        Voir les plans <ArrowRight size={12} />
      </Link>
    </div>
  )
}
