'use client'

import { Suspense } from 'react'
import {
  TrendingUp, Users, Calendar, BarChart3,
  Eye, Film, Bot, ArrowUpRight, Zap
} from 'lucide-react'
import { SkeletonStat } from '@/components/ui/Skeleton'

const stats = [
  { label: 'Modèles actifs', value: '8', change: '+2 ce mois', icon: Users, color: 'text-purple-400' },
  { label: 'Posts this month', value: '342', change: '+18%', icon: Calendar, color: 'text-cyan-400' },
  { label: 'Revenus (mai)', value: '12 400€', change: '+24%', icon: BarChart3, color: 'text-green-400' },
  { label: 'Trends captés', value: '156', change: 'cette semaine', icon: Eye, color: 'text-pink-400' },
]

const recentActivity = [
  { action: 'Vidéo spoofée', model: 'Leelou', time: 'Il y a 5 min', icon: Film, color: 'text-cyan-400' },
  { action: 'Post Telegram', model: 'Victoria', time: 'Il y a 12 min', icon: Bot, color: 'text-blue-400' },
  { action: 'Génération IA', model: 'Leelou', time: 'Il y a 1h', icon: Zap, color: 'text-purple-400' },
  { action: 'Veille trends', model: 'Tous', time: 'Il y a 2h', icon: Eye, color: 'text-pink-400' },
]

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <s.icon size={20} className={s.color} />
            <span className="text-xs text-gray-500">{s.change}</span>
          </div>
          <div className="text-2xl font-bold mb-1">{s.value}</div>
          <div className="text-sm text-gray-400">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-8" data-tutorial="dashboard">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bonjour 👋</h1>
        <p className="text-gray-400 mt-1">Voici ce qui se passe dans votre agence aujourd'hui</p>
      </div>

      {/* Stats grid with Suspense */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      }>
        <StatsGrid />
      </Suspense>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Activité récente</h2>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              Tout voir <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${a.color}`}>
                  <a.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-gray-500">Modèle: {a.model}</p>
                </div>
                <span className="text-xs text-gray-500">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Actions rapides</h2>
          <div className="space-y-3">
            {[
              { label: 'Voir les trends du jour', href: '/content/veille', icon: Eye, color: 'from-purple-600 to-purple-800' },
              { label: 'Editer une vidéo', href: '/content/editor', icon: Film, color: 'from-cyan-600 to-cyan-800' },
              { label: 'Générer avec l\'IA', href: '/content/ai-generation', icon: Zap, color: 'from-pink-600 to-rose-800' },
              { label: 'Scheduler un post', href: '/posting', icon: Calendar, color: 'from-orange-600 to-amber-800' },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-20 hover:opacity-80 transition-all group`}
              >
                <action.icon size={16} />
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
