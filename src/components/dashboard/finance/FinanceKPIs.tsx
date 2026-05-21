import { BarChart3, TrendingUp, TrendingDown, Zap } from 'lucide-react'

interface FinanceKPIsProps {
  summary: any
}

export function FinanceKPIs({ summary }: FinanceKPIsProps) {
  const kpis = [
    {
      label: 'Revenus du mois',
      value: summary?.totalRevenue ? `${summary.totalRevenue.toFixed(2)}€` : '0€',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Dépenses du mois',
      value: summary?.totalExpense ? `${summary.totalExpense.toFixed(2)}€` : '0€',
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Bénéfice net',
      value: summary?.netProfit ? `${summary.netProfit.toFixed(2)}€` : '0€',
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Meilleur modèle',
      value: summary?.topPerformer?.name || '-',
      subtitle: summary?.topPerformer ? `${summary.topPerformer.revenue.toFixed(2)}€` : '',
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className={`glass rounded-2xl p-5 ${kpi.bgColor}`}>
          <div className="flex items-center justify-between mb-3">
            <kpi.icon size={20} className={kpi.color} />
          </div>
          <div className="text-2xl font-bold mb-1">{kpi.value}</div>
          {kpi.subtitle && <div className="text-xs text-gray-400 mb-1">{kpi.subtitle}</div>}
          <div className="text-sm text-gray-400">{kpi.label}</div>
        </div>
      ))}
    </div>
  )
}
