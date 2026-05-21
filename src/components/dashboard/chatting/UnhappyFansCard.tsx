import { AlertTriangle, MessageCircle } from 'lucide-react'

interface UnhappyFansCardProps {
  insights: any
}

export function UnhappyFansCard({ insights }: UnhappyFansCardProps) {
  const unhappyFans = insights?.unhappy_fans || []

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle size={20} className="text-red-400" />
        <h2 className="font-semibold">⚠️ Fans mécontents détectés</h2>
      </div>

      <div className="space-y-3">
        {unhappyFans.length > 0 ? (
          unhappyFans.map((fan: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                fan.risk_level === 'red'
                  ? 'bg-red-500/10 border-red-500'
                  : 'bg-orange-500/10 border-orange-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{fan.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{fan.reason}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    fan.risk_level === 'red'
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-orange-500/30 text-orange-300'
                  }`}
                >
                  {fan.risk_level === 'red' ? 'Critique' : 'Attention'}
                </span>
              </div>
              <button className="mt-3 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                <MessageCircle size={14} />
                Prendre en charge
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tous vos fans semblent heureux! 🎉
          </div>
        )}
      </div>
    </div>
  )
}
