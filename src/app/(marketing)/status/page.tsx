import { Check, AlertCircle } from 'lucide-react'

const services = [
  { name: 'API Omniflow', status: 'operational' },
  { name: 'Génération IA (Kling)', status: 'operational' },
  { name: 'Posting automatique', status: 'operational' },
  { name: 'Base de données', status: 'operational' },
  { name: 'Auth & Sécurité', status: 'operational' },
  { name: 'Intégrations (OnlyFans, MYM, Binance)', status: 'operational' },
]

export default function StatusPage() {
  const lastUpdated = new Date()
  const minutesAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Statut des services</h1>
          <p className="text-gray-400">
            Mise à jour :{' '}
            <span className="text-gray-300">
              {minutesAgo === 0 ? 'À l\'instant' : `Il y a ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''}`}
            </span>
          </p>
        </div>

        {/* Status cards */}
        <div className="space-y-4 mb-12">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] hover:border-white/20 transition-all"
            >
              <div className="flex-shrink-0">
                {service.status === 'operational' ? (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50">
                    <Check size={16} className="text-green-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50">
                    <AlertCircle size={16} className="text-red-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{service.name}</p>
                <p className="text-sm text-gray-500">
                  {service.status === 'operational' ? '✅ Opérationnel' : '❌ En maintenance'}
                </p>
              </div>
              <div className="text-sm font-medium">
                {service.status === 'operational' ? (
                  <span className="text-green-400">Opérationnel</span>
                ) : (
                  <span className="text-red-400">Maintenance</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent incidents section */}
        <div className="mb-12 p-6 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
          <h2 className="text-xl font-bold mb-4">Incidents récents</h2>
          <div className="flex items-center gap-2">
            <Check size={20} className="text-green-400" />
            <span className="text-gray-300">Aucun incident signalé ces 90 derniers jours ✅</span>
          </div>
        </div>

        {/* Uptime stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
            <p className="text-sm text-gray-400 mb-1">Uptime (90j)</p>
            <p className="text-2xl font-bold text-green-400">99.9%</p>
          </div>
          <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
            <p className="text-sm text-gray-400 mb-1">Période</p>
            <p className="text-lg font-semibold text-gray-300">90 derniers jours</p>
          </div>
        </div>

        {/* Subscribe button */}
        <div className="mt-12 p-6 rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
          <p className="text-gray-400 mb-4">
            Recevez les mises à jour de statut directement dans votre email
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Entrez votre email"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-all"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              S'abonner
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
