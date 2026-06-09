'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
  actionNode?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  actionNode,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon circle */}
      <div className="p-4 rounded-2xl bg-white/5 mb-4">
        <Icon size={40} className="text-gray-600" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-2 text-center">{title}</h3>

      {/* Subtitle */}
      {subtitle && <p className="text-xs text-gray-500 text-center mb-6 max-w-xs">{subtitle}</p>}

      {/* Action button or custom node */}
      {actionNode}
      {action && !actionNode && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
