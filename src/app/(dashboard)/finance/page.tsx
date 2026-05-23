'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Plus, Download, Upload, X, AlertTriangle, Lightbulb, Info,
  Calendar, BarChart3, PieChart, Wallet, ChevronRight, Zap,
  Check, Loader2, RefreshCw, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Constantes catégories dépenses OFM ──
const EXPENSE_CATEGORIES = [
  { id: 'chatters',    label: 'Salaires chatters',   color: '#8b5cf6' },
  { id: 'ads',         label: 'Publicité',            color: '#06b6d4' },
  { id: 'software',   label: 'Logiciels / SaaS',     color: '#3b82f6' },
  { id: 'editors',    label: 'Monteurs',              color: '#ec4899' },
  { id: 'ai',         label: 'IA / Outils',           color: '#a855f7' },
  { id: 'marketing',  label: 'Marketing',             color: '#f59e0b' },
  { id: 'commissions',label: 'Commissions',           color: '#10b981' },
  { id: 'freelance',  label: 'Freelances',            color: '#64748b' },
  { id: 'crypto',     label: 'Crypto',                color: '#f97316' },
  { id: 'other',      label: 'Autres',                color: '#6b7280' },
]

const REVENUE_CATEGORIES = [
  { id: 'onlyfans',   label: 'OnlyFans',  color: '#00aff0' },
  { id: 'mym',        label: 'MYM',       color: '#ff6b6b' },
  { id: 'other',      label: 'Autres',    color: '#6b7280' },
]

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const fmtSmall = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n)

// ── Composant barre de chart ──
function BarChart({ data, maxVal }: { data: { label: string; revenue: number; expense: number }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((d, i) => {
        const revH = maxVal > 0 ? Math.round((d.revenue / maxVal) * 100) : 0
        const expH = maxVal > 0 ? Math.round((d.expense / maxVal) * 100) : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-900 border border-white/10 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
              <div className="text-green-400">+{fmt(d.revenue)}</div>
              <div className="text-red-400">-{fmt(d.expense)}</div>
              <div className={d.revenue - d.expense >= 0 ? 'text-white' : 'text-red-300'}>
                = {fmt(d.revenue - d.expense)}
              </div>
            </div>
            <div className="flex items-end gap-0.5 w-full justify-center h-28">
              <div
                className="w-[45%] bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all duration-500 hover:opacity-80"
                style={{ height: `${revH}%`, minHeight: revH > 0 ? '2px' : '0' }}
              />
              <div
                className="w-[45%] bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm transition-all duration-500 hover:opacity-80"
                style={{ height: `${expH}%`, minHeight: expH > 0 ? '2px' : '0' }}
              />
            </div>
            <span className="text-[9px] text-gray-600 truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Composant donut ──
function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  if (total === 0) return (
    <div className="flex items-center justify-center h-28 text-gray-600 text-xs">Aucune donnée</div>
  )
  let offset = 0
  const r = 40
  const circ = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ffffff08" strokeWidth="16" />
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = pct * circ
          const gap = circ - dash
          const ro = offset * circ
          offset += pct
          return (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-ro + circ * 0.25}
              className="transition-all duration-700"
            />
          )
        })}
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-gray-400 truncate">{d.label}</span>
            </div>
            <span className="text-xs font-semibold text-white flex-shrink-0">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Modal ajout transaction ──
function AddTransactionModal({ onClose, onSave, models }: { onClose: () => void; onSave: (data: any) => void; models: any[] }) {
  const [type, setType] = useState<'revenue' | 'expense'>('expense')
  const [form, setForm] = useState({
    amount: '',
    category: 'other',
    description: '',
    model_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'card',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || !form.description) return
    setSaving(true)
    await onSave({ ...form, type, amount: parseFloat(form.amount) })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">Ajouter une transaction</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={16} className="text-gray-400" /></button>
        </div>

        {/* Toggle type */}
        <div className="flex gap-2 mb-5 p-1 bg-white/5 rounded-xl">
          {(['expense', 'revenue'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setForm(f => ({ ...f, category: 'other' })) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === t
                ? t === 'expense' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'expense' ? '💸 Dépense' : '💰 Revenu'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Montant (€) *</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date *</label>
              <input
                type="date" required
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Catégorie *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <input
              type="text" required
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="ex: Salaire chatter Mai"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Modèle</label>
              <select
                value={form.model_id}
                onChange={e => setForm(f => ({ ...f, model_id: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              >
                <option value="">— Aucun —</option>
                {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Paiement</label>
              <select
                value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              >
                <option value="card">Carte</option>
                <option value="crypto">Crypto</option>
                <option value="virement">Virement</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes optionnelles..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════════
export default function FinancePage() {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [showAddModal, setShowAddModal] = useState(false)
  const [models, setModels] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'revenues'>('overview')
  const [syncing, setSyncing] = useState(false)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/finance/summary?period=${period}`)
      if (!res.ok) throw new Error('Erreur API')
      setSummary(await res.json())
    } catch (e) {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchSummary()
    // Fetch models for modal
    fetch('/api/models').then(r => r.json()).then(d => setModels(d.models || d || [])).catch(() => {})
  }, [fetchSummary])

  const handleAddTransaction = async (data: any) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success('Transaction ajoutée ✓')
      setShowAddModal(false)
      fetchSummary()
    } catch {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await Promise.all([
        fetch('/api/integrations/onlyfans/sync', { method: 'POST' }).catch(() => null),
        fetch('/api/integrations/mym/sync', { method: 'POST' }).catch(() => null),
      ])
      await fetchSummary()
      toast.success('Données synchronisées ✓')
    } catch {
      toast.error('Erreur de synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const exportCSV = () => {
    if (!summary?.recentTransactions?.length) return
    const header = 'type,montant,categorie,description,date,modele'
    const rows = summary.recentTransactions.map((t: any) =>
      `${t.type},${t.amount},"${t.category}","${(t.description||'').replace(/"/g,'""')}",${t.date?.split('T')[0]||''},${t.model_id||''}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `omniflow-finances-${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  // Computed
  const maxTrend = Math.max(...(summary?.monthlyTrend || []).map((d: any) => Math.max(d.revenue, d.expense)), 1)

  const expenseChartData = EXPENSE_CATEGORIES
    .map(c => ({ label: c.label, value: summary?.expenseByCategory?.[c.id] || 0, color: c.color }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const revenueChartData = REVENUE_CATEGORIES
    .map(c => ({ label: c.label, value: summary?.byPlatform?.[c.id] || 0, color: c.color }))
    .filter(d => d.value > 0)

  const periodLabels = { month: 'Ce mois', quarter: 'Ce trimestre', year: 'Cette année' }

  const recTips = summary?.recommendations || []

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Suivi des revenus, dépenses et rentabilité</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-xs hover:bg-white/10 transition-all disabled:opacity-50">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            Sync
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-all">
            <Plus size={13} />
            Ajouter
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs hover:bg-white/10 transition-all">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      {!loading && recTips.length > 0 && (
        <div className="mb-5 space-y-2">
          {recTips.map((r: any, i: number) => {
            const iconMap: Record<string, any> = { warning: AlertTriangle, alert: AlertTriangle, info: Lightbulb }
            const colorMap: Record<string, string> = {
              warning: 'bg-amber-500/5 border-amber-500/20 text-amber-300',
              alert: 'bg-red-500/5 border-red-500/20 text-red-300',
              info: 'bg-blue-500/5 border-blue-500/20 text-blue-300',
            }
            const Icon = iconMap[r.type] || Info
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${colorMap[r.type]}`}>
                <div className="flex items-center gap-2">
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="text-xs">{r.message}</span>
                </div>
                {r.href && r.action && (
                  <Link href={r.href} className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-all flex-shrink-0 ml-4">
                    {r.action} <ChevronRight size={11} />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl border border-white/5 h-28 animate-pulse" />)
        ) : (
          <>
            {/* Revenus */}
            <Link href="#revenues"
              className="glass rounded-2xl p-5 border border-green-500/20 hover:border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent hover:scale-[1.02] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 bg-green-500/20 rounded-lg"><DollarSign size={15} className="text-green-400" /></div>
                {summary?.revenueGrowth !== null && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${(summary?.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(summary?.revenueGrowth || 0) >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {summary?.revenueGrowth > 0 ? '+' : ''}{summary?.revenueGrowth}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{summary?.formatted?.totalRevenue || '0 €'}</div>
              <div className="text-xs text-gray-500 mt-0.5">Revenus {periodLabels[period].toLowerCase()}</div>
              {summary?.todayRevenue > 0 && (
                <div className="text-xs text-green-400 mt-1">+{fmt(summary.todayRevenue)} aujourd'hui</div>
              )}
            </Link>

            {/* Dépenses */}
            <div className="glass rounded-2xl p-5 border border-red-500/20 hover:border-red-500/40 bg-gradient-to-br from-red-500/10 to-transparent hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              onClick={() => setActiveTab('expenses')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 bg-red-500/20 rounded-lg"><ArrowDownRight size={15} className="text-red-400" /></div>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{summary?.formatted?.totalExpense || '0 €'}</div>
              <div className="text-xs text-gray-500 mt-0.5">Dépenses {periodLabels[period].toLowerCase()}</div>
              <div className="text-xs text-gray-600 mt-1">{summary?.transactionCount || 0} transactions</div>
            </div>

            {/* Bénéfice net */}
            <div className={`glass rounded-2xl p-5 border hover:scale-[1.02] transition-all duration-300 ${(summary?.netProfit || 0) >= 0 ? 'border-cyan-500/20 hover:border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent' : 'border-red-500/20 hover:border-red-500/40 bg-gradient-to-br from-red-500/10 to-transparent'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-1.5 rounded-lg ${(summary?.netProfit || 0) >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                  <Wallet size={15} className={(summary?.netProfit || 0) >= 0 ? 'text-cyan-400' : 'text-red-400'} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{summary?.formatted?.netProfit || '0 €'}</div>
              <div className="text-xs text-gray-500 mt-0.5">Bénéfice net</div>
              <div className="text-xs text-gray-600 mt-1">Marge : <span className={(summary?.margin || 0) >= 30 ? 'text-green-400' : 'text-amber-400'}>{summary?.margin || 0}%</span></div>
            </div>

            {/* Marge visuelle */}
            <div className="glass rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-transparent hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 bg-purple-500/20 rounded-lg"><BarChart3 size={15} className="text-purple-400" /></div>
                <span className="text-xs text-gray-500">{periodLabels[period]}</span>
              </div>
              <div className="text-2xl font-bold text-white">{summary?.margin || 0}%</div>
              <div className="text-xs text-gray-500 mt-0.5">Taux de marge</div>
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${(summary?.margin || 0) >= 50 ? 'bg-green-500' : (summary?.margin || 0) >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.max(summary?.margin || 0, 0), 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'overview', label: '📊 Vue d\'ensemble' },
          { id: 'revenues', label: '💰 Revenus' },
          { id: 'expenses', label: '💸 Dépenses' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════ VUE D'ENSEMBLE ════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Chart évolution mensuelle */}
          <div className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <BarChart3 size={15} className="text-purple-400" />
                Évolution sur 12 mois
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />Revenus</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />Dépenses</span>
              </div>
            </div>
            {loading ? (
              <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ) : (
              <BarChart data={summary?.monthlyTrend || []} maxVal={maxTrend} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Répartition dépenses */}
            <div className="glass rounded-2xl p-5 border border-white/5 hover:border-red-500/20 transition-all">
              <h2 className="font-semibold flex items-center gap-2 text-sm mb-4">
                <PieChart size={15} className="text-red-400" />
                Répartition des dépenses
              </h2>
              {loading ? (
                <div className="h-28 bg-white/5 rounded-xl animate-pulse" />
              ) : expenseChartData.length > 0 ? (
                <DonutChart data={expenseChartData} total={summary?.totalExpense || 0} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="p-3 bg-white/5 rounded-xl"><PieChart size={20} className="text-gray-600" /></div>
                  <p className="text-xs text-gray-600">Aucune dépense ce mois</p>
                  <button onClick={() => { setShowAddModal(true) }} className="text-xs text-purple-400 hover:text-purple-300">+ Ajouter une dépense</button>
                </div>
              )}
            </div>

            {/* Top modèles */}
            <div className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                  <TrendingUp size={15} className="text-purple-400" />
                  Revenus par modèle
                </h2>
                <Link href="/accounts" className="text-xs text-gray-600 hover:text-purple-400 transition-colors">Voir tous →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded-xl animate-pulse" />)}</div>
              ) : summary?.byModel?.length > 0 ? (
                <div className="space-y-3">
                  {summary.byModel.slice(0, 5).map((m: any, i: number) => {
                    const pct = summary.totalRevenue > 0 ? Math.round((m.revenue / summary.totalRevenue) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-white truncate">{m.name}</span>
                            <span className="text-xs font-bold text-green-400 flex-shrink-0 ml-2">{fmt(m.revenue)}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-600 mb-2">Aucune donnée de revenus</p>
                  <button onClick={() => setShowAddModal(true)} className="text-xs text-purple-400 hover:text-purple-300">+ Ajouter un revenu</button>
                </div>
              )}
            </div>
          </div>

          {/* Transactions récentes */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <Calendar size={15} className="text-cyan-400" />
                Transactions récentes
              </h2>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                <Plus size={11} /> Ajouter
              </button>
            </div>
            <TransactionList transactions={summary?.recentTransactions || []} loading={loading} />
          </div>
        </div>
      )}

      {/* ════════════════════════ REVENUS ════════════════════════ */}
      {activeTab === 'revenues' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <DollarSign size={15} className="text-green-400" />
                Revenus par plateforme
              </h2>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 hover:bg-green-500/20 transition-all">
                <Plus size={11} /> Ajouter
              </button>
            </div>
            {revenueChartData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DonutChart data={revenueChartData} total={summary?.totalRevenue || 0} />
                <div className="space-y-3">
                  {revenueChartData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-sm text-white">{d.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{fmt(d.value)}</div>
                        <div className="text-xs text-gray-500">{Math.round((d.value / (summary?.totalRevenue || 1)) * 100)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-sm mb-3">Connectez OnlyFans ou MYM pour synchroniser vos revenus automatiquement</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/settings/integrations" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                    <Zap size={14} /> Connecter les intégrations
                  </Link>
                  <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-all">
                    <Plus size={14} /> Ajouter manuellement
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h2 className="font-semibold flex items-center gap-2 text-sm mb-4">
              <TrendingUp size={15} className="text-green-400" />
              Revenus par modèle
            </h2>
            <TransactionList transactions={(summary?.recentTransactions || []).filter((t: any) => t.type === 'revenue')} loading={loading} />
          </div>
        </div>
      )}

      {/* ════════════════════════ DÉPENSES ════════════════════════ */}
      {activeTab === 'expenses' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2 text-sm">
                <PieChart size={15} className="text-red-400" />
                Dépenses par catégorie
              </h2>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all">
                <Plus size={11} /> Ajouter une dépense
              </button>
            </div>
            {expenseChartData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <DonutChart data={expenseChartData} total={summary?.totalExpense || 0} />
                  <div className="space-y-2">
                    {expenseChartData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white/3 rounded-xl border border-white/5 hover:bg-white/8 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                          <span className="text-xs text-gray-300">{d.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.round((d.value / (summary?.totalExpense || 1)) * 100)}%`, background: d.color }} />
                          </div>
                          <span className="text-xs font-bold text-white w-16 text-right tabular-nums">{fmt(d.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-3">Aucune dépense enregistrée</p>
                <button onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-all">
                  <Plus size={14} /> Ajouter une dépense
                </button>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h2 className="font-semibold flex items-center gap-2 text-sm mb-4">
              <Filter size={15} className="text-red-400" />
              Liste des dépenses
            </h2>
            <TransactionList transactions={(summary?.recentTransactions || []).filter((t: any) => t.type === 'expense')} loading={loading} />
          </div>
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTransaction}
          models={models}
        />
      )}
    </div>
  )
}

// ── Liste transactions ──
function TransactionList({ transactions, loading }: { transactions: any[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
    </div>
  )
  if (!transactions.length) return (
    <div className="text-center py-6 text-gray-600 text-xs">Aucune transaction</div>
  )
  const allCats = [...EXPENSE_CATEGORIES, ...REVENUE_CATEGORIES]
  return (
    <div className="space-y-1.5">
      {transactions.map((t: any, i: number) => {
        const catInfo = allCats.find(c => c.id === t.category)
        const isRevenue = t.type === 'revenue'
        const dateStr = t.date ? new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'
        return (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isRevenue ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{t.description || '—'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {catInfo && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: catInfo.color + '20', color: catInfo.color }}>{catInfo.label}</span>}
                <span className="text-xs text-gray-600">{dateStr}</span>
              </div>
            </div>
            <span className={`text-xs font-bold flex-shrink-0 tabular-nums ${isRevenue ? 'text-green-400' : 'text-red-400'}`}>
              {isRevenue ? '+' : '-'}{fmtSmall(t.amount || 0)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
