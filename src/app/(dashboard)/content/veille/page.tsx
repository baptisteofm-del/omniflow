'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp, Loader2, RefreshCw, Zap, Eye,
  Calendar, ShoppingCart, Film, AlertCircle,
  Sparkles, Lock, BarChart3
} from 'lucide-react'
import { OveruseModal } from '@/components/ui/OveruseModal'
import toast from 'react-hot-toast'
import { TrendCard } from '@/components/dashboard/trends/TrendCard'
import { cn } from '@/lib/utils/cn'
import { RUN_PRICE_EUR, RUN_UNITS } from '@/lib/plans'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trend {
  id: string
  platform: string
  title: string
  url: string
  thumbnailUrl?: string
  videoUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: string
  engagement: number
  likes?: number
  postDate?: string
  category: string
  tags: string[]
  capturedAt: Date | string
  userFeedback?: 'like' | 'dislike' | null
}

interface QuotaInfo {
  planId: string
  dailyLimit: number
  usedToday: number
  remaining: number
  canGenerate: boolean
  dailyTrendsCount: number
  resetAt: string
}

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string;
  trendsPerDay: number; runsPerMonth: number
}> = {
  starter: { label: 'Starter', color: 'text-gray-300', bg: 'bg-gray-500/15', border: 'border-gray-500/20', trendsPerDay: 0, runsPerMonth: 0 },
  pro:     { label: 'Pro',     color: 'text-blue-300',  bg: 'bg-blue-500/15',  border: 'border-blue-500/20',  trendsPerDay: 10, runsPerMonth: 30 },
  agency:  { label: 'Agency',  color: 'text-purple-300', bg: 'bg-purple-500/15', border: 'border-purple-500/20', trendsPerDay: 20, runsPerMonth: 30 },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VeillePage() {
  const [trends, setTrends]               = useState<Trend[]>([])
  const [loading, setLoading]             = useState(true)
  const [generating, setGenerating]       = useState(false)
  const [isDemo, setIsDemo]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [quota, setQuota]                 = useState<QuotaInfo | null>(null)
  const [showOveruse, setShowOveruse]     = useState(false)

  // ── Load quota ─────────────────────────────────────────────────────────────
  const loadQuota = useCallback(async () => {
    try {
      const res = await fetch('/api/usage/trends')
      if (res.ok) setQuota(await res.json())
    } catch {}
  }, [])

  // ── Load trends ─────────────────────────────────────────────────────────────
  const loadTrends = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/trends?platform=instagram')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setTrends((data.trends || []).map((t: any) => ({
          ...t,
          capturedAt: t.capturedAt ? new Date(t.capturedAt) : new Date(),
          engagement: typeof t.engagement === 'number' ? t.engagement : 0,
        })))
        setIsDemo(data.source === 'demo')
      } else throw new Error(data.error || 'Erreur API')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTrends(); loadQuota() }, [loadTrends, loadQuota])

  // ── Generate new trends ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!quota?.canGenerate) { setShowOveruse(true); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/trends/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'instagram', limit: RUN_UNITS }),
      })
      const data = await res.json()
      if (data.success) {
        const count = data.trendsCount || 0
        toast.success(
          data.warning
            ? `${count} trend${count > 1 ? 's' : ''} chargé${count > 1 ? 's' : ''} (mode démo)`
            : `${count} nouveau${count > 1 ? 'x' : ''} Reel${count > 1 ? 's' : ''} Instagram récupéré${count > 1 ? 's' : ''} ✓`,
          { duration: 4000 }
        )
        await loadTrends(true)
        await loadQuota()
      } else {
        if (data.error === 'quota_exceeded') { setShowOveruse(true) }
        else toast.error(data.message || 'Erreur de génération')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setGenerating(false)
    }
  }

  const handleFeedback = useCallback((trendId: string, newFeedback: 'like' | 'dislike' | null) => {
    setTrends(prev => prev.map(t => t.id === trendId ? { ...t, userFeedback: newFeedback } : t))
  }, [])

  const planCfg = PLAN_CONFIG[quota?.planId || 'starter'] ?? PLAN_CONFIG.starter
  const noAccess = quota && quota.dailyTrendsCount === 0

  // ─── LOCKED STATE ────────────────────────────────────────────────────────────
  if (!loading && noAccess) {
    return (
      <div className="p-6 lg:p-8 max-w-screen-xl mx-auto">
        <PageHeaderVeille isDemo={false} />
        <div className="mt-8 glass rounded-3xl border border-amber-500/20 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Fonctionnalité Pro & Agency</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            La Veille Trends Instagram est incluse à partir du plan <strong className="text-white">Pro</strong>.
            Détectez les Reels viraux et gardez une longueur d'avance.
          </p>
          <a href="/settings/billing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold text-black text-sm hover:opacity-90 transition-opacity">
            <Zap size={15} />
            Passer au plan Pro
          </a>
        </div>
      </div>
    )
  }

  // ─── MAIN VIEW ────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center">
              <TrendingUp size={17} className="text-pink-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Veille & Tendances</h1>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/12 border border-amber-500/20 text-amber-400 rounded-lg font-medium">
                Mode démo
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Reels Instagram viraux — mis à jour automatiquement chaque matin
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quota pill */}
          {quota && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border',
              quota.canGenerate
                ? 'border-green-500/20 bg-green-500/6 text-green-400'
                : 'border-red-500/20 bg-red-500/6 text-red-400'
            )}>
              <Calendar size={12} />
              {quota.canGenerate
                ? `${quota.remaining}/${quota.dailyLimit} runs ce mois`
                : 'Quota mensuel atteint'}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || loading}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              generating || loading
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : quota?.canGenerate === false
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-pink-500/20'
            )}
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" />Génération…</>
              : quota?.canGenerate === false
                ? <><ShoppingCart size={15} />Acheter un RUN ({RUN_PRICE_EUR}€)</>
                : <><RefreshCw size={15} />Générer {RUN_UNITS} Reels</>
            }
          </button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          icon={Film}
          label="Reels détectés"
          value={trends.length}
          color="text-pink-400"
        />
        <StatPill
          icon={TrendingUp}
          label="Plan actif"
          value={planCfg.label}
          color={planCfg.color}
        />
        <StatPill
          icon={BarChart3}
          label="Veille / jour"
          value={quota?.dailyTrendsCount ?? '—'}
          color="text-blue-400"
        />
        <StatPill
          icon={Sparkles}
          label="Aimés"
          value={trends.filter(t => t.userFeedback === 'like').length}
          color="text-green-400"
        />
      </div>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 glass rounded-2xl border border-pink-500/12 bg-pink-500/3">
        <Zap size={14} className="text-pink-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <span className="text-gray-300 font-medium">Veille automatique</span> —
            {quota?.dailyTrendsCount ?? '?'} Reels Instagram sont générés chaque matin.
            Inspirez-vous des formats viraux et générez du contenu similaire avec l'IA.
          </p>
          <p>
            <span className="text-gray-300 font-medium">RUN manuel</span> —
            Générez {RUN_UNITS} Reels supplémentaires à la demande.
            Quota épuisé : {RUN_PRICE_EUR}€ / RUN.
          </p>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => loadTrends()} className="ml-auto text-xs text-red-400 underline">
            Réessayer
          </button>
        </div>
      )}

      {/* ── Content grid ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="glass rounded-3xl border border-white/5 p-16 text-center">
          <Loader2 size={36} className="mx-auto mb-4 animate-spin text-pink-400" />
          <p className="text-gray-500 text-sm">Chargement des Reels viraux…</p>
        </div>
      ) : trends.length === 0 ? (
        <EmptyState onGenerate={handleGenerate} generating={generating} />
      ) : (
        <TrendsGrid trends={trends} onFeedback={handleFeedback} />
      )}
    </div>

    {showOveruse && (
      <OveruseModal
        feature="trend_run"
        onClose={() => setShowOveruse(false)}
        onSuccess={() => { setShowOveruse(false); handleGenerate() }}
      />
    )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeaderVeille({ isDemo }: { isDemo: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center">
        <TrendingUp size={17} className="text-pink-400" />
      </div>
      <h1 className="text-xl font-bold text-white">Veille & Tendances</h1>
      {isDemo && (
        <span className="text-xs px-2 py-0.5 bg-amber-500/12 border border-amber-500/20 text-amber-400 rounded-lg font-medium">
          Mode démo
        </span>
      )}
    </div>
  )
}

function StatPill({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 border border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-gray-600" />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className={cn('text-sm font-bold', color)}>{value}</span>
    </div>
  )
}

function TrendsGrid({
  trends, onFeedback,
}: {
  trends: Trend[]
  onFeedback: (id: string, feedback: 'like' | 'dislike' | null) => void
}) {
  // Top 3 trends (highest engagement)
  const sorted = [...trends].sort((a, b) => b.engagement - a.engagement)
  const top3   = sorted.slice(0, 3)
  const rest   = sorted.slice(3)

  return (
    <div className="space-y-8">
      {/* Featured section — top 3 */}
      {top3.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white">🔥 Top performances</h2>
            <span className="text-xs text-gray-600">{top3.length} Reels</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {top3.map(trend => (
              <TrendCard
                key={trend.id}
                {...trend}
                isTopTrend
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </section>
      )}

      {/* All other trends */}
      {rest.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye size={14} className="text-gray-500" />
              Tendances détectées
            </h2>
            <span className="text-xs text-gray-600">{rest.length} Reels</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rest.map(trend => (
              <TrendCard
                key={trend.id}
                {...trend}
                isTopTrend={false}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function EmptyState({
  onGenerate, generating,
}: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="glass rounded-3xl border border-white/5 p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-pink-500/12 border border-pink-500/20 flex items-center justify-center mx-auto mb-5">
        <TrendingUp size={28} className="text-pink-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Aucun Reel pour le moment</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
        Lancez votre première veille Instagram pour détecter les Reels viraux du moment.
      </p>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {generating
          ? <><Loader2 size={15} className="animate-spin" />Génération…</>
          : <><RefreshCw size={15} />Générer les Reels</>
        }
      </button>
    </div>
  )
}
