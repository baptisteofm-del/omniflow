'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          OmniFlow
        </h1>
        <p className="text-gray-400 text-lg">Plateforme d'automatisation pour agences OnlyFans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-12">
        {[
          { icon: '📊', title: 'Dashboard', desc: 'Vue d\'ensemble' },
          { icon: '💬', title: 'Chatting IA', desc: 'Conversations automatisées' },
          { icon: '👥', title: 'Recrutement', desc: 'Gestion des talents' },
          { icon: '📢', title: 'Marketing', desc: 'Campagnes et analytics' },
          { icon: '📚', title: 'Banque de ressources', desc: 'Contenu réutilisable' },
          { icon: '📈', title: 'Pilotage', desc: 'KPIs et métriques' },
        ].map((item) => (
          <div
            key={item.title}
            className="p-6 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="px-8 py-3 border border-purple-500/50 hover:bg-purple-500/10 rounded-lg transition-colors"
        >
          S'inscrire
        </Link>
      </div>
    </div>
  )
}
