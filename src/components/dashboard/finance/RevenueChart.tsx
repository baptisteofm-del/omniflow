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

      <div className="space-y-4">
        {chartData.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{item.month}</span>
              <span className="text-sm font-medium">
                {item.revenue.toFixed(0)}€ / {item.expense.toFixed(0)}€
              </span>
            </div>
            <div className="flex gap-1 h-8">
              {/* Revenue bar */}
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm flex-1"
                style={{
                  width: `${maxValue > 0 ? (item.revenue / maxValue) * 100 : 0}%`,
                  minWidth: item.revenue > 0 ? '4px' : '0px',
                }}
                title={`Revenus: ${item.revenue.toFixed(2)}€`}
              />
              {/* Expense bar */}
              <div
                className="bg-gradient-to-r from-red-500 to-rose-500 rounded-sm flex-1"
                style={{
                  width: `${maxValue > 0 ? (item.expense / maxValue) * 100 : 0}%`,
                  minWidth: item.expense > 0 ? '4px' : '0px',
                }}
                title={`Dépenses: ${item.expense.toFixed(2)}€`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
          <span className="text-sm text-gray-400">Revenus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
          <span className="text-sm text-gray-400">Dépenses</span>
        </div>
      </div>
    </div>
  )
}
