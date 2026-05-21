import { Lightbulb, Zap } from 'lucide-react'

interface MissedOpportunitiesCardProps {
  insights: any
}

export function MissedOpportunitiesCard({ insights }: MissedOpportunitiesCardProps) {
  const opportunities = insights?.missed_opportunities || []

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb size={20} className="text-yellow-400" />
        <h2 className="font-semibold">💡 Opportunités manquées</h2>
      </div>

      <div className="space-y-3">
        {opportunities.length > 0 ? (
          opportunities.map((opp: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{opp.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Inactif depuis {opp.days_since_purchase} jours
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/30 text-cyan-300">
                  {opp.estimated_potential}€
                </span>
              </div>
              <button className="mt-3 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                <Zap size={14} />
                Relancer avec l'IA
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Pas d'opportunités détectées
          </div>
        )}
      </div>
    </div>
  )
}
