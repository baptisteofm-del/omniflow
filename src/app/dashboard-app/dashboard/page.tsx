'use client'

import { LayoutDashboard, MessageSquare, Users, TrendingUp, Zap } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord</h1>
        <p className="text-gray-400">Bienvenue sur OmniFlow</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-500">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">5</h3>
          <p className="text-sm text-gray-400">Modèles actifs</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-gray-500">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">145</h3>
          <p className="text-sm text-gray-400">Messages cette semaine</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-gray-500">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">€2,450</h3>
          <p className="text-sm text-gray-400">Revenus ce mois</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">100%</h3>
          <p className="text-sm text-gray-400">Système actif</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Chatting IA</h2>
        <p className="text-gray-400 mb-6">
          Gérez vos conversations avec les fans grâce à l'IA. Automatisez les réponses et augmentez vos revenus.
        </p>
        <a 
          href="/dashboard-app/chatting-ia"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Aller au Chatting IA
        </a>
      </div>
    </div>
  )
}
