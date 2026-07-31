'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Users, Zap, Target } from 'lucide-react'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState('28 juil.')
  const [selectedModel, setSelectedModel] = useState('overview')

  const models = [
    { id: 'overview', name: 'Vue d\'ensemble', ca: 166.71, status: '5 créatrices, 2 actif' },
    { id: 'victoriavet', name: 'Victoriavet', ca: 134.93, status: 'Expire dans 5 j' },
    { id: 'oliviabot', name: 'Oliviabot', ca: 31.78, status: 'Expire dans 5 j' },
    { id: 'immchloe', name: 'Immchloe', ca: 0.0, status: '25 min' },
    { id: 'maddy', name: 'Maddy_secret', ca: 0.0, status: 'Chatting en cours' },
  ]

  const stats = [
    { label: 'NOUVEAUX ABONNÉS', value: '+183', previous: '+205', icon: Users },
    { label: 'CA DU MOIS', value: '10 223,06 €', previous: 'juillet', icon: TrendingUp },
    { label: 'LTV MOYEN', value: '2,43 €', previous: 'par abonné', icon: Zap },
    { label: 'OBJECTIF DU MOIS', value: '30 000,00 €', progress: '11 355,72 € · -38%', icon: Target },
  ]

  const teamOnline = [
    { name: 'Andry', role: 'Cockpit · Maddy_secret', status: 'LIVE' },
    { name: 'Marin', role: 'Équipe', status: 'LIVE' },
    { name: 'Varicko', role: 'Cockpit · Victoriavet', status: 'LIVE' },
    { name: 'baptiste.ofm', role: 'Tableau de bord', status: 'LIVE' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-gray-400 mt-2">Pilotez votre agence en temps réel</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <ChevronLeft size={20} />
            </button>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500">
              <option>28 juil.</option>
              <option>27 juil.</option>
              <option>26 juil.</option>
            </select>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="text-sm text-gray-400">27 juil. · 550,37 €</div>
        </div>

        {/* Primary Metric */}
        <div className="mb-12">
          <p className="text-gray-400 text-sm mb-2">CA DU JOUR · VUE D'ENSEMBLE</p>
          <div className="flex items-baseline gap-4">
            <p className="text-5xl font-bold">166,71 €</p>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">+183 clients</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="border-l-2 border-purple-600 pl-4">
                <p className="text-xs text-gray-400 font-semibold mb-2">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.previous || stat.progress}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Models List & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Models */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-2 h-fit">
          <p className="text-sm text-gray-400 font-semibold mb-4">LA FLOTTE</p>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedModel === model.id
                  ? 'bg-purple-600/20 border border-purple-500/30'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{model.name}</p>
                <p className="font-bold">{model.ca.toFixed(2)} €</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{model.status}</p>
            </button>
          ))}
          <div className="border-t border-gray-800 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">CA TOTAL</p>
              <p className="text-lg font-bold">166,71 €</p>
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-400 font-semibold mb-2">ÉVOLUTION · VUE D'ENSEMBLE</p>
              <div className="flex gap-4">
                <button className="px-3 py-1 rounded-lg text-sm font-medium text-purple-400 border border-purple-500/30 bg-purple-600/20">CA</button>
                <button className="px-3 py-1 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50">Abonnés</button>
                <button className="px-3 py-1 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50">LTV</button>
              </div>
            </div>
          </div>

          {/* Simplified Chart */}
          <div className="h-64 flex items-end justify-between gap-1 mb-6">
            {[40, 60, 35, 75, 45, 80, 55, 90, 65, 85, 70, 95].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-cyan-600 rounded-t opacity-70" style={{ height: `${height}%` }}></div>
            ))}
          </div>

          <p className="text-xs text-gray-400">2 modèles chatting actifs · 7 ventes · 2 pourboirés aujourd'hui</p>
        </div>
      </div>

      {/* Team Online */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-sm text-gray-400 font-semibold mb-4">ÉQUIPAGE EN LIGNE</p>
        <div className="space-y-3">
          {teamOnline.map((member, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full font-medium">{member.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
