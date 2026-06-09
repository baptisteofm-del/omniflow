'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  TrendingUp, TrendingDown, MessageSquare, DollarSign, Target,
  AlertTriangle, Zap, ArrowUpRight, Clock, Users, BarChart3,
  Activity, Shield, Bell, BellOff, RefreshCw, Filter,
  ChevronRight, Loader2, CheckCircle2, XCircle, Eye, Heart
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// ── SVG Mini Bar Chart ─────────────────────────────────────
function MiniBar({ data, color = '#8b5cf6' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">

      <PageHeader
        icon={BarChart3}
        title="Rapports chatting"
        subtitle="Analytics et statistiques"
        iconColor="text-orange-400"
        iconBg="bg-orange-500/10"
      />
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
      ))}
    </div>
  )
}

// ── Trend Indicator ─────────────────────────────────────────
function Trend({ value, suffix = '%' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-xs text-gray-600">—</span>
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-semibold', value > 0 ? 'text-green-400' : 'text-red-400')}>
      {value > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {value > 0 ? '+' : ''}{value}{suffix}
    </span>
  )
}

// ── Severity Badge ─────────────────────────────────────────
function SeverityBadge({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const cfg = {
    critical: { label: 'Critique',  color: 'bg-red-500/15 text-red-400 border-red-500/25' },
    high:     { label: 'Élevé',     color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
    medium:   { label: 'Moyen',     color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
    low:      { label: 'Faible',    color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  }[level]
  return <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', cfg.color)}>{cfg.label}</span>
}

// ── Alert Config Modal ─────────────────────────────────────
function AlertConfigModal({ config, onSave, onClose }: {
  config: any; onSave: (c: any) => void; onClose: () => void
}) {
  const [local, setLocal] = useState(config)
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Bell size={14} className="text-purple-400" />Configuration des alertes</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-gray-400 text-sm">✕</button>
        </div>
        <div className="space-y-4">
          {/* Inactivité */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Alerte d'inactivité chatting</label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20, 30, 60, 120].map(m => (
                <button key={m} onClick={() => setLocal((l: any) => ({ ...l, inactivity_minutes: m }))}
                  className={cn('py-2 rounded-xl border text-xs font-medium transition-all',
                    local.inactivity_minutes === m ? 'border-purple-500/40 bg-purple-500/15 text-purple-300' : 'border-white/8 text-gray-500 hover:border-white/15')}>
                  {m < 60 ? `${m} min` : `${m / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Canaux */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Canaux de notification</label>
            <div className="space-y-2">
              {/* OmniFlow in-app */}
              <label className="flex items-center justify-between p-2.5 bg-white/3 border border-white/8 rounded-xl cursor-pointer hover:bg-white/5">
                <span className="text-xs text-gray-300">Notification OmniFlow (in-app)</span>
                <input type="checkbox" checked={local.notify_saas}
                  onChange={e => setLocal((l: any) => ({ ...l, notify_saas: e.target.checked }))}
                  className="accent-purple-500" />
              </label>

              {/* Telegram agence */}
              <label className="flex items-start justify-between p-2.5 bg-white/3 border border-white/8 rounded-xl cursor-pointer hover:bg-white/5 gap-3">
                <div>
                  <p className="text-xs text-gray-300">Alerte via Telegram agence</p>
                  {!local.telegram_username
                    ? <p className="text-xs text-gray-600 mt-0.5">Connectez votre Telegram ci-dessous</p>
                    : <p className="text-xs text-green-500 mt-0.5">{local.telegram_username} — connecté</p>
                  }
                </div>
                <input type="checkbox" checked={!!local.notify_telegram && !!local.telegram_username}
                  disabled={!local.telegram_username}
                  onChange={e => setLocal((l: any) => ({ ...l, notify_telegram: e.target.checked }))}
                  className="accent-purple-500 disabled:opacity-40 mt-0.5" />
              </label>

              {/* Connexion Telegram agence */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-blue-300">Connexion Telegram de l'agence</p>
                <p className="text-xs text-gray-600">Distinct du Bot Telegram modèles — pour recevoir vos alertes OmniFlow personnellement.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="@username ou Chat ID"
                    value={local.telegram_username || ''}
                    onChange={e => setLocal((l: any) => ({ ...l, telegram_username: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:border-blue-500/40 focus:outline-none"
                  />
                  {local.telegram_username && (
                    <button onClick={() => setLocal((l: any) => ({ ...l, telegram_username: '', notify_telegram: false }))}
                      className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-all">
                      Retirer
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-700">Utilisez @userinfobot sur Telegram pour obtenir votre Chat ID</p>
              </div>
            </div>
          </div>

          {/* Types d'alertes */}
          <div>
            <label className="text-xs text-gray-500 block mb-2">Types d'alertes</label>
            <div className="space-y-2">
              {[
                { key: 'alert_unhappy',  label: 'Fan mécontent détecté',    desc: 'Sentiment négatif ou plainte détectés' },
                { key: 'alert_missed',   label: 'Opportunité manquée',       desc: 'Vente potentielle non convertie' },
                { key: 'alert_drop',     label: 'Baisse de performance',     desc: 'Revenus ou messages en baisse' },
                { key: 'alert_response', label: 'Temps de réponse trop long', desc: 'Délai de réponse au-delà du seuil' },
              ].map(a => (
                <label key={a.key} className="flex items-start justify-between p-2.5 bg-white/3 border border-white/8 rounded-xl cursor-pointer hover:bg-white/5 gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 font-medium">{a.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.desc}</p>
                  </div>
                  <input type="checkbox" checked={local[a.key] !== false}
                    onChange={e => setLocal((l: any) => ({ ...l, [a.key]: e.target.checked }))}
                    className="accent-purple-500 mt-0.5 flex-shrink-0" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Annuler</button>
          <button onClick={() => { onSave(local); onClose() }}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
const DEFAULT_ALERT_CONFIG = {
  inactivity_minutes: 20,
  notify_saas: true,
  notify_telegram: false,
  telegram_username: '',
  alert_unhappy: true,
  alert_missed: true,
  alert_drop: true,
  alert_response: true,
}

export default function ChattingReportsPage() {
  const [reports, setReports]         = useState<any>(null)
  const [insights, setInsights]       = useState<any>(null)
  const [stats, setStats]             = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [hasIntegrations, setHasIntegrations] = useState(false)
  const [integrations, setIntegrations]       = useState<any[]>([])
  const [platform, setPlatform]       = useState<'all' | 'onlyfans' | 'mym'>('all')
  const [activeTab, setActiveTab]     = useState<'overview' | 'fans' | 'opportunities' | 'alerts'>('overview')
  const [planId, setPlanId]           = useState('starter')
  const [showAlertConfig, setShowAlertConfig] = useState(false)
  const [alertConfig, setAlertConfig] = useState(DEFAULT_ALERT_CONFIG)

  // Load alert config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatting_alert_config')
    if (saved) try { setAlertConfig(JSON.parse(saved)) } catch {}
  }, [])

  const saveAlertConfig = (cfg: any) => {
    setAlertConfig(cfg)
    localStorage.setItem('chatting_alert_config', JSON.stringify(cfg))
    toast.success('Configuration enregistrée')
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [integRes, reportsRes, insightsRes, statsRes, usageRes] = await Promise.all([
        fetch('/api/integrations'),
        fetch('/api/chatting/reports'),
        fetch('/api/chatting/insights'),
        fetch('/api/chatting/stats'),
        fetch('/api/usage'),
      ])

      if (integRes.ok) {
        const d = await integRes.json()
        const list = d.integrations || []
        setIntegrations(list)
        setHasIntegrations(list.some((i: any) => (i.tool === 'onlyfans' || i.tool === 'mym') && i.is_active))
      }
      if (reportsRes.ok) setReports(await reportsRes.json())
      if (insightsRes.ok) setInsights(await insightsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
      if (usageRes.ok) { const d = await usageRes.json(); setPlanId(d.plan?.id || 'starter') }
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Rapport Chatting accessible à tous les plans (Starter, Pro, Agency)
  // Les AI Insights avancés restent réservés au plan Agency
  const hasPro = planId === 'starter' || planId === 'pro' || planId === 'agency'

  // ── Connexion requise ──────────────────────────────────────
  if (!loading && !hasIntegrations) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Rapports Chatting</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analyse IA des performances chatting</p>
        </div>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="glass rounded-2xl p-10 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap size={24} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Connexion requise</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Connectez <span className="text-white font-medium">OnlyFans</span> ou <span className="text-white font-medium">MYM</span> pour accéder aux rapports chatting.
            </p>
            <Link href="/settings/integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
              <Zap size={14} />Connecter les intégrations
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Plan insuffisant ───────────────────────────────────────
  if (!loading && !hasPro) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Rapports Chatting</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analyse IA des performances chatting</p>
        </div>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="glass rounded-2xl p-10 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield size={24} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Plan Pro requis</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Les Rapports Chatting sont disponibles à partir du plan <strong className="text-white">Pro</strong>.
            </p>
            <Link href="/settings/billing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
              <ArrowUpRight size={14} />Passer au plan Pro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Data extracts ──────────────────────────────────────────
  const today     = reports?.today || {}
  const yesterday = reports?.yesterday || {}
  const insightsList     = insights?.unhappyFans || []
  const missedList       = insights?.missedOpportunities || []
  const topPerformers    = insights?.topPerformers || []
  const aiInsights       = insights?.aiInsights || []

  const msgGrowth = yesterday.messages_sent > 0
    ? Math.round(((today.messages_sent - yesterday.messages_sent) / yesterday.messages_sent) * 100) : 0
  const revGrowth = yesterday.revenue > 0
    ? Math.round(((today.revenue - yesterday.revenue) / yesterday.revenue) * 100) : 0

  // Fake weekly spark for demo (would come from real weekly data)
  const weeklyMsgs = [stats?.msgToday || 0, 45, 62, 38, 71, 55, today.messages_sent || 0]
  const weeklyRev  = [0, 120, 85, 210, 150, 95, today.revenue || 0]

  const kpiCards = [
    { label: 'Messages aujourd\'hui', value: today.messages_sent || 0, trend: msgGrowth, spark: weeklyMsgs, color: '#8b5cf6', icon: MessageSquare, suffix: '' },
    { label: 'Revenus générés', value: `${today.revenue || 0}€`, trend: revGrowth, spark: weeklyRev, color: '#22c55e', icon: DollarSign, suffix: '' },
    { label: 'Taux de conversion', value: `${today.conversion_rate || 0}%`, trend: 0, spark: [2,3,2,4,3,5,today.conversion_rate||0], color: '#06b6d4', icon: Target, suffix: '' },
    { label: 'Fans à risque', value: today.at_risk_count || insightsList.length, trend: 0, spark: [1,2,0,1,3,2,insightsList.length], color: '#ef4444', icon: AlertTriangle, suffix: '' },
  ]

  const platformFilter = (
    <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
      {(['all', 'onlyfans', 'mym'] as const).map(p => (
        <button key={p} onClick={() => setPlatform(p)}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            platform === p ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
          {p === 'all' ? 'Toutes' : p === 'onlyfans' ? 'OnlyFans' : 'MYM'}
        </button>
      ))}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 size={21} className="text-purple-400" />
            Rapports Chatting
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Analyse IA des performances · {hasPro ? (planId === 'agency' ? 'Analyses avancées' : 'Analyses standard') : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {platformFilter}
          <button onClick={fetchData} disabled={loading}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={cn('text-gray-400', loading && 'animate-spin')} />
          </button>
          <button onClick={() => setShowAlertConfig(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:bg-white/10 transition-all">
            <Bell size={13} />Alertes
          </button>
        </div>
      </div>

      {/* ── INTEGRATIONS STATUS ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {[{ tool: 'onlyfans', label: 'OnlyFans' }, { tool: 'mym', label: 'MYM' }].map(i => {
          const active = integrations.find(x => x.tool === i.tool)?.is_active
          return (
            <div key={i.tool} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs',
              active ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-white/10 bg-white/3 text-gray-600')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-green-400 animate-pulse' : 'bg-gray-700')} />
              {i.label} — {active ? 'Connecté · Données actives' : 'Non connecté'}
            </div>
          )
        })}
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-28 glass rounded-2xl border border-white/5 animate-pulse" />) : (
          kpiCards.map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
                    <Icon size={14} style={{ color: card.color }} />
                  </div>
                  <Trend value={card.trend} />
                </div>
                <div className="text-xl font-bold text-white tabular-nums mb-0.5">{card.value}</div>
                <div className="text-xs text-gray-500 mb-2">{card.label}</div>
                <MiniBar data={card.spark} color={card.color} />
              </div>
            )
          })
        )}
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'overview',      label: 'Vue globale' },
          { id: 'fans',          label: `Fans (${insightsList.length})` },
          { id: 'opportunities', label: `Opportunités (${missedList.length})` },
          { id: 'alerts',        label: 'Alertes' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ VUE GLOBALE ════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Stats étendues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Performance du jour */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Activity size={14} className="text-cyan-400" />
                Performance du jour
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Messages envoyés',   value: today.messages_sent || 0,       unit: '',  color: 'text-purple-400', prev: yesterday.messages_sent || 0 },
                  { label: 'Revenus générés',    value: `${today.revenue || 0}€`,       unit: '',  color: 'text-green-400',  prev: yesterday.revenue || 0, prevFmt: `${yesterday.revenue || 0}€` },
                  { label: 'Taux de conversion', value: `${today.conversion_rate || 0}%`, unit: '', color: 'text-cyan-400',  prev: yesterday.conversion_rate || 0, prevFmt: `${yesterday.conversion_rate || 0}%` },
                  { label: 'Fans à risque',      value: today.at_risk_count || 0,        unit: '',  color: 'text-red-400',   prev: 0 },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">vs hier: {row.prevFmt || row.prev}</span>
                      <span className={cn('text-sm font-bold tabular-nums', row.color)}>{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top performers */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Users size={14} className="text-yellow-400" />
                Top fans du jour
              </h2>
              {topPerformers.length > 0 ? (
                <div className="space-y-2.5">
                  {topPerformers.slice(0, 5).map((fan: any, i: number) => (
                    <div key={fan.id || i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-700 w-4 tabular-nums">{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {(fan.name || 'F').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{fan.name || 'Fan anonyme'}</p>
                        <div className="h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" style={{ width: `${Math.min((fan.total_spent || 0) / 5, 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-400 tabular-nums flex-shrink-0">{fan.total_spent || 0}€</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-600 text-xs">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          {planId === 'agency' && (
            <div className="glass rounded-2xl p-5 border border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-transparent">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Zap size={14} className="text-yellow-400" />
                Insights IA
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full">Agency</span>
              </h2>
              {aiInsights.length > 0 ? (
                <div className="space-y-2">
                  {aiInsights.map((insight: any, i: number) => (
                    <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl border text-xs',
                      insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                      : insight.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-300'
                      : 'bg-blue-500/5 border-blue-500/20 text-blue-300')}>
                      <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                      <span>{insight.message || insight}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600">Analyse IA en cours d'initialisation — disponible dès que des conversations sont synchronisées.</p>
              )}
            </div>
          )}

          {/* Stats stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Messages approuvés',  value: stats.approved || 0,    color: 'text-green-400' },
                { label: 'Messages rejetés',    value: stats.rejected || 0,    color: 'text-red-400' },
                { label: 'En attente',          value: stats.pending || 0,     color: 'text-yellow-400' },
                { label: 'Modèles actifs IA',   value: stats.activeModels || 0, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-3.5 border border-white/5">
                  <div className={cn('text-xl font-bold tabular-nums mb-0.5', s.color)}>{s.value}</div>
                  <div className="text-xs text-gray-600">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ FANS ════════ */}
      {activeTab === 'fans' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                Fans mécontents / à risque
              </h2>
              {insightsList.length > 0 && <span className="text-xs text-gray-600">{insightsList.length} détectés</span>}
            </div>
            {insightsList.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-3 text-green-500/40" />
                <p className="text-xs text-gray-600">Aucun fan mécontent détecté</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {insightsList.map((fan: any, i: number) => {
                  const level = fan.risk_level === 'red' ? 'critical' : fan.risk_level === 'orange' ? 'high' : 'medium'
                  return (
                    <div key={fan.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {(fan.name || 'F').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{fan.name || 'Fan anonyme'}</p>
                        <p className="text-xs text-gray-500 truncate">{fan.reason || 'Sentiment négatif détecté'}</p>
                      </div>
                      <SeverityBadge level={level} />
                      <Link href="/chatting/ai" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 flex-shrink-0">
                        Répondre <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ OPPORTUNITÉS ════════ */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target size={14} className="text-orange-400" />
                Opportunités de vente manquées
              </h2>
              {missedList.length > 0 && <span className="text-xs text-gray-600">{missedList.length} détectées</span>}
            </div>
            {missedList.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 size={28} className="mx-auto mb-3 text-green-500/40" />
                <p className="text-xs text-gray-600">Aucune opportunité manquée détectée</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {missedList.map((opp: any, i: number) => (
                  <div key={opp.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-yellow-500/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {(opp.name || 'F').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{opp.name || 'Fan anonyme'}</p>
                      <p className="text-xs text-gray-500">
                        {opp.days_since_purchase > 0 ? `Pas d'achat depuis ${opp.days_since_purchase}j` : 'Conversation non convertie'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-orange-400 tabular-nums">{opp.estimated_potential || 0}€</p>
                      <p className="text-xs text-gray-600">potentiel</p>
                    </div>
                    <Link href="/chatting/ai" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 flex-shrink-0">
                      Relancer <ArrowUpRight size={10} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ ALERTES ════════ */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bell size={14} className="text-purple-400" />
                Système d'alertes intelligent
              </h2>
              <button onClick={() => setShowAlertConfig(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all">
                <Filter size={11} />Configurer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Inactivité */}
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-yellow-400" />
                    <span className="text-xs font-semibold text-white">Inactivité chatting</span>
                  </div>
                  <span className="text-xs text-yellow-400 font-medium">
                    {alertConfig.inactivity_minutes < 60
                      ? `${alertConfig.inactivity_minutes} min`
                      : `${alertConfig.inactivity_minutes / 60}h`}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Alerte si aucun chatter actif pendant la durée définie.</p>
              </div>

              {/* Canaux actifs */}
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-white">Canaux de notification</span>
                </div>
                <div className="space-y-1.5">
                  <div className={cn('flex items-center gap-2 text-xs', alertConfig.notify_saas ? 'text-green-400' : 'text-gray-600')}>
                    {alertConfig.notify_saas ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    Notification OmniFlow (in-app)
                  </div>
                  <div className={cn('flex items-center gap-2 text-xs', alertConfig.notify_telegram && (alertConfig as any).telegram_username ? 'text-green-400' : 'text-gray-600')}>
                    {alertConfig.notify_telegram && (alertConfig as any).telegram_username ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    Telegram agence{(alertConfig as any).telegram_username ? ` — ${(alertConfig as any).telegram_username}` : ' — non connecté'}
                  </div>
                </div>
              </div>
            </div>

            {/* Types d'alertes actives */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { key: 'alert_unhappy',  label: 'Fan mécontent' },
                { key: 'alert_missed',   label: 'Opportunité manquée' },
                { key: 'alert_drop',     label: 'Baisse de performance' },
                { key: 'alert_response', label: 'Temps de réponse' },
              ].map(a => (
                <span key={a.key} className={cn('text-xs px-2.5 py-1 rounded-full border',
                  (alertConfig as any)[a.key]
                    ? 'border-green-500/25 bg-green-500/10 text-green-400'
                    : 'border-white/8 text-gray-600')}>
                  {(alertConfig as any)[a.key] ? '✓ ' : ''}{a.label}
                </span>
              ))}
            </div>
          </div>

          {/* Accès Telegram */}
          <div className="glass rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white mb-0.5">Telegram agence (alertes OmniFlow)</p>
                <p className="text-xs text-gray-600">
                  {(alertConfig as any).telegram_username
                    ? `Connecté : ${(alertConfig as any).telegram_username}`
                    : 'Configurez votre Telegram personnel pour recevoir les alertes.'}
                </p>
              </div>
              <button onClick={() => setShowAlertConfig(true)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 hover:bg-blue-500/15 transition-all flex-shrink-0">
                Configurer <ArrowUpRight size={10} />
              </button>
            </div>
            <div className="p-2.5 bg-white/3 border border-white/5 rounded-lg">
              <p className="text-xs text-gray-600">Distinct du <Link href="/telegram" className="text-blue-400 hover:text-blue-300 underline">Bot Telegram modèles</Link> — celui-ci est réservé à vos notifications personnelles d'agence.</p>
            </div>
          </div>
        </div>
      )}

      {showAlertConfig && (
        <AlertConfigModal
          config={alertConfig}
          onSave={saveAlertConfig}
          onClose={() => setShowAlertConfig(false)}
        />
      )}
    </div>
  )
}
