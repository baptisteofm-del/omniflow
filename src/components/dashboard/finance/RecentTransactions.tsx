import { ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: any[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={20} className="text-pink-400" />
        <h2 className="font-semibold">Transactions récentes</h2>
      </div>

      <div className="space-y-3">
        {recent.length > 0 ? (
          recent.map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === 'revenue'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tx.type === 'revenue' ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowDownLeft size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {tx.category} • {tx.model_name || 'Model'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-sm font-medium ${
                    tx.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {tx.type === 'revenue' ? '+' : '-'}{tx.amount?.toFixed(2)}€
                </span>
                <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Aucune transaction trouvée
          </div>
        )}
      </div>

      {transactions.length > 10 && (
        <button className="mt-4 w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors border border-purple-400/20 rounded-lg hover:border-purple-400/40">
          Voir toutes les transactions
        </button>
      )}
    </div>
  )
}
