'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface StatCardProps {
  icon: LucideIcon
  iconColor?: string
  label: string
  value: string | number
  sub?: string              // sous-valeur ou tendance
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string       // ex: '+12%'
  href?: string             // lien cliquable
  loading?: boolean
}

export function StatCard({
  icon: Icon,
  iconColor = 'text-purple-400',
  label,
  value,
  sub,
  trend,
  trendValue,
  href,
  loading = false,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  const content = (
    <div className="relative">
      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
          <Icon size={18} className={iconColor} />
        </div>
        {TrendIcon && <TrendIcon size={16} className={trendColor} />}
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-7 w-24 bg-white/10 rounded-lg animate-pulse mb-2" />
      ) : (
        <div className="text-2xl font-bold text-white tabular-nums mb-1">{value}</div>
      )}

      {/* Label */}
      <div className="text-xs text-gray-400 mb-1">{label}</div>

      {/* Sub + Trend Value */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">{sub}</div>
        {trendValue && <span className={`text-xs font-semibold ${trendColor}`}>{trendValue}</span>}
      </div>
    </div>
  )

  const card = (
    <div className="group relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-5 h-full flex flex-col justify-between">
        {content}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href}>
        <div className="glass rounded-2xl border border-white/8 group-hover:border-purple-500/20 hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] group">
          {card}
        </div>
      </Link>
    )
  }

  return (
    <div className="glass rounded-2xl bg-white/3 border border-white/8 p-5">
      {content}
    </div>
  )
}
