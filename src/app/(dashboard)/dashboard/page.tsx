'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, Calendar, BarChart3,
  Eye, Film, Bot, ArrowUpRight, Zap, AlertCircle, MessageSquare, Radio, Sparkles, Database, TrendingUpIcon
} from 'lucide-react'
import { SkeletonStat } from '@/components/ui/Skeleton'

const DAILY_QUOTES = [
  "Les grandes choses commencent par un petit pas",
  "Votre audience vous attend, créez des moments inoubliables",
  "Chaque post est une opportunité de briller",
  "La consistance crée la communauté",
  "Osez être authentique, c'est ça qui marche",
  "Le contenu de qualité se paie toujours",
  "Transformez vos passions en revenus",
]

const ICON_MAP: Record<string, any> = {
  'Users': Users,
  'Calendar': Calendar,
  'BarChart3': BarChart3,
  'Eye': Eye,
  'MessageSquare': MessageSquare,
  'AlertCircle': AlertCircle,
}

function StatsGrid({ loading, stats }: { loading: boolean; stats: any[] }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <SkeletonStat key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((s) => {
        const IconComponent = ICON_MAP[s.icon] || Users
        return (
          <div key={s.label} className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all">
                <IconComponent size={20} className={s.color} />
              </div>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">{s.change}</span>
            </div>
            <div className="text-3xl font-bold mb-2">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        )
      })}
    </div>
  )
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins}min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return date.toLocaleDateString('fr-FR')
}

function FeatureMiniCards({ stats, data }: { stats: any[]; data: any }) {
  const planRank: Record<string, number> = { starter: 0, pro: 1, agency: 2 }
  const featureMinPlan: Record<string, string> = {
    chatting_ai: 'agency',
    prospection: 'agency',
    ai_generation: 'pro',
  }

  const hasFeature = (feature: string) => {
    const min = featureMinPlan[feature] || 'starter'
    const userPlan = data?.plan?.id || 'starter'
    return (planRank[userPlan] || 0) >= (planRank[min] || 0)
  }

  const features = [
    { id: 'accounts', name: 'Comptes & Modèles', href: '/accounts', icon: Database, stat: stats[0]?.value || '0', label: 'modèles actifs' },
    { id: 'chatting_ai', name: 'Chatting IA', href: '/chatting/ai', icon: Sparkles, stat: stats[4]?.value || '0', label: 'messages/mois' },
    { id: 'veille', name: 'Veille Trends', href: '/content/veille', icon: TrendingUpIcon, stat: stats[3]?.value || '0', label: 'trends captés' },
    { id: 'finance', name: 'Finance', href: '/finance', icon: BarChart3, stat: stats[2]?.value || '0,00 €', label: 'ce mois' },
    { id: 'posting', name: 'Posting Auto', href: '/posting', icon: Calendar, stat: stats[1]?.value || '0', label: 'posts planifiés' },
    { id: 'prospection', name: 'Recrutement', href: '/accounts/prospection', icon: Users, stat: '0', label: 'prospects' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {features.map((feature) => {
        const IconComponent = feature.icon
        const isLocked = !hasFeature(feature.id)
        const minPlan = featureMinPlan[feature.id]

        if (isLocked) {
          return (
            <div
              key={feature.id}
              className="glass rounded-xl p-4 border border-white/10 opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-white">{feature.name}</span>
                </div>
                {minPlan && (
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                    {minPlan === 'agency' ? 'Agency' : 'Pro'}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-400">{feature.stat}</p>
              <p className="text-xs text-gray-600 mt-1">{feature.label}</p>
            </div>
          )
        }

        return (
          <Link
            key={feature.id}
            href={feature.href}
            className="glass rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IconComponent size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{feature.name}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{feature.stat}</p>
            <p className="text-xs text-gray-500 mt-1">{feature.label}</p>
            <p className="text-xs text-purple-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Voir →</p>
          </Link>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [todayQuote, setTodayQuote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    // Set daily quote
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setTodayQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length])

    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error('Admin check failed:', error)
      }
    }
    checkAdmin()

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await res.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const agencyName = dashboardData?.agency?.name || 'Omniflow'

  return (
    <div className="p-8" data-tutorial="dashboard">
      {/* Admin Link */}
      {isAdmin && (
        <div className="mb-6 flex items-center justify-end">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-all text-sm font-medium"
          >
            🔑 Vue Admin →
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Dynamic Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bonjour, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{agencyName}</span></h1>
            <p className="text-gray-400 text-lg">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
          </div>
        </div>
        {todayQuote && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-sm text-gray-300 italic">{todayQuote}</p>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <StatsGrid loading={loading} stats={dashboardData?.stats || []} />

      {/* Feature Mini-Cards */}
      {!loading && dashboardData?.stats && (
        <FeatureMiniCards stats={dashboardData.stats} data={dashboardData} />
      )}

      {/* ROI Section */}
      {!loading && dashboardData?.stats && (() => {
        const aiMessages = dashboardData?.stats?.find((s:any) => s.label === 'Messages IA')?.value || 0
        const aiMessagesNum = parseInt(aiMessages.toString().replace(/[^0-9]/g, '')) || 0
        const hoursStr = (aiMessagesNum * 2) / 60
        const hourssaved = hoursStr >= 1 ? Math.round(hoursStr) : Math.round(hoursStr * 10) / 10
        const estimatedValue = Math.round(hoursStr * 12)
        const currentMonthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        
        return (
          <div className="glass rounded-2xl p-6 border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Ce que l'IA a fait pour vous ce mois
              </h2>
              <span className="text-xs text-gray-500">{currentMonthLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{hourssaved}h</p>
                <p className="text-xs text-gray-500 mt-1">économisées</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-3xl font-bold text-cyan-400">{aiMessagesNum}</p>
                <p className="text-xs text-gray-500 mt-1">messages envoyés</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{estimatedValue}€</p>
                <p className="text-xs text-gray-500 mt-1">valeur estimée</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 text-center">
              Basé sur {aiMessagesNum} messages IA × 2min × 12€/h
            </p>
          </div>
        )
      })()}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" />
              Prochains posts
            </h2>
          </div>
          <div className="space-y-3">
            {!loading && dashboardData?.upcomingPosts && dashboardData.upcomingPosts.length > 0 ? (
              dashboardData.upcomingPosts.map((post: any, i: number) => {
                const scheduledTime = new Date(post.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const platform = post.platforms && post.platforms[0] ? post.platforms[0].substring(0, 2).toUpperCase() : 'N/A'
                return (
                  <Link key={i} href="/posting" className="block p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-purple-500/30 transition-all">
                    <p className="text-sm font-medium text-white line-clamp-2">{post.title || 'Post sans titre'}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{post.model_id || 'N/A'}</span>
                      <span className="text-cyan-400 font-semibold">{scheduledTime}</span>
                    </div>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">{platform}</span>
                  </Link>
                )
              })
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">Aucun post planifié</div>
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" />
              Activité récente
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Tout voir <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {!loading && dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((a: any, i: number) => {
                const directionLabel = a.direction === 'inbound' ? 'Message reçu' : 'Message envoyé'
                const relativeTime = getRelativeTime(a.sent_at)
                return (
                  <Link key={i} href="/chatting/ai" className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all px-2 rounded-lg cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                      <MessageSquare size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{directionLabel}</p>
                      <p className="text-xs text-gray-500 truncate">{a.content || 'Contenu vide'}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{relativeTime}</span>
                  </Link>
                )
              })
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">Aucune activité récente</div>
            )}
          </div>
        </div>

        {/* Alertes actionnables */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-orange-400" />
            Actions recommandées
          </h2>
          <div className="space-y-2">
            {/* Intégrations non connectées */}
            {dashboardData?.connections?.filter((c:any) => !c.is_active).map((c:any, i:number) => (
              <Link key={i} href={`/settings/integrations?tool=${c.tool || c.name?.toLowerCase()}`}
                className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-sm text-orange-300">{c.name} non connecté</span>
                </div>
                <span className="text-xs text-orange-400 font-medium">Connecter →</span>
              </Link>
            ))}
            
            {/* Modèles sans config IA */}
            {(dashboardData?.stats?.find((s:any) => s.label === 'Modèles actifs')?.value || 0) > 0 && 
             (dashboardData?.stats?.find((s:any) => s.label === 'Messages IA')?.value || 0) === 0 && (
              <Link href="/chatting/ai"
                className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl hover:bg-purple-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-sm text-purple-300">Chatting IA non configuré</span>
                </div>
                <span className="text-xs text-purple-400 font-medium">Configurer →</span>
              </Link>
            )}
            
            {/* Fans à risque */}
            {(dashboardData?.stats?.find((s:any) => s.label?.includes('risque'))?.value || 0) > 0 && (
              <Link href="/chatting"
                className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-sm text-red-300">
                    {dashboardData?.stats?.find((s:any) => s.label?.includes('risque'))?.value} fans à risque
                  </span>
                </div>
                <span className="text-xs text-red-400 font-medium">Voir →</span>
              </Link>
            )}

            {/* Tout va bien */}
            {(!dashboardData?.connections?.some((c:any) => !c.is_active) && 
              (dashboardData?.stats?.find((s:any) => s.label === 'Messages IA')?.value || 0) > 0) && (
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
                <span className="text-sm text-green-400">✓ Tout fonctionne correctement</span>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}
// force redeploy Fri May 22 18:00:19 UTC 2026
