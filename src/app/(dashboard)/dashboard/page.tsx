'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, Calendar, BarChart3,
  ArrowUpRight, Zap, AlertCircle, MessageSquare,
  Sparkles, Clock, DollarSign, Activity,
  Lock, CheckCircle, Star, ChevronRight,
  Film, Wallet, Search, Image, Bot,
  Database, Eye, TrendingUpIcon
} from 'lucide-react'

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.isAdmin)
        }
      } catch {}
    }
    checkAdmin()

    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) throw new Error('Erreur de chargement')
        const data = await res.json()
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── Data ──
  const agencyName = dashboardData?.agency?.name || 'Mon Agence'
  const planId = dashboardData?.plan?.id || 'starter'
  const planRank: Record<string, number> = { starter: 0, pro: 1, agency: 2 }
  const hasFeature = (minPlan: string) => (planRank[planId] || 0) >= (planRank[minPlan] || 0)
  const planLabel: Record<string, string> = { starter: 'Starter', pro: 'Pro', agency: 'Agency' }
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // ── ROI Computations ──
  const roi = dashboardData?.roi || {}
  const editTotal = (roi.editCount || 0) + (roi.spoofCount || 0)
  const aiMsgs = roi.aiMessagesCount || 0
  const postsCount = roi.postsCount || 0
  const modelsCount = roi.activeModelsCount || 0
  const monthlyRevenue = roi.monthlyRevenue || 0
  const trendsCount = parseInt(dashboardData?.stats?.find((s: any) => s.label === 'Trends captés')?.value || '0') || 0

  const timeSavedMin = editTotal * 20 + aiMsgs * 5 + postsCount * 10
  const timeSavedDisplay = timeSavedMin >= 60 ? `${Math.round(timeSavedMin / 60)}h` : timeSavedMin > 0 ? `${timeSavedMin}min` : '0min'

  const chattingGain = Math.round(monthlyRevenue * 0.05)
  const postingGain = Math.round(modelsCount * 15)
  const editGain = Math.round(editTotal * 8)
  const totalGain = chattingGain + postingGain + editGain

  const totalTools = 7 // nombre total de features dans le SaaS
  const unlockedTools = [
    true, // posting (starter)
    true, // finance (starter)
    true, // media (starter)
    true, // veille (starter)
    hasFeature('pro'), // chatting IA
    hasFeature('pro'), // generation IA
    hasFeature('agency'), // recrutement
  ].filter(Boolean).length
  const toolUsageRate = Math.round((unlockedTools / totalTools) * 100)
  const contentsGenerated = editTotal + postsCount

  const revenueFormatted = monthlyRevenue > 0
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyRevenue)
    : '0 €'

  // ── KPI Cards ──
  const kpiCards = [
    {
      label: 'Revenus du mois',
      value: revenueFormatted,
      sub: 'générés ce mois',
      icon: DollarSign,
      color: 'text-green-400',
      border: 'hover:border-green-500/40',
      glow: 'hover:shadow-green-500/10',
      gradient: 'from-green-500/10 to-transparent',
      href: '/finance',
    },
    {
      label: 'Modèles connectés',
      value: modelsCount.toString(),
      sub: `profil${modelsCount > 1 ? 's' : ''} actif${modelsCount > 1 ? 's' : ''}`,
      icon: Users,
      color: 'text-purple-400',
      border: 'hover:border-purple-500/40',
      glow: 'hover:shadow-purple-500/10',
      gradient: 'from-purple-500/10 to-transparent',
      href: '/accounts',
    },
    {
      label: 'Économies réalisées',
      value: `${totalGain}€`,
      sub: 'vs prestataires humains',
      icon: TrendingUp,
      color: 'text-yellow-400',
      border: 'hover:border-yellow-500/40',
      glow: 'hover:shadow-yellow-500/10',
      gradient: 'from-yellow-500/10 to-transparent',
      href: '/finance',
    },
    {
      label: 'Temps économisé',
      value: timeSavedDisplay,
      sub: 'via automatisations',
      icon: Clock,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/40',
      glow: 'hover:shadow-cyan-500/10',
      gradient: 'from-cyan-500/10 to-transparent',
      href: '/chatting',
    },
    {
      label: 'Features débloquées',
      value: `${unlockedTools}/${totalTools}`,
      sub: `plan ${planLabel[planId] || planId}`,
      icon: Zap,
      color: 'text-orange-400',
      border: 'hover:border-orange-500/40',
      glow: 'hover:shadow-orange-500/10',
      gradient: 'from-orange-500/10 to-transparent',
      href: '/settings/billing',
    },
    {
      label: 'Contenus traités',
      value: contentsGenerated.toString(),
      sub: 'éditions + posts',
      icon: Film,
      color: 'text-pink-400',
      border: 'hover:border-pink-500/40',
      glow: 'hover:shadow-pink-500/10',
      gradient: 'from-pink-500/10 to-transparent',
      href: '/content/editor',
    },
  ]

  // ── Quick Actions ──
  const quickActions = [
    { label: 'Génération IA',  icon: Sparkles,     href: '/content/ai-generation', color: 'purple', minPlan: 'pro' },
    { label: 'Chatting IA',   icon: MessageSquare, href: '/chatting/ai',            color: 'blue',   minPlan: 'pro' },
    { label: 'Recrutement',   icon: Search,        href: '/accounts/prospection',   color: 'green',  minPlan: 'agency' },
    { label: 'Auto Posting',  icon: Calendar,      href: '/posting',                color: 'cyan',   minPlan: 'starter' },
    { label: 'Médias',        icon: Image,         href: '/media',                  color: 'pink',   minPlan: 'starter' },
    { label: 'Finance',       icon: Wallet,        href: '/finance',                color: 'yellow', minPlan: 'starter' },
    { label: 'Rapports',      icon: BarChart3,     href: '/chatting',               color: 'orange', minPlan: 'starter' },
  ]

  const actionColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    purple: { bg: 'hover:bg-purple-500/15',  border: 'hover:border-purple-500/50 border-purple-500/20',  text: 'group-hover:text-purple-300', icon: 'text-purple-400' },
    blue:   { bg: 'hover:bg-blue-500/15',    border: 'hover:border-blue-500/50 border-blue-500/20',      text: 'group-hover:text-blue-300',   icon: 'text-blue-400' },
    green:  { bg: 'hover:bg-green-500/15',   border: 'hover:border-green-500/50 border-green-500/20',    text: 'group-hover:text-green-300',  icon: 'text-green-400' },
    cyan:   { bg: 'hover:bg-cyan-500/15',    border: 'hover:border-cyan-500/50 border-cyan-500/20',      text: 'group-hover:text-cyan-300',   icon: 'text-cyan-400' },
    pink:   { bg: 'hover:bg-pink-500/15',    border: 'hover:border-pink-500/50 border-pink-500/20',      text: 'group-hover:text-pink-300',   icon: 'text-pink-400' },
    yellow: { bg: 'hover:bg-yellow-500/15',  border: 'hover:border-yellow-500/50 border-yellow-500/20',  text: 'group-hover:text-yellow-300', icon: 'text-yellow-400' },
    orange: { bg: 'hover:bg-orange-500/15',  border: 'hover:border-orange-500/50 border-orange-500/20',  text: 'group-hover:text-orange-300', icon: 'text-orange-400' },
  }

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto" data-tutorial="dashboard">

      {/* Admin */}
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <a href="/admin" className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-medium">
            🔑 Vue Admin →
          </a>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* ════════════════════════════════════
          HEADER
      ════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-white">Bonjour, </span>
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">{agencyName}</span>
            </h1>
            <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300 tracking-wide">
              ✨ {planLabel[planId] || planId}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Système actif</span>
          </div>
          <Link href="/accounts" className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-all">
            <Users size={12} className="text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">{modelsCount} modèle{modelsCount > 1 ? 's' : ''}</span>
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════
          KPI GRID
      ════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/3 animate-pulse h-28" />
            ))
          : kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.label} href={card.href}
                  className={`glass rounded-2xl p-4 border border-white/5 ${card.border} hover:shadow-lg ${card.glow} transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all">
                        <Icon size={15} className={card.color} />
                      </div>
                      <ArrowUpRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-0.5 tabular-nums">{card.value}</div>
                    <div className="text-xs text-gray-500 leading-tight">{card.label}</div>
                    <div className="text-xs text-gray-700 mt-0.5">{card.sub}</div>
                  </div>
                </Link>
              )
            })
        }
      </div>

      {/* ════════════════════════════════════
          GAINS OUTILS — SECTION IMPACT
      ════════════════════════════════════ */}
      {!loading && (
        <div className="glass rounded-2xl border border-purple-500/20 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/10 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <Zap size={16} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">Ce que vos outils vous font gagner</h2>
                <p className="text-xs text-gray-500">Estimation basée sur votre utilisation · {monthLabel}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-bold text-white">{totalGain}€</div>
              <div className="text-xs text-gray-500">économisés ce mois</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">

            {/* Chatting IA */}
            <Link href="/chatting/ai" className="p-5 hover:bg-white/3 transition-all group">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <MessageSquare size={14} className="text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Chatting IA</span>
                <ArrowUpRight size={12} className="text-gray-600 group-hover:text-purple-400 transition-colors ml-auto" />
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-purple-400">{chattingGain}€</div>
                  <div className="text-xs text-gray-500 mt-0.5">de commission économisée</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{aiMsgs}</div>
                  <div className="text-xs text-gray-600">messages</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chatter humain</span>
                  <span className="text-orange-400 font-medium">15% commission</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Omniflow IA</span>
                  <span className="text-green-400 font-medium">10% commission</span>
                </div>
              </div>
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(aiMsgs > 0 ? Math.max((aiMsgs / 200) * 100, 5) : 0, 100)}%` }} />
              </div>
            </Link>

            {/* Posting Auto */}
            <Link href="/posting" className="p-5 hover:bg-white/3 transition-all group">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                  <Calendar size={14} className="text-cyan-400" />
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">Posting Auto</span>
                <ArrowUpRight size={12} className="text-gray-600 group-hover:text-cyan-400 transition-colors ml-auto" />
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-cyan-400">{postingGain}€</div>
                  <div className="text-xs text-gray-500 mt-0.5">économisés vs VA</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{modelsCount}</div>
                  <div className="text-xs text-gray-600">comptes gérés</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">VA externalisé</span>
                  <span className="text-orange-400 font-medium">~750€/50 comptes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avec Omniflow</span>
                  <span className="text-green-400 font-medium">inclus dans le plan</span>
                </div>
              </div>
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(modelsCount > 0 ? Math.max((modelsCount / 50) * 100, 5) : 0, 100)}%` }} />
              </div>
            </Link>

            {/* Édition & Spoof */}
            <Link href="/content/editor" className="p-5 hover:bg-white/3 transition-all group">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-pink-500/20 rounded-lg">
                  <Film size={14} className="text-pink-400" />
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors">Édition & Spoof</span>
                <ArrowUpRight size={12} className="text-gray-600 group-hover:text-pink-400 transition-colors ml-auto" />
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-pink-400">{timeSavedDisplay}</div>
                  <div className="text-xs text-gray-500 mt-0.5">de montage économisé</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{editTotal}</div>
                  <div className="text-xs text-gray-600">fichiers</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montage manuel</span>
                  <span className="text-orange-400 font-medium">~20min/fichier</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avec Omniflow</span>
                  <span className="text-green-400 font-medium">automatique</span>
                </div>
              </div>
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(editTotal > 0 ? Math.max((editTotal / 30) * 100, 5) : 0, 100)}%` }} />
              </div>
            </Link>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          QUICK ACTIONS
      ════════════════════════════════════ */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Actions rapides</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon
            const locked = !hasFeature(action.minPlan)
            const c = actionColors[action.color]
            if (locked) {
              return (
                <div key={action.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/3 opacity-40 cursor-not-allowed select-none">
                  <div className="p-2 rounded-lg bg-white/5 relative">
                    <Icon size={17} className="text-gray-600" />
                    <Lock size={9} className="absolute -top-1 -right-1 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight font-medium">{action.label}</span>
                </div>
              )
            }
            return (
              <Link key={action.label} href={action.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border bg-white/3 ${c.border} ${c.bg} transition-all duration-200 hover:scale-[1.05] group`}>
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/15 transition-all">
                  <Icon size={17} className={`${c.icon} transition-colors`} />
                </div>
                <span className={`text-xs text-gray-400 ${c.text} text-center leading-tight font-medium transition-colors`}>{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════
          BOTTOM GRID
      ════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Prochains posts */}
        <div className="glass rounded-2xl p-5 border border-white/5 hover:border-cyan-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Calendar size={15} className="text-cyan-400" />
              Prochains posts
            </h2>
            <Link href="/posting" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Voir <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {!loading && dashboardData?.upcomingPosts?.length > 0
              ? dashboardData.upcomingPosts.map((post: any, i: number) => {
                  const time = new Date(post.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  const platform = post.platforms?.[0]?.substring(0, 2).toUpperCase() || '??'
                  return (
                    <Link key={i} href="/posting"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                        {platform}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{post.title || 'Post sans titre'}</p>
                        <p className="text-xs text-gray-600">{post.model_id || '—'}</p>
                      </div>
                      <span className="text-xs text-cyan-400 font-mono flex-shrink-0">{time}</span>
                    </Link>
                  )
                })
              : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Calendar size={22} className="text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-600">Aucun post planifié</p>
                  <Link href="/posting"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    Créer un post <ArrowUpRight size={11} />
                  </Link>
                </div>
              )
            }
          </div>
        </div>

        {/* Activité récente */}
        <div className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Activity size={15} className="text-yellow-400" />
              Activité récente
            </h2>
            <Link href="/chatting/ai" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Tout voir <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {!loading && dashboardData?.recentActivity?.length > 0
              ? dashboardData.recentActivity.map((a: any, i: number) => {
                  const isInbound = a.direction === 'inbound'
                  return (
                    <Link key={i} href="/chatting/ai"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isInbound ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                        <MessageSquare size={13} className={isInbound ? 'text-blue-400' : 'text-purple-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{isInbound ? '← Message reçu' : '→ IA a répondu'}</p>
                        <p className="text-xs text-gray-600 truncate">{a.content || '—'}</p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{getRelativeTime(a.sent_at)}</span>
                    </Link>
                  )
                })
              : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Activity size={22} className="text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-600">Aucune activité récente</p>
                  <Link href="/chatting/ai"
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    Démarrer le chatting <ArrowUpRight size={11} />
                  </Link>
                </div>
              )
            }
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-5">

          {/* Top Modèles */}
          <div className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Star size={15} className="text-purple-400" />
                Top modèles
              </h2>
              <Link href="/accounts" className="text-xs text-gray-600 hover:text-purple-400 transition-colors">
                Voir tous →
              </Link>
            </div>
            {!loading && dashboardData?.topModels?.length > 0
              ? (
                <div className="space-y-3">
                  {dashboardData.topModels.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 w-4 flex-shrink-0">{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{m.name}</p>
                        <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(m.pct || 0, m.revenue > 0 ? 8 : 0)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-400 flex-shrink-0 tabular-nums">{m.revenue}€</span>
                    </div>
                  ))}
                </div>
              )
              : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-600 mb-2">Aucune donnée de revenus</p>
                  <Link href="/finance" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    → Configurer la finance
                  </Link>
                </div>
              )
            }
          </div>

          {/* Actions recommandées */}
          <div className="glass rounded-2xl p-5 border border-white/5 hover:border-orange-500/20 transition-all">
            <h2 className="font-semibold flex items-center gap-2 text-sm mb-3">
              <AlertCircle size={15} className="text-orange-400" />
              Actions recommandées
            </h2>
            <div className="space-y-2">
              {(() => {
                const items: any[] = []
                const connections = dashboardData?.connections || []

                connections.filter((c: any) => !c.is_active).slice(0, 2).forEach((c: any) => {
                  items.push(
                    <Link key={`c-${c.name}`} href={`/settings/integrations?tool=${c.tool}`}
                      className="flex items-center justify-between p-2.5 bg-orange-500/5 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                        <span className="text-xs text-orange-300">🔗 {c.name} non connecté</span>
                      </div>
                      <ChevronRight size={12} className="text-orange-400" />
                    </Link>
                  )
                })

                if (modelsCount > 0 && aiMsgs === 0) {
                  items.push(
                    <Link key="ai" href="/chatting/ai"
                      className="flex items-center justify-between p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                        <span className="text-xs text-purple-300">🤖 Activer le Chatting IA</span>
                      </div>
                      <ChevronRight size={12} className="text-purple-400" />
                    </Link>
                  )
                }

                if (modelsCount === 0) {
                  items.push(
                    <Link key="mdl" href="/accounts"
                      className="flex items-center justify-between p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-xs text-blue-300">👤 Créer votre premier modèle</span>
                      </div>
                      <ChevronRight size={12} className="text-blue-400" />
                    </Link>
                  )
                }

                if (postsCount === 0 && modelsCount > 0) {
                  items.push(
                    <Link key="post" href="/posting"
                      className="flex items-center justify-between p-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        <span className="text-xs text-cyan-300">📅 Planifier du contenu</span>
                      </div>
                      <ChevronRight size={12} className="text-cyan-400" />
                    </Link>
                  )
                }

                if (items.length === 0) {
                  items.push(
                    <div key="ok" className="flex items-center gap-2 p-2.5 bg-green-500/5 border border-green-500/20 rounded-xl">
                      <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
                      <span className="text-xs text-green-300">Tout fonctionne parfaitement</span>
                    </div>
                  )
                }

                return items
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
// force redeploy Sat May 23 17:00:00 UTC 2026
