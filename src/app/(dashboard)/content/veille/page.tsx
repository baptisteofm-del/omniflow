'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, Loader2, AlertCircle, Filter, Zap, BarChart3, Eye } from 'lucide-react'
import { OveruseModal } from '@/components/ui/OveruseModal'
import toast from 'react-hot-toast'
import { TrendCard } from '@/components/dashboard/trends/TrendCard'
import { cn } from '@/lib/utils/cn'

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
  source?: 'daily' | 'manual'
}

const PLATFORMS = ['all', 'tiktok', 'instagram', 'reddit'] as const
const PLATFORM_LABELS: Record<string, string> = { all: 'Toutes', tiktok: 'TikTok', instagram: 'Instagram', reddit: 'Reddit' }
const PLATFORM_COLORS: Record<string, string> = {
  all: 'border-white/20 hover:border-white/40',
  tiktok: 'border-white/20 hover:border-white/40',
  instagram: 'border-pink-500/30 hover:border-pink-500/60',
  reddit: 'border-orange-500/30 hover:border-orange-500/60',
}
const GEN_AMOUNTS = [1, 5, 10]

const CATEGORIES = ['lifestyle', 'fitness', 'glamour', 'fashion', 'beauty', 'wellness', 'motivation', 'travel', 'music', 'dance']

export default function VeillePage() {
  const [trends, setTrends]             = useState<Trend[]>([])
  const [loading, setLoading]           = useState(false)
  const [refreshing, setRefreshing]     = useState(false)
  const [platform, setPlatform]         = useState<string>('all')
  const [category, setCategory]         = useState<string | null>(null)
  const [lastRefresh, setLastRefresh]   = useState<Date | null>(null)
  const [isDemo, setIsDemo]             = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [genAmount, setGenAmount]       = useState(5)
  const [genPlatform, setGenPlatform]   = useState<string>('tiktok')
  const [manualTrends, setManualTrends] = useState<string[]>([]) // IDs des trends générés manuellement
  const [quota, setQuota]               = useState<{ remaining: number; dailyLimit: number; canGenerate: boolean } | null>(null)
  const [showOveruse, setShowOveruse]   = useState(false)

  const loadTrends = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (platform !== 'all') params.set('platform', platform)
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
      } else {
        throw new Error(data.error || 'Erreur API')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
      console.error('Load trends error:', err)
    } finally {
      setLoading(false)
    }
  }, [platform, category])

  useEffect(() => { loadTrends() }, [loadTrends])

  // Charge le quota
  useEffect(() => {
    fetch('/api/usage/trends')
      .then(r => r.json())
      .then(d => setQuota(d))
      .catch(() => {})
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/trends/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: genPlatform, limit: genAmount }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        const count = data.trendsCount || 0
        toast.success(data.warning ? `${count} trend${count > 1 ? 's' : ''} chargé${count > 1 ? 's' : ''} (mode démo)` : `${count} trend${count > 1 ? 's' : ''} récupéré${count > 1 ? 's' : ''}`)
        setLastRefresh(new Date())
        // Marquer les nouveaux trends comme manuels
        const prevIds = new Set(trends.map(t => t.id))
        await loadTrends(true)
        setManualTrends(prev => [...prev, `manual-${Date.now()}`]) // trigger re-mark
      } else {
        throw new Error(data.error || 'Erreur de génération')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setRefreshing(false)
    }
  }

  // Séparer daily (chargés au montage) vs manual (générés après)
  // On considère les 6 premiers comme "Daily" (prise en charge auto)
  // les suivants ajoutés manuellement
  const topTrends      = trends.slice(0, 6)
  const manualTrendsList = trends.slice(6)

  const stats = [
    { label: 'Trends captés', value: trends.length,                                        color: 'text-purple-400' },
    { label: 'TikTok',         value: trends.filter(t => t.platform === 'tiktok').length,    color: 'text-white' },
    { label: 'Instagram',      value: trends.filter(t => t.platform === 'instagram').length, color: 'text-pink-400' },
    { label: 'Reddit',         value: trends.filter(t => t.platform === 'reddit').length,    color: 'text-orange-400' },
  ]

  return (
    <>
    <div className="p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp size={22} className="text-cyan-400" />
            Veille Trends
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Scraping & intelligence de tendances — TikTok, Instagram, Reddit
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDemo && (
            <span className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              Mode démo
            </span>
          )}
          {lastRefresh && (
            <span className="text-xs text-gray-600">
              {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          {/* Plateforme */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {(['tiktok', 'instagram', 'reddit'] as const).map(p => (
              <button key={p} onClick={() => setGenPlatform(p)}
                className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  genPlatform === p ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>

          {/* Volume */}
          <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            {GEN_AMOUNTS.map(n => (
              <button key={n} onClick={() => setGenAmount(n)}
                className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all tabular-nums',
                  genAmount === n ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
                {n}
              </button>
            ))}
          </div>

          {/* Quota indicator */}
          {quota && (
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border',
              quota.canGenerate ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-red-500/20 bg-red-500/5 text-red-400')}>
              {quota.canGenerate ? `${quota.remaining}/${quota.dailyLimit} restants` : 'Quota journalier atteint'}
            </div>
          )}

          <button
            onClick={() => quota?.canGenerate === false ? setShowOveruse(true) : handleRefresh()}
            disabled={refreshing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              refreshing
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : quota?.canGenerate === false
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90'
            )}
          >
            {refreshing
              ? <><Loader2 size={15} className="animate-spin" />Génération...</>
              : quota?.canGenerate === false
                ? <><Zap size={15} />Générer plus</>
                : <><RefreshCw size={15} />Générer ({genAmount})</>
            }
          </button>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={cn('text-lg font-bold tabular-nums', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => loadTrends()} className="ml-auto text-xs text-red-400 underline hover:no-underline">Réessayer</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── FILTRES ── */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5 border border-white/5 sticky top-6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              Filtres
            </h2>

            {/* Plateforme */}
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-2.5">Plateforme</p>
              <div className="flex flex-col gap-1.5">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => setPlatform(p)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-xs font-medium transition-all border text-left',
                      platform === p
                        ? 'bg-white/10 text-white border-purple-500/40'
                        : `text-gray-500 hover:text-gray-300 bg-transparent ${PLATFORM_COLORS[p]}`
                    )}>
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-2.5">Catégorie</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setCategory(null)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    category === null ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-white/5 hover:text-gray-300'
                  )}>
                  Tous
                </button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(category === c ? null : c)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border capitalize',
                      category === c ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-gray-500 border-white/5 hover:text-gray-300'
                    )}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-gray-600 leading-relaxed">
                Cliquez sur <strong className="text-gray-400">Générer</strong> pour lancer un scraping et récupérer de nouveaux trends.
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="lg:col-span-3 space-y-8">
          {loading && trends.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <Loader2 size={36} className="mx-auto mb-4 animate-spin text-purple-400" />
              <p className="text-gray-500 text-sm">Chargement des trends...</p>
            </div>
          ) : trends.length === 0 && !loading ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <Eye size={36} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 font-medium mb-1">Aucun trend disponible</p>
              <p className="text-gray-600 text-sm mb-5">Cliquez sur "Générer" pour lancer le scraping</p>
              <button onClick={handleRefresh} disabled={refreshing}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                Générer maintenant
              </button>
            </div>
          ) : (
            <>
              {/* Daily trends */}
              {topTrends.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUp size={15} className="text-yellow-400" />
                      Daily Trends
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 rounded-full">Auto</span>
                    <span className="text-xs text-gray-600 font-normal">{topTrends.length} trends</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {topTrends.map(trend => (
                      <TrendCard key={trend.id} {...trend} isTopTrend />
                    ))}
                  </div>
                </div>
              )}

              {/* Manual trends */}
              {manualTrendsList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Zap size={15} className="text-purple-400" />
                      Générations manuelles
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 text-purple-400 rounded-full">User</span>
                    <span className="text-xs text-gray-600 font-normal">{manualTrendsList.length} résultats</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {manualTrendsList.map(trend => (
                      <TrendCard key={trend.id} {...trend} isTopTrend={false} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-cyan-500/15 bg-cyan-500/3">
        <div className="flex items-start gap-3">
          <Zap size={15} className="text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs text-gray-500">
            <p><strong className="text-gray-300">Générer</strong> — scrape TikTok, Instagram, Reddit et YouTube en temps réel</p>
            <p><strong className="text-gray-300">Générer IA</strong> sur une carte — crée du contenu inspiré du trend dans la Génération IA</p>
            <p><strong className="text-gray-300">Voir le post</strong> — redirige vers la source originale</p>
          </div>
        </div>
      </div>

    </div>

    {showOveruse && (
      <OveruseModal feature="trend_run" onClose={() => setShowOveruse(false)} onSuccess={() => { setShowOveruse(false); handleRefresh() }} />
    )}
    </>
  )
}
