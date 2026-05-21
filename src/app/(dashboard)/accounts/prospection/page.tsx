'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Bookmark, MessageSquare, Trash2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ProspectStatus = 'discovered' | 'contacted' | 'discussing' | 'signed'

interface Prospect {
  id: string
  username: string
  platform: 'Instagram' | 'TikTok' | 'Twitter'
  followers_estimate: number
  engagement_rate: number
  niche: string
  potential_score: number
  status: ProspectStatus
  notes: string
}

interface SearchParams {
  platforms: string[]
  niche: string
  accountSize: string
  location: string
}

const NICHE_OPTIONS = [
  'fitness',
  'lifestyle',
  'glamour',
  'beauty',
  'health',
  'gaming',
  'music',
  'fashion',
  'travel',
  'food',
]

const ACCOUNT_SIZES = [
  { id: 'micro', label: 'Micro (1K-10K)' },
  { id: 'mid', label: 'Mid (10K-100K)' },
  { id: 'macro', label: 'Macro (100K+)' },
]

export default function ProspectionPage() {
  const supabase = createClient()
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    platforms: ['Instagram'],
    niche: 'fitness',
    accountSize: 'mid',
    location: '',
  })

  // Load prospects on mount
  useEffect(() => {
    loadProspects()
  }, [])

  const loadProspects = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setProspects(data as Prospect[])
      }
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/prospection/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      })

      if (response.ok) {
        const { prospects: newProspects } = await response.json()
        setProspects((prev) => [...newProspects, ...prev])
        setShowSearchModal(false)
      }
    } catch (error) {
      console.error('Error searching prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProspectStatus = async (prospectId: string, newStatus: ProspectStatus) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ status: newStatus })
        .eq('id', prospectId)

      if (!error) {
        setProspects((prev) =>
          prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p))
        )
      }
    } catch (error) {
      console.error('Error updating prospect:', error)
    }
  }

  const deleteProspect = async (prospectId: string) => {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', prospectId)

      if (!error) {
        setProspects((prev) => prev.filter((p) => p.id !== prospectId))
      }
    } catch (error) {
      console.error('Error deleting prospect:', error)
    }
  }

  const statusLabels: Record<ProspectStatus, string> = {
    discovered: 'Découverts',
    contacted: 'Contactés',
    discussing: 'En discussion',
    signed: 'Signés',
  }

  const statusColors: Record<ProspectStatus, string> = {
    discovered: 'from-blue-500/30 to-cyan-500/30 border-blue-500/30',
    contacted: 'from-amber-500/30 to-orange-500/30 border-amber-500/30',
    discussing: 'from-violet-500/30 to-pink-500/30 border-violet-500/30',
    signed: 'from-green-500/30 to-emerald-500/30 border-green-500/30',
  }

  const kanbanColumns: ProspectStatus[] = ['discovered', 'contacted', 'discussing', 'signed']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1625] to-[#0a0a0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Prospection de modèles
          </h1>
          <p className="text-gray-400 mb-6">
            Notre agent IA scrape les réseaux et identifie des créatrices à fort potentiel
          </p>

          <button
            onClick={() => setShowSearchModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
          >
            🔍 Lancer une recherche
          </button>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1625] border border-violet-500/20 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Paramètres de recherche</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Plateformes cibles
                  </label>
                  <div className="space-y-2">
                    {['Instagram', 'TikTok', 'Twitter'].map((platform) => (
                      <label key={platform} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={searchParams.platforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSearchParams((prev) => ({
                                ...prev,
                                platforms: [...prev.platforms, platform],
                              }))
                            } else {
                              setSearchParams((prev) => ({
                                ...prev,
                                platforms: prev.platforms.filter((p) => p !== platform),
                              }))
                            }
                          }}
                          className="w-4 h-4 rounded accent-violet-500"
                        />
                        <span className="text-white">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Niche/catégorie
                  </label>
                  <select
                    value={searchParams.niche}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, niche: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-violet-500/20 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  >
                    {NICHE_OPTIONS.map((niche) => (
                      <option key={niche} value={niche}>
                        {niche.charAt(0).toUpperCase() + niche.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Taille de compte
                  </label>
                  <select
                    value={searchParams.accountSize}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, accountSize: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-violet-500/20 rounded-lg text-white focus:border-violet-500 focus:outline-none"
                  >
                    {ACCOUNT_SIZES.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Localisation (optionnelle)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: France, Suisse..."
                    value={searchParams.location}
                    onChange={(e) =>
                      setSearchParams((prev) => ({ ...prev, location: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-violet-500/20 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0a0a0f] border border-violet-500/20 text-white rounded-lg hover:border-violet-500/40 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanbanColumns.map((status) => (
            <div
              key={status}
              className={`rounded-xl p-6 backdrop-blur-xl border bg-gradient-to-br ${statusColors[status]} min-h-96`}
            >
              <h3 className="font-semibold text-white mb-4 flex items-center justify-between">
                {statusLabels[status]}
                <span className="text-sm bg-white/10 px-2 py-1 rounded">
                  {prospects.filter((p) => p.status === status).length}
                </span>
              </h3>

              <div className="space-y-3">
                {prospects
                  .filter((p) => p.status === status)
                  .map((prospect) => (
                    <ProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      onStatusChange={updateProspectStatus}
                      onDelete={deleteProspect}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {prospects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Aucun prospect pour l'instant</p>
            <p className="text-gray-500 text-sm">Lancez une recherche pour découvrir des créatrices potentielles</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProspectCardProps {
  prospect: Prospect
  onStatusChange: (prospectId: string, newStatus: ProspectStatus) => void
  onDelete: (prospectId: string) => void
}

function ProspectCard({ prospect, onStatusChange, onDelete }: ProspectCardProps) {
  const statuses: ProspectStatus[] = ['discovered', 'contacted', 'discussing', 'signed']
  const nextStatus = statuses[(statuses.indexOf(prospect.status) + 1) % statuses.length]

  const platformEmojis = {
    Instagram: '📷',
    TikTok: '🎵',
    Twitter: '𝕏',
  }

  // Generate color from username for avatar
  const getColorFromUsername = (username: string) => {
    const colors = ['bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-amber-500', 'bg-green-500']
    const hash = username.charCodeAt(0) % colors.length
    return colors[hash]
  }

  return (
    <div className="bg-[#0a0a0f]/50 rounded-lg p-4 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-full ${getColorFromUsername(prospect.username)} flex items-center justify-center font-bold text-white text-sm`}>
            {prospect.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{prospect.username}</p>
            <p className="text-xs text-gray-500">
              {platformEmojis[prospect.platform as keyof typeof platformEmojis]} {prospect.platform}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(prospect.id)}
          className="text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{prospect.followers_estimate.toLocaleString()} abonnés</span>
          <span className="text-cyan-400">{(prospect.engagement_rate * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">{prospect.niche}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < prospect.potential_score ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onStatusChange(prospect.id, nextStatus)}
          className="flex-1 px-3 py-2 bg-violet-500/20 text-violet-300 text-xs rounded hover:bg-violet-500/30 transition-colors"
        >
          Suivant
        </button>
        <button className="px-2 py-2 bg-white/5 text-gray-400 hover:text-white transition-colors" title="Sauvegarder">
          <Bookmark size={16} />
        </button>
        <button className="px-2 py-2 bg-white/5 text-gray-400 hover:text-white transition-colors" title="Contacter">
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  )
}
