'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function CollapsibleSection({
  icon,
  title,
  defaultOpen = true,
  right,
  children,
}: {
  icon: ReactNode
  title: string
  defaultOpen?: boolean
  right?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          {icon}
          {title}
          <ChevronDown
            className={`h-3.5 w-3.5 text-[color:var(--foreground-muted)] transition-transform ${open ? '' : '-rotate-90'}`}
          />
        </button>
        {right}
      </div>
      {open && children}
    </div>
  )
}
