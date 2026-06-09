'use client'

import { ReactNode } from 'react'

interface SectionTitleProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function SectionTitle({
  title,
  subtitle,
  actions,
  className = '',
}: SectionTitleProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 ${className}`}>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
