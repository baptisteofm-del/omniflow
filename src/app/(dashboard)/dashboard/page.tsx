'use client'

import { Suspense, useState, useEffect } from 'react'
import {
  TrendingUp, Users, Calendar, BarChart3,
  Eye, Film, Bot, ArrowUpRight, Zap, AlertCircle, MessageSquare, Radio
} from 'lucide-react'
import { SkeletonStat } from '@/components/ui/Skeleton'

const DAILY_QUOTES = [
  "Les grandes choses commencent par un petit pas ✨",
  "Votre audience vous attend, créez des moments inoubliables 🎬",
  "Chaque post est une opportunité de briller 💫",
  "La consistance crée la communauté 🚀",
  "Osez être authentique, c'est ça qui marche 💎",
  "Le contenu de qualité se paie toujours 💰",
  "Transformez vos passions en revenus 🔥",
]

const stats = [
  { label: 'Modèles actifs', value: '8', change: '+2 ce mois', icon: Users, color: 'text-purple-400' },
  { label: 'Posts ce mois', value: '342', change: '+18%', icon: Calendar, color: 'text-cyan-400' },
  { label: 'Revenus (mai)', value: '12 400€', change: '+24%', icon: BarChart3, color: 'text-green-400' },
  { label: 'Trends captés', value: '156', change: 'nouveau 🎯', icon: Eye, color: 'text-pink-400' },
  { label: 'Messages IA', value: '2 847', change: 'ce mois', icon: MessageSquare, color: 'text-blue-400' },
  { label: 'Fans à risque', value: '3', change: 'à action', icon: AlertCircle, color: 'text-red-400' },
]

const recentActivity = [
  { action: 'Vidéo spoofée', model: 'Leelou', time: 'Il y a 5 min', icon: Film, color: 'text-cyan-400' },
  { action: 'Post Telegram', model: 'Victoria', time: 'Il y a 12 min', icon: Bot, color: 'text-blue-400' },
  { action: 'Génération IA', model: 'Leelou', time: 'Il y a 1h', icon: Zap, color: 'text-purple-400' },
  { action: 'Veille trends', model: 'Tous', time: 'Il y a 2h', icon: Eye, color: 'text-pink-400' },
]

const upcomingPosts = [
  { title: 'Morning Routine Glamour', model: 'Leelou', time: '14:00', platform: 'OF' },
  { title: 'GRWM: Luxury Edition', model: 'Victoria', time: '16:30', platform: 'TG' },
  { title: 'Fitness Challenge Day 5', model: 'Sophie', time: '18:45', platform: 'IG' },
]

const activeConnections = [
  { name: 'AdsPower', status: 'connected', color: 'green' },
  { name: 'GeeLark', status: 'connected', color: 'green' },
  { name: 'OnlyFans', status: 'connected', color: 'green' },
  { name: 'MYM', status: 'disconnected', color: 'red' },
]

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-white/10 to-white/5 rounded-xl group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all">
              <s.icon size={20} className={s.color} />
            </div>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">{s.change}</span>
          </div>
          <div className="text-3xl font-bold mb-2">{s.value}</div>
          <div className="text-sm text-gray-400">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [todayQuote, setTodayQuote] = useState('')

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
  }, [])

  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

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

      {/* Dynamic Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Bonjour 👋 Omniflow</h1>
            <p className="text-gray-400 text-lg">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
          </div>
        </div>
        {todayQuote && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-sm text-gray-300 italic">💡 {todayQuote}</p>
          </div>
        )}
      </div>

      {/* Stats grid with Suspense */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      }>
        <StatsGrid />
      </Suspense>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upcoming Posts */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" />
              Prochains posts
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingPosts.map((post, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
                <p className="text-sm font-medium text-white line-clamp-2">{post.title}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{post.model}</span>
                  <span className="text-cyan-400 font-semibold">{post.time}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                  {post.platform}
                </span>
              </div>
            ))}
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
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-all px-2 rounded">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${a.color}`}>
                  <a.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.action}</p>
                  <p className="text-xs text-gray-500">Modèle: {a.model}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connections Status */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Radio size={18} className="text-green-400" />
            Connexions
          </h2>
          <div className="space-y-3">
            {activeConnections.map((conn, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-sm font-medium">{conn.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${conn.color === 'green' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500'}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 glass rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '🔥 Voir les trends', href: '/content/veille', color: 'from-purple-600 to-purple-800' },
            { label: '🎬 Éditer une vidéo', href: '/content/editor', color: 'from-cyan-600 to-cyan-800' },
            { label: '✨ Générer avec l\'IA', href: '/content/ai-generation', color: 'from-pink-600 to-rose-800' },
            { label: '📅 Scheduler un post', href: '/posting', color: 'from-orange-600 to-amber-800' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-20 hover:opacity-90 transition-all group font-medium text-sm`}
            >
              {action.label}
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
