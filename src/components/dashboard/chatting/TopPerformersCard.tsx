import { Flame, TrendingUp } from 'lucide-react'

interface TopPerformersCardProps {
  insights: any
}

export function TopPerformersCard({ insights }: TopPerformersCardProps) {
  const performers = insights?.top_performers || []

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame size={20} className="text-orange-400" />
        <h2 className="font-semibold">🔥 Top performers</h2>
      </div>

      <div className="space-y-3">
        {performers.length > 0 ? (
          performers.map((performer: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">{performer.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      performer.segment === 'VIP'
                        ? 'bg-purple-500/30 text-purple-300'
                        : performer.segment === 'Regular'
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-gray-500/30 text-gray-300'
                    }`}
                  >
                    {performer.segment}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Dépensé</p>
                    <p className="text-sm font-medium text-green-400">
                      {performer.total_spent.toFixed(0)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Interactions</p>
                    <p className="text-sm font-medium text-blue-400">
                      {performer.interaction_count}
                    </p>
                  </div>
                </div>
              </div>
              <TrendingUp size={20} className="text-green-400 mt-1" />
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Pas de données disponibles
          </div>
        )}
      </div>
    </div>
  )
}
