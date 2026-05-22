'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import {
  Plus, Filter, Download, Upload, FileText, X, Check, Loader2
} from 'lucide-react'
import { FinanceKPIs } from '@/components/dashboard/finance/FinanceKPIs'
import { RevenueChart } from '@/components/dashboard/finance/RevenueChart'
import { ModelsTable } from '@/components/dashboard/finance/ModelsTable'
import { RecentTransactions } from '@/components/dashboard/finance/RecentTransactions'
import { AddTransactionModal } from '@/components/dashboard/finance/AddTransactionModal'
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

// ── CSV helpers ──
const CSV_TEMPLATE_HEADER = 'type,amount,category,description,date,model_id'
const CSV_TEMPLATE_ROWS = [
  'revenue,150.00,onlyfans,Tips Sofia,2026-05-01,',
  'revenue,45.00,mym,PPV Camille,2026-05-02,',
  'expense,29.99,software,AdsPower abonnement,2026-05-03,',
  'expense,9.99,software,GeeLark licence,2026-05-03,',
]

function exportToCSV(transactions: any[]) {
  const rows = transactions.map((t) => [
    t.type,
    t.amount,
    t.category,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.date ? new Date(t.date).toISOString().split('T')[0] : '',
    t.model_id || '',
  ].join(','))
  const csv = [CSV_TEMPLATE_HEADER, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `omniflow-finances-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  const csv = [CSV_TEMPLATE_HEADER, ...CSV_TEMPLATE_ROWS].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'omniflow-transactions-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function parseAndImportCSV(file: File): Promise<{ parsed: any[]; errors: string[] }> {
  const text = await file.text()
  const lines = text.trim().split('\n')
  const errors: string[] = []
  const parsed: any[] = []

  // Skip header
  const dataLines = lines[0].toLowerCase().includes('type') ? lines.slice(1) : lines

  dataLines.forEach((line, idx) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    const [type, amount, category, description, date, model_id] = cols
    if (!type || !amount) { errors.push(`Ligne ${idx + 2}: manque type ou montant`); return }
    const parsed_amount = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsed_amount)) { errors.push(`Ligne ${idx + 2}: montant invalide "${amount}"`); return }
    parsed.push({ type, amount: parsed_amount, category: category || 'other', description: description || '', date, model_id })
  })

  return { parsed, errors }
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importPreview, setImportPreview] = useState<any[] | null>(null)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all')
  const csvRef = useRef<HTMLInputElement>(null)

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

  const handleCSVFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { parsed, errors } = await parseAndImportCSV(file)
    setImportPreview(parsed)
    setImportErrors(errors)
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    if (!importPreview || importPreview.length === 0) return
    setImportLoading(true)
    try {
      const res = await fetch('/api/finance/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: importPreview }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${data.imported} transactions importées ✓`)
        setShowImportModal(false)
        setImportPreview(null)
        fetchData()
      } else {
        toast.error(data.error || 'Erreur import')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setImportLoading(false)
    }
  }

  const filteredTransactions = filterType === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filterType)

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-gray-400 mt-1">Gestion financière complète de votre agence</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                filterType !== 'all'
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Filter size={16} />
              {filterType === 'all' ? 'Filtrer' : filterType === 'revenue' ? '📈 Recettes' : '📉 Dépenses'}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#1a1625] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                {(['all', 'revenue', 'expense'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilterType(f); setShowFilterMenu(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filterType === f ? 'bg-violet-500/20 text-violet-300' : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {f === 'all' ? '🔍 Tout afficher' : f === 'revenue' ? '📈 Recettes seulement' : '📉 Dépenses seulement'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(transactions)}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Exporter CSV
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Upload size={16} />
            Importer CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus size={16} />
            Ajouter
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
            <ModelsTable transactions={filteredTransactions} />
          </Suspense>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Suspense fallback={<SkeletonCard />}>
            <RecentTransactions transactions={filteredTransactions} />
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

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12111a] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={20} className="text-violet-400" />
                Importer des transactions
              </h3>
              <button onClick={() => { setShowImportModal(false); setImportPreview(null) }} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Format info */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-5">
              <p className="text-blue-300 text-sm font-medium mb-1">Format CSV attendu</p>
              <code className="text-xs text-gray-400 font-mono">
                type, amount, category, description, date, model_id
              </code>
              <br />
              <code className="text-xs text-gray-500 font-mono">
                revenue,150.00,onlyfans,Tips Sofia,2026-05-01,<br />
                expense,29.99,software,AdsPower,2026-05-03,
              </code>
              <button
                onClick={downloadTemplate}
                className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              >
                <FileText size={13} /> Télécharger le template CSV
              </button>
            </div>

            {/* File picker */}
            {!importPreview && (
              <div
                onClick={() => csvRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-violet-500/40 transition-colors"
              >
                <Upload size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">Cliquez pour choisir un fichier CSV</p>
                <p className="text-gray-600 text-xs mt-1">.csv · encodage UTF-8</p>
              </div>
            )}
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />

            {/* Errors */}
            {importErrors.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium mb-1">⚠️ {importErrors.length} erreur(s) ignorée(s)</p>
                {importErrors.map((e, i) => <p key={i} className="text-xs text-red-400/70">{e}</p>)}
              </div>
            )}

            {/* Preview */}
            {importPreview && importPreview.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-3">
                  {importPreview.length} transaction(s) prête(s) à importer
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {importPreview.slice(0, 20).map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          t.type === 'revenue' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>{t.type === 'revenue' ? '↑' : '↓'}</span>
                        <span className="text-gray-300 truncate max-w-[200px]">{t.description}</span>
                      </div>
                      <span className={`font-semibold ${
                        t.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                      }`}>{t.type === 'revenue' ? '+' : '-'}{t.amount.toFixed(2)}€</span>
                    </div>
                  ))}
                  {importPreview.length > 20 && (
                    <p className="text-center text-gray-600 text-xs py-2">... et {importPreview.length - 20} autres</p>
                  )}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => { setImportPreview(null); setImportErrors([]) }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20"
                  >
                    Changer de fichier
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={importLoading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50"
                  >
                    {importLoading
                      ? <><Loader2 size={16} className="animate-spin" />Import...
                      </>
                      : <><Check size={16} />Importer {importPreview.length} lignes</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
