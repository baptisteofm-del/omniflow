'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Eye, Film, Sparkles, Calendar,
  Bot, BarChart3, MessageSquare, Users, Settings,
  Zap, ChevronDown, CreditCard, User, Gift, Menu, X,
  Image as ImageIcon, Search, Lock, TrendingUp, Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// ── Structure de navigation ──────────────────────────────────
const NAV_TOP = [
  { label: 'Dashboard',   href: '/dashboard',  icon: LayoutDashboard, tutorial: 'dashboard' },
  { label: 'Modèles',     href: '/accounts',   icon: Users,           tutorial: 'accounts' },
  { label: 'Finance',     href: '/finance',    icon: Wallet },
  { label: 'Parrainage',  href: '/referral',   icon: Gift, badge: '10%' },
]

const NAV_COLLAPSIBLE = [
  {
    id: 'chatting',
    label: 'Chatting',
    icon: MessageSquare,
    color: 'text-blue-400',
    items: [
      { label: 'Chatting IA',  href: '/chatting/ai', icon: Sparkles,    requiredPlan: 'agency' },
      { label: 'Rapports',     href: '/chatting',    icon: BarChart3,   requiredPlan: 'pro' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: TrendingUp,
    color: 'text-cyan-400',
    items: [
      { label: 'Veille Trends',   href: '/content/veille',        icon: Eye },
      { label: 'Édition & Spoof', href: '/content/editor',        icon: Film },
      { label: 'Génération IA',   href: '/content/ai-generation', icon: Zap,       requiredPlan: 'pro' },
      { label: 'Auto Posting',    href: '/posting',               icon: Calendar,  tutorial: 'posting' },
      { label: 'Banque médias',   href: '/media',                 icon: ImageIcon },
      { label: 'Bot Telegram',    href: '/telegram',              icon: Bot },
    ],
  },
]

const NAV_SETTINGS = {
  id: 'settings',
  label: 'Paramètres',
  icon: Settings,
  color: 'text-gray-400',
  items: [
    { label: 'Profil',        href: '/settings/profile',       icon: User },
    { label: 'Abonnement',    href: '/settings/billing',       icon: CreditCard },
    { label: 'Équipe',        href: '/settings/team',          icon: Users },
    { label: 'Intégrations',  href: '/settings/integrations',  icon: Settings },
  ],
}

// ── Composant principal ──────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHovered, setIsHovered]       = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ chatting: true, marketing: true, settings: false })
  const [planId, setPlanId]             = useState('starter')
  const [agencyName, setAgencyName]     = useState('')
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-expand section si page active dedans
  useEffect(() => {
    NAV_COLLAPSIBLE.forEach(sec => {
      if (sec.items.some(item => pathname.startsWith(item.href))) {
        setOpenSections(prev => ({ ...prev, [sec.id]: true }))
      }
    })
    if (NAV_SETTINGS.items.some(item => pathname.startsWith(item.href))) {
      setOpenSections(prev => ({ ...prev, settings: true }))
    }
  }, [pathname])

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(d => { if (d?.plan) setPlanId(d.plan.id) })
      .catch(() => {})
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { if (d?.agency?.name) setAgencyName(d.agency.name) })
      .catch(() => {})
  }, [])

  const planRank: Record<string, number> = { starter: 0, pro: 1, agency: 2 }
  const userRank = planRank[planId] ?? 0
  const hasAccess = (plan?: string) => !plan || userRank >= (planRank[plan] ?? 99)
  const isExpanded = isHovered || isMobileOpen

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setIsHovered(false), 120)
  }

  const NavLink = ({ item }: { item: any }) => {
    // Exact match OU sous-chemin (ex: /accounts/prospection active pour /accounts)
    // Mais /chatting ne doit PAS matcher /chatting/ai — on exige que le chemin soit exactement item.href ou commence par item.href+'/'
    const active = pathname === item.href || (
      item.href.length > 1 &&
      item.href !== '/chatting' && // exception : /chatting ne matche pas /chatting/ai
      pathname.startsWith(item.href + '/')
    )
    const locked = item.requiredPlan && !hasAccess(item.requiredPlan)
    return (
      <Link
        href={locked ? '#' : item.href}
        onClick={e => {
          if (locked) {
            e.preventDefault()
            toast.error(`Plan ${item.requiredPlan === 'agency' ? 'Agency' : 'Pro'} requis pour accéder à ${item.label}`)
            return
          }
          setIsMobileOpen(false)
        }}
        title={!isExpanded ? item.label : undefined}
        data-tutorial={item.tutorial}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative',
          active
            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
            : locked
              ? 'text-gray-500 opacity-60'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
        )}
      >
        <item.icon size={17} className={cn('flex-shrink-0 transition-colors', active ? 'text-purple-400' : locked ? 'text-gray-700' : '')} />
        <span className={cn(
          'truncate transition-all duration-200 whitespace-nowrap',
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        )}>
          {item.label}
        </span>
        {isExpanded && locked && <Lock size={11} className="ml-auto flex-shrink-0 text-amber-500/60" />}
        {isExpanded && item.badge && !locked && (
          <span className="ml-auto text-xs font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
            {item.badge}
          </span>
        )}
        {/* Tooltip en mode collapsed */}
        {!isExpanded && (
          <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
            {item.label}
            {locked && <span className="ml-1 text-amber-400">🔒</span>}
          </span>
        )}
      </Link>
    )
  }

  const SectionToggle = ({ sec }: { sec: typeof NAV_COLLAPSIBLE[0] }) => {
    const isOpen = openSections[sec.id]
    const isActive = sec.items.some(item => pathname.startsWith(item.href))
    return (
      <div>
        <button
          onClick={() => isExpanded && setOpenSections(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
          title={!isExpanded ? sec.label : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group relative',
            isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          )}
        >
          <sec.icon size={17} className={cn('flex-shrink-0', sec.color)} />
          <span className={cn(
            'font-semibold uppercase tracking-wider text-xs transition-all duration-200 whitespace-nowrap',
            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          )}>
            {sec.label}
          </span>
          {isExpanded && (
            <ChevronDown size={13} className={cn('ml-auto flex-shrink-0 transition-transform duration-200 text-gray-600', isOpen ? 'rotate-0' : '-rotate-90')} />
          )}
          {/* Tooltip collapsed */}
          {!isExpanded && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
              {sec.label}
            </span>
          )}
        </button>

        {/* Items — toujours visibles en mode collapsed (icônes seules), dépliables en mode expanded */}
        <div className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded
            ? isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            : 'max-h-96 opacity-100'
        )}>
          <ul className={cn('space-y-0.5', isExpanded ? 'mt-0.5 ml-2 pl-3 border-l border-white/5' : 'mt-0.5')}>
            {sec.items.map(item => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-white/5 transition-all duration-300', isExpanded ? 'px-5 py-4 gap-3' : 'px-3 py-4 justify-center')}>
        <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity">
          <Zap size={16} className="text-white" />
        </Link>
        <span className={cn(
          'font-bold text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap transition-all duration-200',
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        )}>
          OmniFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">

        {/* Top items — sans catégorie */}
        {NAV_TOP.map(item => <NavLink key={item.href} item={item} />)}

        {/* Séparateur */}
        <div className="my-1.5 border-t border-white/5 mx-1" />

        {/* Sections collapsibles */}
        {NAV_COLLAPSIBLE.map(sec => <SectionToggle key={sec.id} sec={sec} />)}

        {/* Séparateur */}
        <div className="my-1.5 border-t border-white/5 mx-1" />

        {/* Paramètres — collapsible */}
        <SectionToggle sec={NAV_SETTINGS} />
      </nav>

      {/* Footer agence */}
      <div className={cn('border-t border-white/5 transition-all duration-300', isExpanded ? 'p-3' : 'p-2')}>
        <Link href="/settings/billing" onClick={() => setIsMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-xl hover:bg-white/5 transition-all group',
            isExpanded ? 'p-2.5' : 'p-2 justify-center'
          )}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {agencyName ? agencyName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className={cn('transition-all duration-200 min-w-0', isExpanded ? 'opacity-100 flex-1' : 'opacity-0 w-0 overflow-hidden')}>
            <p className="text-xs font-medium text-white truncate">{agencyName || '—'}</p>
            <p className="text-xs text-purple-400 capitalize">Plan {planId}</p>
          </div>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass border border-purple-500/20 hover:border-purple-500/40 transition-colors"
      >
        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar desktop — hover expand */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 z-40',
          'bg-[#0d0d14] border-r border-white/5',
          'transition-all duration-300 ease-in-out overflow-hidden',
          isHovered ? 'w-56' : 'w-[60px]'
        )}
        data-tutorial="sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Sidebar mobile — overlay */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-64 z-40 flex flex-col',
          'bg-[#0d0d14] border-r border-white/5',
          'transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
