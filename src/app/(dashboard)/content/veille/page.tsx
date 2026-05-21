'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { TrendCard } from '@/components/dashboard/trends/TrendCard'
import { TrendFilters } from '@/components/dashboard/trends/TrendFilters'
import { cn } from '@/lib/utils/cn'

interface Trend {
  id: string
  platform: 'tiktok' | 'instagram' | 'twitter' | 'reddit'
  title: string
  url: string
  thumbnailUrl?: string
  engagement: number
  category: string
  tags: string[]
  capturedAt: Date
}

const PLATFORMS: Array<'all' | 'tiktok' | 'instagram' | 'twitter' | 'reddit'> = ['all', 'tiktok', 'instagram', 'twitter', 'reddit']
const CATEGORIES = [
  'lifestyle',
  'fitness',
  'glamour',
  'fashion',
  'beauty',
  'wellness',
  'motivation',
  'travel',
  'music',
  'dance',
]

export default function VeillePage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'tiktok' | 'instagram' | 'twitter' | 'reddit' | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Charger les trends sauvegardés
  const loadTrends = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL('/api/trends', window.location.origin)
      if (selectedPlatform !== 'all') {
        url.searchParams.set('platform', selectedPlatform)
      }
      if (selectedCategory) {
        url.searchParams.set('category', selectedCategory)
      }

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to load trends')

      const data = await response.json()
      if (data.success) {
        setTrends(data.trends.map((t: any) => ({
          ...t,
          capturedAt: new Date(t.capturedAt),
        })))
      } else {
        toast.error('Erreur lors du chargement des trends')
      }
    } catch (error) {
      console.error('Load trends error:', error)
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [selectedPlatform, selectedCategory])

  // Charger les trends au montage
  useEffect(() => {
    loadTrends()
  }, [])

  // Recharger quand les filtres changent
  useEffect(() => {
    loadTrends()
  }, [selectedPlatform, selectedCategory, loadTrends])

  // Rafraîchir les trends depuis les sources
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/trends/fetch', {
        method: 'POST',
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`${data.trendsCount} trends récupérés ! 🎯`)
        setLastRefresh(new Date())
        // Recharger les trends
        await loadTrends()
      } else {
        toast.error(`Erreur: ${data.error}`)
      }
    } catch (error) {
      console.error('Refresh error:', error)
      toast.error('Erreur lors du rafraîchissement')
    } finally {
      setRefreshing(false)
    }
  }

  // Filtrer les top trends (top 5 par engagement)
  const topTrends = trends.slice(0, 5)
  const otherTrends = trends.slice(5)

  return (
    <div className="p-8 space-y-8" data-tutorial="trends-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp size={32} className="text-cyan-400" />
            Veille Contenu
          </h1>
          <p className="text-gray-400 mt-2">
            Découvre les tendances des réseaux sociaux et crée du contenu inspiré par les trends
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 text-right">
          <div className="text-2xl font-bold text-purple-400">{trends.length} trends</div>
          {lastRefresh && (
            <div className="text-xs text-gray-500">
              Actualisé: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className={cn(
          'px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200',
          refreshing
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90'
        )}
        data-tutorial="trends-refresh"
      >
        {refreshing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Rafraîchissement...
          </>
        ) : (
          <>
            <RefreshCw size={18} />
            Actualiser maintenant
          </>
        )}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Filtres */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-8" data-tutorial="trends-filters">
            <h2 className="font-semibold text-white mb-6">Filtres</h2>
            <TrendFilters
              platforms={PLATFORMS}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>

        {/* Main content: Trends grid */}
        <div className="lg:col-span-3">
          {loading && !trends.length ? (
            <div className="glass rounded-2xl p-16 text-center">
              <Loader2 size={48} className="mx-auto mb-4 animate-spin text-purple-400" />
              <p className="text-gray-400">Chargement des trends...</p>
            </div>
          ) : trends.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 font-medium">Aucun trend trouvé</p>
              <p className="text-gray-600 text-sm mt-2">Clique sur "Actualiser maintenant" pour récupérer les trends</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section: Tendances du jour (Top 5) */}
              {topTrends.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    Tendances du jour
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topTrends.map(trend => (
                      <TrendCard
                        key={trend.id}
                        {...trend}
                        isTopTrend={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Autres tendances */}
              {otherTrends.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>📊</span>
                    Autres tendances
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherTrends.map(trend => (
                      <TrendCard
                        key={trend.id}
                        {...trend}
                        isTopTrend={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="glass rounded-2xl p-6 border border-cyan-500/20 bg-cyan-500/5">
        <h3 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
          💡 Comment utiliser ce module
        </h3>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Clique sur <strong>"Actualiser maintenant"</strong> pour scanner les derniers trends</li>
          <li>Utilise les filtres pour trouver des tendances pertinentes pour ton niche</li>
          <li>Clique sur <strong>"Générer"</strong> pour créer du contenu IA inspiré par le trend</li>
          <li>Le prompt sera pré-rempli avec le contexte du trend — personnalise-le si besoin</li>
        </ul>
      </div>
    </div>
  )
}
