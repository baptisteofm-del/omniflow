'use client'
import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Loader2, AlertCircle, Zap, Eye, Calendar, RefreshCw, ShoppingCart } from 'lucide-react'
import { OveruseModal } from '@/components/ui/OveruseModal'
import toast from 'react-hot-toast'
import { TrendCard } from '@/components/dashboard/trends/TrendCard'
import { cn } from '@/lib/utils/cn'
import { RUN_PRICE_EUR, RUN_UNITS } from '@/lib/plans'

interface Trend {
  id: string
  platform: string
  title: string
  url: string
  thumbnailUrl?: string
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
  dailyTrendsCount: number   // trends par veille (5 / 10 / 20 selon plan)
  resetAt: string
}

const CATEGORIES = ['lifestyle', 'fitness', 'glamour', 'fashion', 'beauty', 'wellness', 'motivation', 'travel', 'dance']
const CATEGORY_EMOJIS: Record<string, string> = {
  lifestyle: '✨', fitness: '💪', glamour: '💄', fashion: '👗',
  beauty: '💅', wellness: '🧘', motivation: '🔥', travel: '🌍', dance: '💃',
}

export default function VeillePage() {
  const [trends, setTrends]         = useState<Trend[]>([])
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [category, setCategory]     = useState<string | null>(null)
  const [isDemo, setIsDemo]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [quota, setQuota]           = useState<QuotaInfo | null>(null)
  const [showOveruse, setShowOveruse] = useState(false)

  // Charge le quota utilisateur
  const loadQuota = useCallback(async () => {
    try {
      const res = await fetch('/api/usage/trends')
      if (res.ok) setQuota(await res.json())
    } catch {}
  }, [])

  // Charge les trends depuis la DB (ou mock)
  const loadTrends = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ platform: 'instagram' })
      if (category) params.set('category', category)
      const res = await fetch(`/api/trends?${params}`)
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
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    loadTrends()
    loadQuota()
  }, [loadTrends, loadQuota])

  // Génération manuelle (1 RUN = 10 trends)
  const handleRun = async () => {
    if (!quota?.canGenerate) {
      setShowOveruse(true)
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/trends/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'instagram', limit: RUN_UNITS }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        const count = data.trendsCount || 0
        toast.success(
          data.warning
            ? `${count} trend${count > 1 ? 's' : ''} chargé${count > 1 ? 's' : ''} (mode démo)`
            : `${count} nouveau${count > 1 ? 'x' : ''} trend${count > 1 ? 's' : ''} Instagram récupéré${count > 1 ? 's' : ''} ✓`
        )
        await loadTrends(true)
        await loadQuota()
      } else throw new Error(data.error || 'Erreur de génération')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setGenerating(false)
    }
  }

  // Callback feedback
  const handleFeedback = useCallback((trendId: string, newFeedback: 'like' | 'dislike' | null) => {
    setTrends(prev => prev.map(t => t.id === trendId ? { ...t, userFeedback: newFeedback } : t))
  }, [])

  // Filtrage par catégorie
  const filteredTrends = category ? trends.filter(t => t.category === category) : trends

  // Séparation daily / manual (les 1er = daily auto, le reste = manual)
  const dailyCount = quota?.dailyTrendsCount ?? 5
  const dailyTrends = filteredTrends.slice(0, dailyCount)
  const extraTrends = filteredTrends.slice(dailyCount)

  // Stats
  const likedCount    = trends.filter(t => t.userFeedback === 'like').length
  const dislikedCount = trends.filter(t => t.userFeedback === 'dislike').length

  const planLabel: Record<string, string> = {
    trial: 'Essai', starter: 'Starter', pro: 'Pro', agency: 'Agency',
  }

  return (
    <>
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp size={22} className="text-pink-400" />
            Veille Instagram
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tendances Instagram du jour — mis à jour automatiquement chaque matin
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Indicateur démo */}
          {isDemo && (
            <span className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              Mode démo
            </span>
          )}

          {/* Quota journalier */}
          {quota && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border',
              quota.canGenerate
                ? 'border-green-500/20 bg-green-500/5 text-green-400'
                : 'border-red-500/20 bg-red-500/5 text-red-400'
            )}>
              <Calendar size={11} />
              {quota.canGenerate
                ? `${quota.remaining}/${quota.dailyLimit} runs restants`
                : 'Quota journalier atteint'}
            </div>
          )}

          {/* Bouton RUN principal */}
          <button
            onClick={handleRun}
            disabled={generating}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              generating
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : quota?.canGenerate === false
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:opacity-90'
            )}
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" />Génération...</>
              : quota?.canGenerate === false
                ? <><ShoppingCart size={15} />Acheter un RUN ({RUN_PRICE_EUR}€)</>
                : <><RefreshCw size={15} />Générer {RUN_UNITS} trends</>}
          </button>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500">Trends</span>
          <span className="text-lg font-bold text-pink-400">{trends.length}</span>
        </div>
        <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500">Plan</span>
          <span className="text-lg font-bold text-purple-400">{planLabel[quota?.planId || ''] || '—'}</span>
        </div>
        <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500">Aimés 👍</span>
          <span className="text-lg font-bold text-green-400">{likedCount}</span>
        </div>
        <div className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-500">Ignorés 👎</span>
          <span className="text-lg font-bold text-red-400">{dislikedCount}</span>
        </div>
      </div>

      {/* ── INFO RUN ── */}
      <div className="glass rounded-xl p-4 border border-pink-500/15 bg-pink-500/3">
        <div className="flex items-start gap-3">
          <Zap size={15} className="text-pink-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs text-gray-500">
            <p>
              <strong className="text-gray-300">Veille quotidienne automatique</strong> —
              {dailyCount} trends Instagram sont générés chaque matin selon votre plan.
            </p>
            <p>
              <strong className="text-gray-300">RUN manuel</strong> — Générez {RUN_UNITS} nouveaux trends à la demande.
              Si votre quota est atteint : {RUN_PRICE_EUR}€ / RUN supplémentaire.
            </p>
            <p>
              <strong className="text-gray-300">Feedback 👍👎</strong> — Notez les trends pour affiner vos recommandations.
            </p>
          </div>
        </div>
      </div>

      {/* ── ERREUR ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => loadTrends()} className="ml-auto text-xs text-red-400 underline hover:no-underline">Réessayer</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── FILTRES CATÉGORIE ── */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5 border border-white/5 sticky top-6 space-y-5">
            <h2 className="text-sm font-semibold text-white">Filtres</h2>

            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-2.5">Catégorie</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setCategory(null)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs font-medium transition-all border text-left',
                    category === null
                      ? 'bg-white/10 text-white border-purple-500/40'
                      : 'text-gray-500 border-white/5 hover:text-gray-300 hover:border-white/20'
                  )}>
                  ✨ Toutes les catégories
                </button>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c ? null : c)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-medium transition-all border text-left capitalize',
                      category === c
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                        : 'text-gray-500 border-white/5 hover:text-gray-300 hover:border-white/20'
                    )}>
                    {CATEGORY_EMOJIS[c] || '•'} {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Légende feedback */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest">Votre feedback</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">👍</span>
                  <span>J'aime ce contenu → plus de ce type</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">👎</span>
                  <span>Pas intéressant → moins de ce type</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <Loader2 size={36} className="mx-auto mb-4 animate-spin text-pink-400" />
              <p className="text-gray-500 text-sm">Chargement de la veille Instagram...</p>
            </div>
          ) : filteredTrends.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <Eye size={36} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 font-medium mb-1">Aucun trend disponible</p>
              <p className="text-gray-600 text-sm mb-5">
                {category
                  ? `Aucun trend en catégorie "${category}" — essayez une autre.`
                  : 'Cliquez sur "Générer" pour lancer la veille Instagram.'}
              </p>
              <button
                onClick={handleRun}
                disabled={generating}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                {generating ? 'Génération...' : `Générer ${RUN_UNITS} trends`}
              </button>
            </div>
          ) : (
            <>
              {/* Veille quotidienne */}
              {dailyTrends.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp size={15} className="text-yellow-400" />
                      Veille du jour
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 rounded-full">Auto</span>
                    <span className="text-xs text-gray-600">{dailyTrends.length} trends</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {dailyTrends.map(trend => (
                      <TrendCard
                        key={trend.id}
                        {...trend}
                        isTopTrend
                        onFeedback={handleFeedback}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Générations supplémentaires */}
              {extraTrends.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Zap size={15} className="text-purple-400" />
                      Générations manuelles
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 text-purple-400 rounded-full">RUN</span>
                    <span className="text-xs text-gray-600">{extraTrends.length} trends</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {extraTrends.map(trend => (
                      <TrendCard
                        key={trend.id}
                        {...trend}
                        isTopTrend={false}
                        onFeedback={handleFeedback}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {showOveruse && (
      <OveruseModal
        feature="trend_run"
        onClose={() => setShowOveruse(false)}
        onSuccess={() => { setShowOveruse(false); handleRun() }}
      />
    )}
    </>
  )
}
