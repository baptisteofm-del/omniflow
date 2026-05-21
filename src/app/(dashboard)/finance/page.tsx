'use client'
import { Suspense, useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Plus, Filter, Download,
  AlertCircle, Zap, Target, Users
} from 'lucide-react'
import { FinanceKPIs } from '@/components/dashboard/finance/FinanceKPIs'
import { RevenueChart } from '@/components/dashboard/finance/RevenueChart'
import { ModelsTable } from '@/components/dashboard/finance/ModelsTable'
import { RecentTransactions } from '@/components/dashboard/finance/RecentTransactions'
import { AddTransactionModal } from '@/components/dashboard/finance/AddTransactionModal'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [txRes, summaryRes] = await Promise.all([
        fetch('/api/finance/transactions'),
        fetch('/api/finance/summary'),
      ])

      if (!txRes.ok || !summaryRes.ok) throw new Error('Failed to fetch')

      const txData = await txRes.json()
      const summaryData = await summaryRes.json()

      setTransactions(txData.transactions || [])
      setSummary(summaryData)
    } catch (error) {
      console.error('Error fetching finance data:', error)
      toast.error('Erreur lors du chargement des données financières')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTransactionAdded = () => {
    fetchData()
    setShowAddModal(false)
  }

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 w-32 bg-gradient-to-r from-white/5 to-white/10 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gradient-to-r from-white/5 to-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-gray-400 mt-1">Gestion financière complète de votre agence</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
            <Filter size={18} />
            Filtrer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
            <Download size={18} />
            Exporter
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus size={18} />
            Ajouter une transaction
          </button>
        </div>
      </div>

      {/* KPIs */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      }>
        <FinanceKPIs summary={summary} />
      </Suspense>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Charts and Tables */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<SkeletonCard />}>
            <RevenueChart transactions={transactions} />
          </Suspense>

          <Suspense fallback={<SkeletonTable rows={5} />}>
            <ModelsTable transactions={transactions} />
          </Suspense>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Suspense fallback={<SkeletonCard />}>
            <RecentTransactions transactions={transactions} />
          </Suspense>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}
    </div>
  )
}
