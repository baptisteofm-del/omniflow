'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Plus, Download, X, AlertTriangle, Info, ChevronDown,
  BarChart3, RefreshCw, Filter, Trash2, Check, Loader2,
  DollarSign, Wallet, Activity, Target, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils/cn'

// ── Catégories ──────────────────────────────────────────────
const EXPENSE_CATS = [
  { id: 'chatters',    label: 'Salaires chatters',  color: '#8b5cf6' },
  { id: 'ads',         label: 'Publicité',           color: '#06b6d4' },
  { id: 'software',    label: 'Logiciels / SaaS',    color: '#3b82f6' },
  { id: 'editors',     label: 'Monteurs',             color: '#ec4899' },
  { id: 'ai',          label: 'IA / Outils',          color: '#a855f7' },
  { id: 'marketing',   label: 'Marketing',            color: '#f59e0b' },
  { id: 'commissions', label: 'Commissions',          color: '#10b981' },
  { id: 'freelance',   label: 'Freelances',           color: '#64748b' },
  { id: 'crypto',      label: 'Crypto',               color: '#f97316' },
  { id: 'other',       label: 'Autres',               color: '#6b7280' },
]
const REVENUE_CATS = [
  { id: 'onlyfans', label: 'OnlyFans', color: '#00aff0' },
  { id: 'mym',      label: 'MYM',      color: '#ff6b6b' },
  { id: 'other',    label: 'Autres',   color: '#6b7280' },
]

const fmt  = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const fmt2 = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n)

const PRESETS = [
  { label: '7 jours',    days: 7 },
  { label: '30 jours',   days: 30 },
  { label: '3 mois',     days: 90 },
  { label: '12 mois',    days: 365 },
]

// ── SVG Area Chart ──────────────────────────────────────────
function AreaChart({ data, height = 140 }: { data: { label: string; revenue: number; expense: number }[]; height?: number }) {
  const W = 800; const H = height
  const pad = { top: 12, bottom: 24, left: 0, right: 0 }
  const iW = W - pad.left - pad.right
  const iH = H - pad.top - pad.bottom
  const allVals = data.flatMap(d => [d.revenue, d.expense])
  const maxVal = Math.max(...allVals, 1)

  const toX = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * iW
  const toY = (v: number) => pad.top + iH - (v / maxVal) * iH

  const bezier = (pts: {x: number; y: number}[]) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2
      d += ` C ${cx.toFixed(1)} ${pts[i-1].y.toFixed(1)}, ${cx.toFixed(1)} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`
    }
    return d
  }

  const revPts = data.map((d, i) => ({ x: toX(i), y: toY(d.revenue) }))
  const expPts = data.map((d, i) => ({ x: toX(i), y: toY(d.expense) }))
  const revPath = bezier(revPts)
  const expPath = bezier(expPts)
  const revArea = `${revPath} L ${toX(data.length-1)} ${H} L ${toX(0)} ${H} Z`
  const expArea = `${expPath} L ${toX(data.length-1)} ${H} L ${toX(0)} ${H} Z`

  // Labels (every ~3 points)
  const step = Math.max(1, Math.floor(data.length / 6))
  const labelPts = data.filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d, _, arr) => d)
    .map((d) => ({ label: d.label, x: toX(data.indexOf(d)) }))

  if (data.length === 0) return <div className="h-36 flex items-center justify-center text-gray-700 text-sm">Aucune donnée</div>

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad.left} x2={W} y1={pad.top + iH * (1 - f)} y2={pad.top + iH * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <path d={revArea} fill="url(#gRev)" />
      <path d={expArea} fill="url(#gExp)" />
      <path d={revPath} stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={expPath} stroke="#ef4444" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="4 2" />
      {/* Dots at last point */}
      {revPts.length > 0 && <circle cx={revPts[revPts.length-1].x} cy={revPts[revPts.length-1].y} r="3" fill="#22c55e" />}
      {expPts.length > 0 && <circle cx={expPts[expPts.length-1].x} cy={expPts[expPts.length-1].y} r="3" fill="#ef4444" />}
      {/* Labels */}
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fill="rgba(156,163,175,0.7)" fontSize="11">{p.label}</text>
      ))}
    </svg>
  )
}

// ── Sparkline ───────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null
  const W = 80; const H = 28
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / max) * H * 0.8 + 2 }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="opacity-70">
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ── Horizontal Bar ──────────────────────────────────────────
function HBar({ label, value, max, color, pct }: { label: string; value: number; max: number; color: string; pct: number }) {
  const w = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
      <span className="text-xs text-gray-400 w-28 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-white w-16 text-right tabular-nums flex-shrink-0">{fmt(value)}</span>
      <span className="text-xs text-gray-600 w-8 text-right flex-shrink-0">{pct}%</span>
    </div>
  )
}

// ── Date Range Picker ───────────────────────────────────────
function DateRangePicker({ from, to, onChange }: { from: string; to: string; onChange: (f: string, t: string) => void }) {
  const [open, setOpen] = useState(false)
  const [localFrom, setLocalFrom] = useState(from)
  const [localTo, setLocalTo] = useState(to)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocalFrom(from); setLocalTo(to) }, [from, to])
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const apply = (f: string, t: string) => { onChange(f, t); setOpen(false) }
  const applyPreset = (days: number) => {
    const t = new Date(); const f = new Date(t.getTime() - days * 86400000)
    apply(f.toISOString().split('T')[0], t.toISOString().split('T')[0])
  }

  const fromLabel = new Date(from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
  const toLabel   = new Date(to).toLocaleDateString('fr-FR',   { day: 'numeric', month: 'short', year: '2-digit' })

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 hover:bg-white/10 transition-all">
        <Filter size={12} className="text-gray-500" />
        <span className="tabular-nums">{fromLabel}</span>
        <span className="text-gray-600">—</span>
        <span className="tabular-nums">{toLabel}</span>
        <ChevronDown size={12} className={cn('text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-[#12121c] border border-white/10 rounded-2xl p-4 shadow-2xl w-72">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {PRESETS.map(p => (
              <button key={p.days} onClick={() => applyPreset(p.days)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all text-center">
                {p.label}
              </button>
            ))}
            <button onClick={() => { const y = new Date(); const f = new Date(y.getFullYear(), 0, 1); apply(f.toISOString().split('T')[0], y.toISOString().split('T')[0]) }}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
              Cette année
            </button>
            <button onClick={() => { const y = new Date(); const f = new Date(y.getFullYear(), y.getMonth(), 1); apply(f.toISOString().split('T')[0], y.toISOString().split('T')[0]) }}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
              Ce mois
            </button>
          </div>
          <div className="border-t border-white/5 pt-3 space-y-2">
            <p className="text-xs text-gray-600 mb-2">Période personnalisée</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Du</label>
                <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Au</label>
                <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-purple-500/50 focus:outline-none" />
              </div>
            </div>
            <button onClick={() => apply(localFrom, localTo)}
              className="w-full py-2 mt-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-all">
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modal Transaction ───────────────────────────────────────
function TransactionModal({ onClose, onSave, models }: { onClose: () => void; onSave: (d: any) => Promise<void>; models: any[] }) {
  const [type, setType] = useState<'expense' | 'revenue'>('expense')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ amount: '', category: 'other', description: '', model_id: '', date: new Date().toISOString().split('T')[0], payment_method: 'virement', notes: '' })
  const cats = type === 'expense' ? EXPENSE_CATS : REVENUE_CATS
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Nouvelle transaction</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={15} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            {(['expense', 'revenue'] as const).map(t => (
              <button key={t} onClick={() => { setType(t); set('category', 'other') }}
                className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                  type === t ? (t === 'expense' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30')
                  : 'text-gray-500 hover:text-gray-300')}>
                {t === 'expense' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Montant (€) *</label>
              <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Date *</label>
              <input type="date" required value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Catégorie *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors">
              {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Description *</label>
            <input type="text" required value={form.description} onChange={e => set('description', e.target.value)} placeholder="ex: Abonnement AdsPower"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Modèle <span className="text-gray-700">(optionnel)</span></label>
              <select value={form.model_id} onChange={e => set('model_id', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors">
                <option value="">— Global agence —</option>
                {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Méthode</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-colors">
                <option value="virement">Virement</option>
                <option value="crypto">Crypto</option>
                <option value="card">Carte</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">
              Annuler
            </button>
            <button onClick={async () => { if (!form.amount || !form.description) return; setSaving(true); await onSave({ ...form, type }); setSaving(false) }} disabled={saving || !form.amount || !form.description}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function FinancePage() {
  const now = new Date()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'all' | 'onlyfans' | 'mym'>('all')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'revenues' | 'expenses' | 'models'>('overview')

  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const defaultTo   = now.toISOString().split('T')[0]
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo]     = useState(defaultTo)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to, platform: platform === 'all' ? '' : platform })
      if (modelFilter !== 'all') params.set('model_id', modelFilter)
      const res = await fetch(`/api/finance/summary?${params}`)
      if (res.ok) setSummary(await res.json())
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [from, to, platform, modelFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then(d => setModels(d.models || d || [])).catch(() => {})
  }, [])

  const handleSave = async (data: any) => {
    const res = await fetch('/api/finance/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) { toast.error('Erreur lors de l\'ajout'); return }
    toast.success('Transaction ajoutée')
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await fetch(`/api/finance/transactions?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Transaction supprimée'); fetchData() } else toast.error('Erreur')
    setDeletingId(null)
  }

  const handleSync = async () => {
    setSyncing(true)
    await Promise.all([
      fetch('/api/integrations/onlyfans/sync', { method: 'POST' }).catch(() => null),
      fetch('/api/integrations/mym/sync', { method: 'POST' }).catch(() => null),
    ])
    await fetchData()
    toast.success('Synchronisé')
    setSyncing(false)
  }

  const exportCSV = () => {
    if (!summary?.recentTransactions?.length) return
    const h = 'type,montant,categorie,description,date,modele,methode'
    const rows = summary.recentTransactions.map((t: any) =>
      `${t.type},${t.amount},"${t.category}","${(t.description||'').replace(/"/g,'""')}",${t.date?.split('T')[0]||''},${t.model_id||''},${t.payment_method||''}`)
    const b = new Blob([[h, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(b)
    a.download = `finances-${from}-${to}.csv`; a.click()
  }

  // Computed
  const s = summary || {}
  const chartData = s.monthlyTrend || []
  const sparkRevenue = chartData.map((d: any) => d.revenue)
  const sparkExpense = chartData.map((d: any) => d.expense)
  const sparkMargin  = chartData.map((d: any) => d.margin)

  const expenseRows = EXPENSE_CATS
    .map(c => ({ ...c, value: s.expenseByCategory?.[c.id] || 0 }))
    .filter(r => r.value > 0).sort((a, b) => b.value - a.value)
  const maxExp = Math.max(...expenseRows.map(r => r.value), 1)

  const platformRows = REVENUE_CATS
    .map(c => ({ ...c, value: s.byPlatform?.[c.id] || 0 }))
    .filter(r => r.value > 0)
  const maxPlatform = Math.max(...platformRows.map(r => r.value), 1)

  const KPICard = ({ title, value, sub, growth, sparkData, sparkColor, icon: Icon, accent }: any) => (
    <div className={cn('glass rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.01] group', accent)}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all">
          <Icon size={16} className="text-gray-400" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {growth !== null && growth !== undefined && (
            <span className={cn('flex items-center gap-0.5 text-xs font-semibold tabular-nums', growth >= 0 ? 'text-green-400' : 'text-red-400')}>
              {growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {growth > 0 ? '+' : ''}{growth}%
            </span>
          )}
          {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
        </div>
      </div>
      <div className="text-2xl font-bold text-white tabular-nums tracking-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{title}</div>
      {sub && <div className="text-xs text-gray-700 mt-0.5">{sub}</div>}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Finance</h1>
          <p className="text-xs text-gray-600 mt-0.5 tabular-nums">{from} — {to} · {s.transactionCount || 0} transactions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform filter */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {(['all', 'onlyfans', 'mym'] as const).map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  platform === p ? 'bg-white/15 text-white' : 'text-gray-600 hover:text-gray-300')}>
                {p === 'all' ? 'Toutes plates.' : p === 'onlyfans' ? 'OnlyFans' : 'MYM'}
              </button>
            ))}
          </div>
          {/* Model filter */}
          {models.length > 0 && (
            <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500/50 transition-colors">
              <option value="all">Tous les modèles</option>
              {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t) }} />
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:bg-white/10 transition-all disabled:opacity-40">
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            Sync
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-all">
            <Plus size={12} />
            Ajouter
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:bg-white/10 transition-all">
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ────────────────────────────────── */}
      {!loading && (s.recommendations || []).length > 0 && (
        <div className="mb-5 space-y-1.5">
          {s.recommendations.map((r: any, i: number) => (
            <div key={i} className={cn('flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs',
              r.type === 'alert' ? 'bg-red-950/30 border-red-500/20 text-red-300' : r.type === 'warning' ? 'bg-amber-950/30 border-amber-500/20 text-amber-300' : 'bg-blue-950/30 border-blue-500/20 text-blue-300')}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>{r.message}</span>
              </div>
              {r.href && <Link href={r.href} className="flex items-center gap-1 font-medium hover:opacity-70 transition-opacity flex-shrink-0 ml-4">Voir <ArrowUpRight size={10} /></Link>}
            </div>
          ))}
        </div>
      )}

      {/* ── KPI CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="h-32 glass rounded-2xl border border-white/5 animate-pulse" />) : <>
          <KPICard title="Chiffre d'affaires" value={s.formatted?.totalRevenue || '0 €'} growth={s.revenueGrowth} sparkData={sparkRevenue} sparkColor="#22c55e" icon={DollarSign} accent="border-green-500/15 hover:border-green-500/30" sub={s.todayRevenue > 0 ? `+${fmt(s.todayRevenue)} auj.` : null} />
          <KPICard title="Dépenses totales" value={s.formatted?.totalExpense || '0 €'} growth={s.expenseGrowth} sparkData={sparkExpense} sparkColor="#ef4444" icon={ArrowDownRight} accent="border-red-500/15 hover:border-red-500/30" sub={s.expenseRatio > 0 ? `${s.expenseRatio}% du CA` : null} />
          <KPICard title="Bénéfice net" value={s.formatted?.netProfit || '0 €'} sparkData={chartData.map((d: any) => Math.max(d.profit, 0))} sparkColor={(s.netProfit || 0) >= 0 ? '#06b6d4' : '#ef4444'} icon={Wallet} accent={(s.netProfit || 0) >= 0 ? 'border-cyan-500/15 hover:border-cyan-500/30' : 'border-red-500/15'} />
          <KPICard title="Marge nette" value={`${s.margin || 0}%`} sparkData={sparkMargin} sparkColor="#a855f7" icon={Target} accent="border-purple-500/15 hover:border-purple-500/30" sub={(s.margin || 0) >= 30 ? 'Saine' : 'À améliorer'} />
          <KPICard title="Revenu / jour moy." value={s.formatted?.dailyAvg || '0 €'} icon={Activity} accent="border-white/5 hover:border-white/15" sub={`sur ${s.period?.days || 30} jours`} />
        </>}
      </div>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'overview',  label: 'Vue globale' },
          { id: 'revenues',  label: 'Revenus' },
          { id: 'expenses',  label: 'Dépenses' },
          { id: 'models',    label: 'Modèles' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════ VUE GLOBALE ════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Main Chart */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Évolution mensuelle</h2>
                <p className="text-xs text-gray-600 mt-0.5">Revenus vs dépenses sur 12 mois</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-green-500 inline-block rounded" />Revenus</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500 inline-block rounded border-dashed" />Dépenses</span>
              </div>
            </div>
            {loading ? <div className="h-36 bg-white/5 rounded-xl animate-pulse" /> : <AreaChart data={chartData} height={140} />}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Platform breakdown */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Revenus par plateforme</h2>
              {platformRows.length > 0 ? (
                <div className="space-y-3">
                  {platformRows.map(r => (
                    <HBar key={r.id} label={r.label} value={r.value} max={maxPlatform} color={r.color}
                      pct={s.totalRevenue > 0 ? Math.round((r.value / s.totalRevenue) * 100) : 0} />
                  ))}
                  {s.byPlatform && Object.entries(s.byPlatform).filter(([k]) => !REVENUE_CATS.find(c => c.id === k)).map(([k, v]) => (
                    <HBar key={k} label={k} value={v as number} max={maxPlatform} color="#6b7280"
                      pct={s.totalRevenue > 0 ? Math.round(((v as number) / s.totalRevenue) * 100) : 0} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-gray-600 mb-3">Connectez OnlyFans ou MYM pour voir vos revenus par plateforme</p>
                  <Link href="/settings/integrations" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 justify-center">
                    Connecter les intégrations <ArrowUpRight size={11} />
                  </Link>
                </div>
              )}
            </div>

            {/* Expense ratio */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Ratio dépenses / CA</h2>
                <span className={cn('text-xs font-semibold tabular-nums', (s.expenseRatio || 0) > 60 ? 'text-red-400' : (s.expenseRatio || 0) > 40 ? 'text-amber-400' : 'text-green-400')}>
                  {s.expenseRatio || 0}%
                </span>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                  <span>0%</span><span className="text-green-400">Optimal &lt;40%</span><span>100%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-green-500 via-amber-500 to-red-500"
                    style={{ width: `${Math.min(s.expenseRatio || 0, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-gray-600">CA : <span className="text-green-400 tabular-nums">{s.formatted?.totalRevenue || '0 €'}</span></span>
                  <span className="text-gray-600">Dép. : <span className="text-red-400 tabular-nums">{s.formatted?.totalExpense || '0 €'}</span></span>
                </div>
              </div>
              {/* Top expense categories */}
              <div className="space-y-2">
                {expenseRows.slice(0, 4).map(r => (
                  <HBar key={r.id} label={r.label} value={r.value} max={maxExp} color={r.color}
                    pct={s.totalExpense > 0 ? Math.round((r.value / s.totalExpense) * 100) : 0} />
                ))}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <TxTable transactions={s.recentTransactions || []} loading={loading} onDelete={handleDelete} deletingId={deletingId} onAdd={() => setShowModal(true)} />
        </div>
      )}

      {/* ════════════ REVENUS ════════════ */}
      {activeTab === 'revenues' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Revenus par plateforme</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 hover:bg-green-500/20 transition-all">
                <Plus size={11} />Ajouter
              </button>
            </div>
            {platformRows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {platformRows.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ background: r.color }} /><span className="text-sm text-white">{r.label}</span></div>
                      <div className="text-right"><div className="text-sm font-bold text-white tabular-nums">{fmt(r.value)}</div><div className="text-xs text-gray-600">{s.totalRevenue > 0 ? Math.round((r.value / s.totalRevenue) * 100) : 0}% du CA</div></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">CA total</div>
                    <div className="text-2xl font-bold text-white tabular-nums">{s.formatted?.totalRevenue || '0 €'}</div>
                    {s.revenueGrowth !== null && <div className={cn('text-xs mt-1', (s.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400')}>{(s.revenueGrowth || 0) > 0 ? '+' : ''}{s.revenueGrowth}% vs période préc.</div>}
                  </div>
                  <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Revenu journalier moyen</div>
                    <div className="text-xl font-bold text-white tabular-nums">{s.formatted?.dailyAvg || '0 €'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-gray-500">Connectez OnlyFans ou MYM pour synchroniser vos revenus</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/settings/integrations" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-all">Connecter les intégrations</Link>
                  <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-xs hover:bg-white/10 transition-all">Saisie manuelle</button>
                </div>
              </div>
            )}
          </div>
          <TxTable transactions={(s.recentTransactions || []).filter((t: any) => t.type === 'revenue')} loading={loading} onDelete={handleDelete} deletingId={deletingId} onAdd={() => setShowModal(true)} />
        </div>
      )}

      {/* ════════════ DÉPENSES ════════════ */}
      {activeTab === 'expenses' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Répartition des dépenses</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all">
                <Plus size={11} />Ajouter
              </button>
            </div>
            {expenseRows.length > 0 ? (
              <div className="space-y-2.5">
                {expenseRows.map(r => (
                  <HBar key={r.id} label={r.label} value={r.value} max={maxExp} color={r.color}
                    pct={s.totalExpense > 0 ? Math.round((r.value / s.totalExpense) * 100) : 0} />
                ))}
                <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-gray-500">Total dépenses</span>
                  <span className="text-white font-bold tabular-nums">{s.formatted?.totalExpense || '0 €'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-gray-600">Aucune dépense enregistrée pour cette période</p>
                <button onClick={() => setShowModal(true)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Ajouter une dépense</button>
              </div>
            )}
          </div>
          <TxTable transactions={(s.recentTransactions || []).filter((t: any) => t.type === 'expense')} loading={loading} onDelete={handleDelete} deletingId={deletingId} onAdd={() => setShowModal(true)} />
        </div>
      )}

      {/* ════════════ MODÈLES ════════════ */}
      {activeTab === 'models' && (
        <div className="glass rounded-2xl border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white mb-5">Performance par modèle</h2>
          {(s.byModel || []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-white/5">
                    <th className="text-left pb-3 font-medium">Modèle</th>
                    <th className="text-right pb-3 font-medium">CA</th>
                    <th className="text-right pb-3 font-medium">Dépenses</th>
                    <th className="text-right pb-3 font-medium">Bénéfice</th>
                    <th className="text-right pb-3 font-medium">Marge</th>
                    <th className="pb-3 w-24">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {s.byModel.map((m: any, i: number) => {
                    const totalRev = s.totalRevenue || 1
                    const share = Math.round((m.revenue / totalRev) * 100)
                    return (
                      <tr key={m.id || i} className="group hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {m.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm text-white font-medium">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm text-green-400 font-semibold tabular-nums">{fmt(m.revenue)}</td>
                        <td className="py-3 text-right text-sm text-red-400 tabular-nums">{fmt(m.expense)}</td>
                        <td className={cn('py-3 text-right text-sm font-semibold tabular-nums', m.profit >= 0 ? 'text-cyan-400' : 'text-red-400')}>{fmt(m.profit)}</td>
                        <td className={cn('py-3 text-right text-xs tabular-nums font-semibold', m.margin >= 30 ? 'text-green-400' : m.margin >= 0 ? 'text-amber-400' : 'text-red-400')}>{m.margin}%</td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 w-8 text-right">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600 text-sm">Aucune donnée de revenus par modèle</div>
          )}
        </div>
      )}

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={handleSave} models={models} />}
    </div>
  )
}

// ── Transaction Table ────────────────────────────────────────
function TxTable({ transactions, loading, onDelete, deletingId, onAdd }: { transactions: any[]; loading: boolean; onDelete: (id: string) => void; deletingId: string | null; onAdd: () => void }) {
  const allCats = [...EXPENSE_CATS, ...REVENUE_CATS]
  return (
    <div className="glass rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Transactions</h2>
        <button onClick={onAdd} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors">
          <Plus size={12} />Ajouter
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-600">Aucune transaction pour cette période</div>
      ) : (
        <div className="space-y-1">
          {transactions.map((t: any, i: number) => {
            const cat = allCats.find(c => c.id === t.category)
            const isRev = t.type === 'revenue'
            const dateStr = t.date ? new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'
            return (
              <div key={t.id || i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 group transition-all">
                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isRev ? 'bg-green-400' : 'bg-red-400')} />
                <span className="text-xs text-gray-600 w-16 flex-shrink-0 tabular-nums">{dateStr}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white truncate block">{t.description || '—'}</span>
                </div>
                {cat && <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 hidden sm:block" style={{ background: cat.color + '18', color: cat.color }}>{cat.label}</span>}
                {t.payment_method && <span className="text-xs text-gray-700 flex-shrink-0 hidden md:block uppercase tracking-wide">{t.payment_method}</span>}
                <span className={cn('text-xs font-bold tabular-nums flex-shrink-0 w-20 text-right', isRev ? 'text-green-400' : 'text-red-400')}>
                  {isRev ? '+' : '-'}{fmt2(t.amount || 0)}
                </span>
                <button onClick={() => onDelete(t.id)} disabled={deletingId === t.id}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50 flex-shrink-0">
                  {deletingId === t.id ? <Loader2 size={12} className="animate-spin text-gray-500" /> : <Trash2 size={12} className="text-gray-600 hover:text-red-400 transition-colors" />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
