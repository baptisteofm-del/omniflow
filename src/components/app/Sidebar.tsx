'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, UserRound, MessageSquare, Workflow, ImageIcon } from 'lucide-react'
import { SignOutButton } from '@/components/app/SignOutButton'

const NAV_ITEMS = [
  { href: '/home', label: 'Accueil', icon: Home },
  { href: '/creators', label: 'Créatrices', icon: UserRound },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/scripts', label: 'Scripts', icon: Workflow },
  { href: '/media', label: 'Médias', icon: ImageIcon },
]

export function Sidebar({ agencyName }: { agencyName: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-[color:var(--border)] px-4 py-6">
      <Link href="/home" className="mb-1 flex items-center gap-2 px-2">
        <Image src="/logo-mark.png" alt="" width={24} height={24} className="h-6 w-6 rounded-full" />
        <span className="font-semibold">
          Omni<span className="gradient-text">Flow</span>
        </span>
      </Link>
      {agencyName && <p className="mb-6 px-2 text-xs text-[color:var(--foreground-muted)]">{agencyName}</p>}

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]'
                  : 'text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[color:var(--border)] px-2 pt-4">
        <SignOutButton />
      </div>
    </aside>
  )
}
