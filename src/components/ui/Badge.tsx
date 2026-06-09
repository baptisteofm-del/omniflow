'use client'

import { ReactNode } from 'react'

export type BadgeVariant = 'purple' | 'cyan' | 'green' | 'amber' | 'red' | 'gray'

const badgeStyles: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
  },
  cyan: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
  },
  amber: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
  },
  gray: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    text: 'text-gray-300',
  },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  pulse?: boolean
}

export function Badge({ variant = 'purple', children, pulse = false }: BadgeProps) {
  const styles = badgeStyles[variant]

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${
        styles.bg
      } ${styles.border} ${styles.text} ${pulse ? 'animate-pulse' : ''}`}
    >
      {pulse && <span className={`w-2 h-2 rounded-full ${styles.bg} animate-pulse`} />}
      {children}
    </span>
  )
}
