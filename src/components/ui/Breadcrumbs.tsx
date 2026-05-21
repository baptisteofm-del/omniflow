'use client'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.icon && <span>{item.icon}</span>}
          {item.href ? (
            <Link 
              href={item.href}
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-300 font-medium">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <ChevronRight size={14} className="text-gray-600" />
          )}
        </div>
      ))}
    </div>
  )
}
