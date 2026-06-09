'use client'

import { ReactNode } from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/30',
  secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30',
}

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: 'px-3 py-1.5', fontSize: 'text-xs' },
  md: { padding: 'px-4 py-2', fontSize: 'text-sm' },
  lg: { padding: 'px-6 py-3', fontSize: 'text-base' },
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: LucideIcon
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyle = sizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 ${
        sizeStyle.padding
      } ${sizeStyle.fontSize} ${variantStyles[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}
