import { TrendingUp, Clock } from 'lucide-react'

interface DailyReportCardProps {
  reports: any
  insights: any
}

export function DailyReportCard({ reports, insights }: DailyReportCardProps) {
  const today = reports?.today || {}
  const yesterday = reports?.yesterday || {}

  const getChangeIcon = (current: number, previous: number) => {
    if (previous === 0) return null
    const change = current - previous
    return change >= 0 ? '📈' : '📉'
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-cyan-400" />
        <h2 className="font-semibold">Rapport quotidien</h2>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Résumé du jour</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Messages envoyés</p>
              <p className="text-lg font-bold text-cyan-300">
                {today.messages_sent || 0}
                <span className="text-xs text-gray-400 ml-1">
                  {getChangeIcon(today.messages_sent || 0, yesterday.messages_sent || 0)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenus générés</p>
              <p className="text-lg font-bold text-green-300">
                {(today.revenue || 0).toFixed(0)}€
                <span className="text-xs text-gray-400 ml-1">
                  {getChangeIcon(today.revenue || 0, yesterday.revenue || 0)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Insights IA</h3>

          {insights?.peak_hours && (
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <Clock size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Heure de pointe:</span> {insights.peak_hours}
                </p>
                <p className="text-xs text-gray-500">Les fans répondent le mieux à cette heure</p>
              </div>
            </div>
          )}

          {insights?.best_response_rate && (
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <TrendingUp size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Meilleur taux:</span> {insights.best_response_rate}
                </p>
                <p className="text-xs text-gray-500">Maximisez vos interactions à cette plage horaire</p>
              </div>
            </div>
          )}

          {insights?.engagement_trend && (
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <TrendingUp size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Tendance:</span> {insights.engagement_trend}
                </p>
                <p className="text-xs text-gray-500">Votre engagement global s'améliore</p>
              </div>
            </div>
          )}
        </div>

        {/* Comparison */}
        <div className="text-xs text-gray-500 bg-white/5 p-3 rounded-lg">
          <p>
            Comparé à hier: {today.messages_sent || 0} vs {yesterday.messages_sent || 0} messages
          </p>
        </div>
      </div>
    </div>
  )
}
