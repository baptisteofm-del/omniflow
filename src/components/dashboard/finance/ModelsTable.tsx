import { useMemo } from 'react'
import { TrendingUp, Users } from 'lucide-react'

interface ModelsTableProps {
  transactions: any[]
}

export function ModelsTable({ transactions }: ModelsTableProps) {
  const modelStats = useMemo(() => {
    const stats: { [key: string]: any } = {}

    transactions.forEach(tx => {
      if (!stats[tx.model_id]) {
        stats[tx.model_id] = {
          model_id: tx.model_id,
          model_name: tx.model_name || 'Model ' + tx.model_id,
          revenue: 0,
          expense: 0,
        }
      }

      if (tx.type === 'revenue') {
        stats[tx.model_id].revenue += tx.amount || 0
      } else {
        stats[tx.model_id].expense += tx.amount || 0
      }
    })

    return Object.values(stats)
      .map((s: any) => ({
        ...s,
        profit: s.revenue - s.expense,
        margin: s.revenue > 0 ? ((s.profit / s.revenue) * 100).toFixed(1) : 0,
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
  }, [transactions])

  const totalRevenue = modelStats.reduce((sum, m) => sum + m.revenue, 0)

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users size={20} className="text-purple-400" />
        <h2 className="font-semibold">Performance par modèle</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Modèle</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenus</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Dépenses</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Bénéfice</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">% du total</th>
            </tr>
          </thead>
          <tbody>
            {modelStats.length > 0 ? (
              modelStats.map((model) => (
                <tr key={model.model_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium">{model.model_name}</td>
                  <td className="py-3 px-4 text-right text-green-400">{model.revenue.toFixed(2)}€</td>
                  <td className="py-3 px-4 text-right text-red-400">{model.expense.toFixed(2)}€</td>
                  <td className={`py-3 px-4 text-right font-medium ${model.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {model.profit.toFixed(2)}€
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-purple-400 font-medium">
                        {totalRevenue > 0 ? ((model.revenue / totalRevenue) * 100).toFixed(0) : 0}%
                      </span>
                      <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          style={{
                            width: `${totalRevenue > 0 ? (model.revenue / totalRevenue) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Aucune transaction trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
