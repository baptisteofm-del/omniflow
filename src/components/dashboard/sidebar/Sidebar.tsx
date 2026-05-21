'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Eye, Film, Sparkles, Calendar,
  Bot, BarChart3, MessageSquare, Users, Settings,
  Zap, ChevronRight, CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  {
    section: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { label: 'Veille trends', href: '/content/veille', icon: Eye },
      { label: 'Éditeur & Spoof', href: '/content/editor', icon: Film },
      { label: 'Génération IA', href: '/content/ai-generation', icon: Sparkles },
    ],
  },
  {
    section: 'Distribution',
    items: [
      { label: 'Posting auto', href: '/posting', icon: Calendar },
      { label: 'Bots Telegram', href: '/telegram', icon: Bot },
    ],
  },
  {
    section: 'Opérations',
    items: [
      { label: 'Comptes & Modèles', href: '/accounts', icon: Users },
      { label: 'Finance', href: '/finance', icon: BarChart3 },
      { label: 'Chatting', href: '/chatting', icon: MessageSquare },
    ],
  },
  {
    section: 'Paramètres',
    items: [
      { label: 'Abonnement', href: '/settings/billing', icon: CreditCard },
      { label: 'Équipe', href: '/settings/team', icon: Users },
      { label: 'Intégrations', href: '/settings/integrations', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col glass border-r border-purple-500/20">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="gradient-text">Omniflow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 px-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                        active
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <item.icon size={17} className={active ? 'text-purple-400' : ''} />
                      {item.label}
                      {active && (
                        <ChevronRight size={14} className="ml-auto text-purple-400" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User/plan badge */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Mon Agence</p>
            <p className="text-xs text-purple-400">Plan Pro</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
