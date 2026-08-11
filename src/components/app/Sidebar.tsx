'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  UserRound,
  MessageSquare,
  LibraryBig,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronDown,
} from 'lucide-react'
import { SignOutButton } from '@/components/app/SignOutButton'
import { NotificationBell } from '@/components/app/NotificationBell'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  conversation_id: string | null
  read_at: string | null
  created_at: string
}

type NavItem =
  | { type: 'link'; href: string; label: string; icon: typeof Home }
  | { type: 'group'; id: string; label: string; icon: typeof Home; children: { href: string; label: string }[] }

// "Paramétrer" and "Scripts"/"Médias" are deliberately not top-level
// categories (owner request: too many separate categories) — grouped here
// instead, so the sidebar names 6 things, not 9.
const NAV_ITEMS: NavItem[] = [
  { type: 'link', href: '/home', label: 'Dashboard', icon: Home },
  { type: 'link', href: '/creators', label: 'Créatrices', icon: UserRound },
  { type: 'link', href: '/inbox', label: 'Inbox', icon: MessageSquare },
  {
    type: 'group',
    id: 'library',
    label: 'Bibliothèque',
    icon: LibraryBig,
    children: [
      { href: '/media', label: 'Médias' },
      { href: '/scripts', label: 'Scripts' },
    ],
  },
  { type: 'link', href: '/analytics', label: 'Analytics', icon: BarChart3 },
  {
    type: 'group',
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [
      { href: '/settings/ai', label: 'IA' },
      { href: '/settings/billing', label: 'Facturation' },
      { href: '/settings/team', label: 'Équipe' },
    ],
  },
]

function isChildActive(pathname: string, children: { href: string }[]) {
  return children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))
}

const STORAGE_KEY = 'omniflow_sidebar_collapsed'

export function Sidebar({
  agencyName,
  agencyId,
  initialNotifications,
}: {
  agencyName: string | null
  agencyId: string | null
  initialNotifications: Notification[]
}) {
  const pathname = usePathname()
  // Starts expanded to match server-rendered HTML (no window on the
  // server) — the saved preference is applied right after mount, in the
  // same frame as the rest of the page's first paint.
  const [collapsed, setCollapsed] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const item of NAV_ITEMS) {
      if (item.type === 'group' && isChildActive(pathname, item.children)) initial.add(item.id)
    }
    return initial
  })
  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

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
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-[color:var(--border)] bg-[color:var(--background)] px-4 py-6 transition-[width] duration-200 ${
          expanded ? 'w-56' : 'w-16'
        } ${collapsed && hovering ? 'shadow-[8px_0_32px_rgba(0,0,0,0.5)]' : ''}`}
      >
        <div className="mb-1 flex items-center justify-between px-2">
          <Link href="/home" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full" />
            {expanded && (
              <span className="whitespace-nowrap font-semibold">
                Omni<span className="gradient-text">Flow</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={toggle}
              title="Réduire la barre latérale"
              className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {expanded && agencyName && (
          <p className="mb-6 truncate whitespace-nowrap px-2 text-xs text-[color:var(--foreground-muted)]">{agencyName}</p>
        )}
        {!expanded && <div className="mb-6" />}

        <nav className="flex-1 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon

            if (item.type === 'link') {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={expanded ? undefined : item.label}
                  className={`flex items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]'
                      : 'text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {expanded && item.label}
                </Link>
              )
            }

            // Group: in the narrow icon rail, clicking jumps straight to the
            // first child (no room for a flyout there) — expanded mode gets
            // a real accordion instead.
            const groupActive = isChildActive(pathname, item.children)
            const isOpen = expanded && openGroups.has(item.id)
            return (
              <div key={item.id}>
                {expanded ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={`flex w-full items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      groupActive
                        ? 'text-[color:var(--foreground)]'
                        : 'text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={item.children[0].href}
                    title={item.label}
                    className={`flex items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors ${
                      groupActive
                        ? 'bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]'
                        : 'text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </Link>
                )}
                {isOpen && (
                  <div className="ml-4 space-y-0.5 border-l border-[color:var(--border)] pl-3">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block overflow-hidden whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                            isActive
                              ? 'text-[color:var(--foreground)]'
                              : 'text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
                          }`}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="space-y-1 overflow-hidden border-t border-[color:var(--border)] px-2 pt-4">
          {collapsed && !hovering && (
            <button
              onClick={toggle}
              title="Ouvrir la barre latérale"
              className="flex w-full items-center justify-center rounded-xl py-2 text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]"
            >
              <ChevronsLeft className="h-4 w-4 rotate-180" />
            </button>
          )}
          {agencyId && <NotificationBell agencyId={agencyId} initialNotifications={initialNotifications} />}
          <SignOutButton />
        </div>
      </aside>
    </>
  )
}
