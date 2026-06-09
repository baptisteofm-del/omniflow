'use client'

import { LucideIcon } from 'lucide-react'
import React, { ReactNode } from 'react'

interface PageHeaderProps {
  icon: LucideIcon
  iconColor?: string        // ex: 'text-purple-400'
  iconBg?: string           // ex: 'bg-purple-500/10'
  title: React.ReactNode
  subtitle?: string
  badge?: string            // badge texte (ex: 'Pro', 'Beta')
  badgeColor?: string       // couleur badge
  actions?: ReactNode       // boutons action à droite
}

export function PageHeader({
  icon: Icon,
  iconColor = 'text-purple-400',
  iconBg = 'bg-purple-500/10',
  title,
  subtitle,
  badge,
  badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Header content */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon square */}
          <div className={`${iconBg} p-3 rounded-xl h-fit flex-shrink-0`}>
            <Icon size={20} className={iconColor} />
          </div>

          {/* Title section */}
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {badge && (
                <span className={`px-2.5 py-1 ${badgeColor} border rounded-full text-xs font-semibold tracking-wide`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
      </div>

      {/* Separator */}
      <div className="border-b border-white/5 pb-6" />
    </div>
  )
}
