'use client'
import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'

interface RevenueChartProps {
  transactions: any[]
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month (last 6 months)
    const monthsData: { [key: string]: { revenue: number; expense: number } } = {}
    
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
      monthsData[key] = { revenue: 0, expense: 0 }
    }

    transactions.forEach(tx => {
      const date = new Date(tx.date)
      const key = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
      
      if (monthsData[key]) {
        if (tx.type === 'revenue') {
          monthsData[key].revenue += tx.amount || 0
        } else {
          monthsData[key].expense += tx.amount || 0
        }
      }
    })

    return Object.entries(monthsData).map(([month, data]) => ({
      month,
      ...data,
    }))
  }, [transactions])

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.revenue, d.expense))
  )

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-cyan-400" />
        <h2 className="font-semibold">Évolution revenus / dépenses (6 mois)</h2>
      </div>

      <div className="space-y-5">
        {chartData.map((item, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{item.month}</span>
              <div className="text-right">
                <p className="text-sm font-bold text-green-400">{item.revenue.toFixed(0)}€</p>
                <p className="text-xs text-gray-500">{item.expense.toFixed(0)}€ dépenses</p>
              </div>
            </div>
            <div className="flex gap-2 h-6">
              {/* Revenue bar */}
              <div
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-lg transition-all duration-500 hover:shadow-lg hover:shadow-green-500/50"
                style={{
                  width: `${maxValue > 0 ? (item.revenue / maxValue) * 100 : 0}%`,
                  minWidth: item.revenue > 0 ? '6px' : '0px',
                }}
                title={`Revenus: ${item.revenue.toFixed(2)}€`}
              />
              {/* Expense bar */}
              <div
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-lg transition-all duration-500 hover:shadow-lg hover:shadow-red-500/50"
                style={{
                  width: `${maxValue > 0 ? (item.expense / maxValue) * 100 : 0}%`,
                  minWidth: item.expense > 0 ? '6px' : '0px',
                }}
                title={`Dépenses: ${item.expense.toFixed(2)}€`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 mt-8 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50" />
          <span className="text-sm text-gray-400">Revenus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-red-500/50" />
          <span className="text-sm text-gray-400">Dépenses</span>
        </div>
      </div>
    </div>
  )
}
