import { MessageSquare, DollarSign, Target, AlertTriangle } from 'lucide-react'

interface ChattingKPIsProps {
  reports: any
}

export function ChattingKPIs({ reports }: ChattingKPIsProps) {
  const today = reports?.today || {}
  const yesterday = reports?.yesterday || {}

  const getChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return '—'
    const change = ((today - yesterday) / yesterday) * 100
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`
  }

  const kpis = [
    {
      label: "Messages envoyés aujourd'hui",
      value: today.messages_sent || 0,
      change: getChange(today.messages_sent || 0, yesterday.messages_sent || 0),
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Revenus (chatting)',
      value: today.revenue ? `${today.revenue.toFixed(0)}€` : '0€',
      change: getChange(today.revenue || 0, yesterday.revenue || 0),
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Taux de conversion',
      value: `${(today.conversion_rate || 0).toFixed(1)}%`,
      change: getChange(today.conversion_rate || 0, yesterday.conversion_rate || 0),
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Fans à risque',
      value: today.at_risk_count || 0,
      change: '',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className={`glass rounded-2xl p-5 ${kpi.bgColor}`}>
          <div className="flex items-center justify-between mb-3">
            <kpi.icon size={20} className={kpi.color} />
            {kpi.change && <span className="text-xs text-gray-400">{kpi.change}</span>}
          </div>
          <div className="text-2xl font-bold mb-1">{kpi.value}</div>
          <div className="text-sm text-gray-400">{kpi.label}</div>
        </div>
      ))}
    </div>
  )
}
