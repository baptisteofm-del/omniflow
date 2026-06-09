'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface AddTransactionModalProps {
  onClose: () => void
  onSuccess: () => void
}

const REVENUE_CATEGORIES = ['OnlyFans', 'Tips', 'PPV', 'Autre']
const EXPENSE_CATEGORIES = ['VA', 'Logiciels', 'Publicité', 'Équipement', 'Autre']

export function AddTransactionModal({ onClose, onSuccess }: AddTransactionModalProps) {
  const [type, setType] = useState('revenue')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('OnlyFans')
  const [description, setDescription] = useState('')
  const [modelId, setModelId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch models on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models')
        if (res.ok) {
          const data = await res.json()
          setModels(data.models || [])
          if (data.models && data.models.length > 0) {
            setModelId(data.models[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }

    fetchModels()
  }, [])

  const categories = type === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description || !modelId) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category,
          description,
          model_id: modelId,
          date,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create transaction')
      }

      toast.success('Transaction ajoutée avec succès')
      onSuccess()
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Erreur lors de la création de la transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Ajouter une transaction</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm font-medium block mb-2">Type</label>
            <div className="flex gap-2">
              {['revenue', 'expense'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t)
                    setCategory(t === 'revenue' ? 'OnlyFans' : 'VA')
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    type === t
                      ? t === 'revenue'
                        ? 'bg-green-500/30 text-green-300 border border-green-400'
                        : 'bg-red-500/30 text-red-300 border border-red-400'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {t === 'revenue' ? '💰 Revenu' : '📊 Dépense'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium block mb-2">Montant (€)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium block mb-2">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a1a2e]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-medium block mb-2">Modèle</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id} className="bg-[#1a1a2e]">
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de la transaction..."
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium block mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-400 focus:outline-none text-white text-sm"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
