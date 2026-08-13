'use client'

import { createContext, useContext, useState } from 'react'
import { UserRound, X } from 'lucide-react'

// Design handoff: "Écran intermédiaire: Fan Intelligence repliable en
// panneau" — below `lg` there isn't room for conversation + Fan
// Intelligence side by side, so the panel becomes a toggleable drawer
// instead of a permanently stacked third row squeezing the conversation.
// At `lg` and above it stays exactly the static column it always was
// (no toggle, no overlay — this only changes anything below that
// breakpoint).
const DrawerContext = createContext<{ open: boolean; toggle: () => void } | null>(null)

export function FanIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return <DrawerContext.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>{children}</DrawerContext.Provider>
}

function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawer must be used within FanIntelligenceProvider')
  return ctx
}

export function FanIntelligenceToggleButton() {
  const { toggle } = useDrawer()
  return (
    <button
      onClick={toggle}
      title="Infos fan"
      className="flex items-center justify-center rounded-full border border-[color:var(--border-strong)] p-2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] lg:hidden"
    >
      <UserRound className="h-4 w-4" />
    </button>
  )
}

export function FanIntelligenceDrawer({ children }: { children: React.ReactNode }) {
  const { open, toggle } = useDrawer()
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={toggle} />}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-[360px] max-w-[90vw] transform overflow-y-auto bg-[color:var(--background)] p-4 transition-transform duration-200 lg:static lg:z-auto lg:h-full lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-y-auto lg:bg-transparent lg:p-0 lg:transition-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={toggle}
          className="mb-3 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] lg:hidden"
        >
          <X className="h-4 w-4" />
          Fermer
        </button>
        {children}
      </div>
    </>
  )
}
