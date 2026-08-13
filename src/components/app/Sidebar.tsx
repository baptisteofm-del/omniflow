'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UserRound, MessageSquare, LibraryBig, BarChart3, Settings, ChevronsLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { SignOutButton } from '@/components/app/SignOutButton'
import { formatEuro } from '@/lib/format'

// "Paramétrer" and "Scripts"/"Médias" are not top-level categories anymore
// (owner request) — each is one real page with tabs inside it now
// (/library, /settings), not a sidebar dropdown over the old separate
// routes. The sidebar just links straight to each merged page.
//
const NAV_ITEMS = [
  { href: '/home', label: 'Dashboard', icon: Home, alsoActiveOn: [] as string[] },
  { href: '/creators', label: 'Créatrices', icon: UserRound, alsoActiveOn: [] as string[] },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare, alsoActiveOn: [] as string[] },
  // /scripts/[id] and /media/new stay their own routes (see library/page.tsx)
  // but should still highlight Bibliothèque as the active section.
  { href: '/library', label: 'Bibliothèque', icon: LibraryBig, alsoActiveOn: ['/scripts', '/media'] },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, alsoActiveOn: [] as string[] },
  { href: '/settings', label: 'Paramètres', icon: Settings, alsoActiveOn: [] as string[] },
]

const STORAGE_KEY = 'omniflow_sidebar_collapsed'

export function Sidebar({
  agencyName,
  revenue30d,
}: {
  agencyName: string | null
  revenue30d: { total: number; changePercent: number | null; points: { revenue: number }[] } | null
}) {
  const pathname = usePathname()
  // Starts expanded to match server-rendered HTML (no window on the
  // server) — the saved preference is applied right after mount, in the
  // same frame as the rest of the page's first paint.
  const [collapsed, setCollapsed] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') setCollapsed(true)
  }, [])

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  // Locked-collapsed state reserves only the narrow rail's width in the
  // page's flex layout, so the rest of the app gets that space back
  // permanently. Hovering over the narrow rail temporarily widens it back
  // out as an overlay (doesn't reflow the page) — closes automatically the
  // moment the mouse leaves.
  const expanded = !collapsed || hovering

  return (
    <>
      <div className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 transition-[width] duration-200`} />
      <aside
        onMouseEnter={() => collapsed && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        // Explicit inline background instead of stacking the .gradient-ambient
        // class on top of a bg-* utility — both set the `background`
        // property, and letting two separate stylesheet rules fight over
        // shorthand vs longhand was exactly the kind of thing that could
        // silently render as "still just black" depending on rule order.
        // One shorthand value, guaranteed: two colored washes over the
        // surface tone, not pure background black.
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 15% 0%, rgba(124,58,237,0.28) 0%, transparent 65%), radial-gradient(ellipse 60% 35% at 100% 25%, rgba(34,211,238,0.2) 0%, transparent 65%), var(--surface)',
        }}
        className={`fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden border-r border-[color:var(--border)] px-4 py-6 transition-[width] duration-200 ${
          expanded ? 'w-56' : 'w-16'
        } ${collapsed && hovering ? 'shadow-[8px_0_32px_rgba(0,0,0,0.5)]' : ''}`}
      >
        {/* Logo now lives in the full-width TopBar above, not duplicated here. */}
        {!collapsed && (
          <div className="mb-1 flex items-center justify-end px-2">
            <button
              onClick={toggle}
              title="Réduire la barre latérale"
              className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        )}
        {expanded && agencyName && (
          <p className="mb-6 truncate whitespace-nowrap px-2 text-xs text-[color:var(--foreground-muted)]">{agencyName}</p>
        )}
        {!expanded && <div className="mb-6" />}

        <nav className="flex-1 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              item.alsoActiveOn.some((p) => pathname === p || pathname.startsWith(`${p}/`))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={expanded ? undefined : item.label}
                className={`flex items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'gradient-bg-signature text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]'
                    : 'text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {expanded && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Revenus (30j) — design handoff reference. Real numbers only:
            revenue30d comes from the same getRevenueMetrics()/
            getRevenueTimeSeries() the Dashboard's own chart uses (see
            (app)/layout.tsx), never a placeholder figure. Hidden entirely
            while collapsed — there's no room to show it honestly at 64px. */}
        {expanded && revenue30d && (
          <div className="mb-3 shrink-0 rounded-2xl border border-[color:var(--border)] bg-white/[0.03] p-3">
            <p className="text-[10px] text-[color:var(--foreground-muted)]">Revenus (30j)</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-lg font-semibold">{formatEuro(revenue30d.total)}</span>
              {revenue30d.changePercent !== null && (
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    revenue30d.changePercent >= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]'
                  }`}
                >
                  {revenue30d.changePercent >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {Math.abs(Math.round(revenue30d.changePercent * 10) / 10)}%
                </span>
              )}
            </div>
            {revenue30d.points.length > 1 && (
              <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-2 h-7 w-full">
                <polyline
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                  points={revenue30d.points
                    .map((p, i) => {
                      const max = Math.max(...revenue30d.points.map((q) => q.revenue), 1)
                      const x = (i / (revenue30d.points.length - 1)) * 100
                      const y = 26 - (p.revenue / max) * 24
                      return `${x},${y}`
                    })
                    .join(' ')}
                />
              </svg>
            )}
            <Link
              href="/analytics"
              className="mt-2 block rounded-full border border-[color:var(--border-strong)] py-1.5 text-center text-[10px] font-medium text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              Voir analytics
            </Link>
          </div>
        )}

        <div className="space-y-1 overflow-hidden border-t border-[color:var(--border)] px-2 pt-4">
          {/* BUG FIX (owner report: "je ne peux pas la laisser ouverte") —
              this button used to require `!hovering` to render, but hovering
              becomes true the instant the mouse enters the rail to reach it,
              which unmounted the button before a click could land on it.
              There was no way to permanently pin the sidebar open by mouse.
              Keeping it mounted whenever collapsed (hovering or not) fixes
              that — it now shows for real, even during the hover-expanded
              overlay. */}
          {collapsed && (
            <button
              onClick={toggle}
              title="Ouvrir la barre latérale"
              className="flex w-full items-center justify-center rounded-xl py-2 text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]"
            >
              <ChevronsLeft className="h-4 w-4 rotate-180" />
            </button>
          )}
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
