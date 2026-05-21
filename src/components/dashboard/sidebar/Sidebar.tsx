'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Eye, Film, Sparkles, Calendar,
  Bot, BarChart3, MessageSquare, Users, Settings,
  Zap, ChevronRight, CreditCard, User, Gift, Menu, X, Clapperboard
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  {
    section: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Parrainage', href: '/referral', icon: Gift, badge: '10%' },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { label: 'Veille trends', href: '/content/veille', icon: Eye },
      { label: 'Éditeur & Spoof', href: '/content/editor', icon: Film },
      { label: 'Génération IA', href: '/content/ai-generation', icon: Sparkles },
      { label: 'Banque de médias', href: '/media', icon: Clapperboard },
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
      {
        label: 'Chatting',
        href: '/chatting',
        icon: MessageSquare,
        submenu: [
          { label: 'Rapports', href: '/chatting' },
          { label: 'Chatting IA', href: '/chatting/ai' },
        ],
      },
    ],
  },
  {
    section: 'Paramètres',
    items: [
      { label: 'Profil', href: '/settings/profile', icon: User },
      { label: 'Abonnement', href: '/settings/billing', icon: CreditCard },
      { label: 'Équipe', href: '/settings/team', icon: Users },
      { label: 'Intégrations', href: '/settings/integrations', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass border border-purple-500/20 hover:border-purple-500/40 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 left-0 w-64 h-screen flex flex-col glass border-r border-purple-500/20 z-40 transition-transform duration-300",
          "lg:translate-x-0 lg:flex-shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-tutorial="sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/20">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={closeSidebar}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="gradient-text">OmniFlow</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navItems.map((section) => (
            <div key={section.section}>
              <p 
                className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 px-2"
                data-tutorial={section.section === 'Paramètres' ? 'settings-integrations' : undefined}
              >
                {section.section}
              </p>
              <ul className="space-y-1">
                {section.items.map((item: any) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  const isSubmenuExpanded = expandedSubmenu === item.href
                  const hasSubmenu = item.submenu && item.submenu.length > 0
                  return (
                    <li key={item.href}>
                      {hasSubmenu ? (
                        <>
                          <button
                            onClick={() => setExpandedSubmenu(isSubmenuExpanded ? null : item.href)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                              active
                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                          >
                            <item.icon size={17} className={active ? 'text-purple-400' : ''} />
                            {item.label}
                            {item.badge && (
                              <span className="ml-auto text-xs font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight
                              size={14}
                              className={cn(
                                'ml-auto transition-transform',
                                isSubmenuExpanded ? 'rotate-90 text-purple-400' : 'text-gray-600'
                              )}
                            />
                          </button>
                          {isSubmenuExpanded && (
                            <ul className="space-y-1 mt-1 ml-4 border-l border-purple-500/20 pl-3">
                              {item.submenu.map((subitem: any) => {
                                const subActive = pathname === subitem.href
                                return (
                                  <li key={subitem.href}>
                                    <Link
                                      href={subitem.href}
                                      onClick={closeSidebar}
                                      className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                        subActive
                                          ? 'text-purple-300 bg-purple-600/10'
                                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                                      )}
                                    >
                                      {subitem.label}
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={closeSidebar}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
                            active
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          )}
                          data-tutorial={
                            item.label === 'Comptes & Modèles' ? 'accounts' :
                            item.label === 'Posting auto' ? 'posting' :
                            item.label === 'Dashboard' ? 'dashboard' :
                            undefined
                          }
                        >
                          <item.icon size={17} className={active ? 'text-purple-400' : ''} />
                          {item.label}
                          {item.badge && (
                            <span className="ml-auto text-xs font-semibold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {active && !item.badge && (
                            <ChevronRight size={14} className="ml-auto text-purple-400" />
                          )}
                        </Link>
                      )}
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
    </>
  )
}
