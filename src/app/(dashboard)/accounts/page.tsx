'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Loader2, Trash2, Settings, Users, MessageSquare, Share2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PlatformLogo } from '@/components/PlatformLogos'

interface ModelProfile {
  id: string
  profile_id: string
  profile_name: string
  platform: string
  tool: string
  category: 'chatting' | 'social'
}

interface Model {
  id: string
  name: string
  avatar_url?: string
  bio?: string
  chatting_platforms?: string[] // ['onlyfans', 'mym']
  social_networks?: string[] // ['instagram', 'tiktok', 'telegram', 'twitter']
  status: string
  profiles?: ModelProfile[]
  revenue_month?: number
  posts_count?: number
}

interface ImportedProfile {
  id: string
  name: string
}

export default function AccountsPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [importing, setImporting] = useState<Record<string, boolean>>({})
  const [showImportModal, setShowImportModal] = useState(false)
  const [importingTool, setImportingTool] = useState<'adspower' | 'geelark' | ''>('')
  const [importCategory, setImportCategory] = useState<'chatting' | 'social' | ''>('')
  const [importedProfiles, setImportedProfiles] = useState<ImportedProfile[]>([])
  const [uploadingAvatar, setUploadingAvatar] = useState<Record<string, boolean>>({})
  const [modelStats, setModelStats] = useState<Record<string, { revenue_month: number; posts_count: number }>({})

  const [form, setForm] = useState({
    name: '',
    bio: '',
    chatting_platforms: [] as string[],
    social_networks: [] as string[],
  })

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const res = await fetch('/api/models')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setModels(data.models || [])
      
      // Load stats for each model
      const statsRes = await fetch('/api/models/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setModelStats(statsData.stats || {})
      }
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Erreur lors du chargement des modèles')
    } finally {
      setLoading(false)
    }
  }

  const handleImportProfiles = async (tool: 'adspower' | 'geelark', category: 'chatting' | 'social') => {
    setImportingTool(tool)
    setImportCategory(category)
    setImporting({ ...importing, [tool]: true })
    try {
      const res = await fetch('/api/accounts/profiles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: form.name || 'temp',
          tool,
          category,
        }),
      })

      if (!res.ok) throw new Error('Import failed')
      const data = await res.json()
      setImportedProfiles(data.profiles || [])
      setShowImportModal(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setImporting({ ...importing, [tool]: false })
    }
  }

  const handleSelectProfile = (profile: ImportedProfile) => {
    setShowImportModal(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, modelId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    setUploadingAvatar({ ...uploadingAvatar, [modelId]: true })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('modelId', modelId)

      const res = await fetch('/api/models/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()

      // Update model in state
      setModels(
        models.map(m =>
          m.id === modelId
            ? { ...m, avatar_url: data.avatar_url }
            : m
        )
      )

      toast.success('Avatar mis à jour ✅')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
    } finally {
      setUploadingAvatar({ ...uploadingAvatar, [modelId]: false })
    }
  }

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Nom du modèle requis')
      return
    }

    if (form.chatting_platforms.length === 0 && form.social_networks.length === 0) {
      toast.error('Sélectionnez au moins une plateforme')
      return
    }

    try {
      const url = editingModel ? `/api/models/${editingModel.id}` : '/api/models'
      const method = editingModel ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          chatting_platforms: form.chatting_platforms,
          social_networks: form.social_networks,
        }),
      })

      if (!res.ok) throw new Error(editingModel ? 'Update failed' : 'Create failed')
      await loadModels()
      setShowForm(false)
      setEditingModel(null)
      setForm({
        name: '',
        bio: '',
        chatting_platforms: [],
        social_networks: [],
      })
      toast.success(editingModel ? 'Modèle mis à jour ✅' : 'Modèle créé ✅')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Êtes-vous sûr ?')) return

    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Delete failed')
      await loadModels()
      toast.success('Modèle supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openEditForm = (model: Model) => {
    setEditingModel(model)
    setForm({
      name: model.name,
      bio: model.bio || '',
      chatting_platforms: model.chatting_platforms || [],
      social_networks: model.social_networks || [],
    })
    setShowForm(true)
  }

  const chattingPlatforms = [
    { id: 'onlyfans', label: 'OnlyFans' },
    { id: 'mym', label: 'MYM' },
  ]

  const socialNetworks = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'twitter', label: 'Twitter/X' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users size={28} className="text-purple-400" />
            <h1 className="text-2xl font-bold">Comptes Modèles</h1>
          </div>
          <p className="text-gray-400">Gérez vos modèles et leurs plateformes (chatting IA + réseaux sociaux)</p>
        </div>
        <button
          onClick={() => {
            setEditingModel(null)
            setForm({
              name: '',
              bio: '',
              chatting_platforms: [],
              social_networks: [],
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Ajouter un modèle
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : models.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">Aucun modèle pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium"
          >
            <Plus size={16} />
            Créer le premier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map(model => (
            <div key={model.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group">
              {/* Header with avatar */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {model.avatar_url ? (
                        <img src={model.avatar_url} alt={model.name} className="w-full h-full object-cover" />
                      ) : (
                        model.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100">
                      <Upload size={12} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAvatarUpload(e, model.id)}
                        disabled={uploadingAvatar[model.id]}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-cyan-300 transition-colors">{model.name}</h3>
                    {model.bio && <p className="text-xs text-gray-500 mt-1">{model.bio}</p>}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openEditForm(model)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Quick stats - Clickable links */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <Link href="/finance" className="p-3 bg-white/5 rounded-lg border border-white/10 text-center hover:border-green-500/30 hover:bg-white/10 transition-all cursor-pointer block">
                  <p className="text-2xl font-bold text-green-400">
                    {modelStats[model.id]?.revenue_month || 0}€
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Revenus mois</p>
                </Link>
                <Link href="/posting" className="p-3 bg-white/5 rounded-lg border border-white/10 text-center hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer block">
                  <p className="text-2xl font-bold text-cyan-400">
                    {modelStats[model.id]?.posts_count || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Posts publiés</p>
                </Link>
              </div>

              {/* Chatting Platforms - Clickable */}
              {model.chatting_platforms && model.chatting_platforms.length > 0 && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1.5">
                    <MessageSquare size={14} /> CHATTING IA
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {model.chatting_platforms.map(platform => (
                      <Link key={platform} href="/chatting/ai" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-semibold hover:border-purple-400 hover:bg-purple-500/30 transition-all cursor-pointer">
                        <PlatformLogo platform={platform as any} size={16} />
                        {platform.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Networks - Clickable */}
              {model.social_networks && model.social_networks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold flex items-center gap-1.5">
                    <Share2 size={14} /> RÉSEAUX SOCIAUX
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {model.social_networks.map(network => (
                      <Link key={network} href="/posting" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-semibold hover:border-cyan-400 hover:bg-cyan-500/30 transition-all cursor-pointer">
                        <PlatformLogo platform={network as any} size={16} />
                        {network.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit button */}
              <button
                onClick={() => openEditForm(model)}
                className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-purple-600/40 to-cyan-600/40 hover:from-purple-600/60 hover:to-cyan-600/60 rounded-lg text-purple-300 transition-all font-medium"
              >
                <Settings size={14} />
                Configurer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                {editingModel ? 'Modifier le modèle' : 'Ajouter un modèle'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingModel(null)
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateModel} className="space-y-6">
              {/* Nom du modèle */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom du modèle</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Leelou, Sophie, etc."
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Bio / Description</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Courte description du modèle..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 h-20 resize-none"
                />
              </div>

              {/* SECTION 1 — Plateformes Chatting IA */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={18} className="text-purple-400" />
                  <label className="block text-sm font-semibold text-gray-300">Plateformes Chatting IA</label>
                </div>
                <p className="text-xs text-gray-500 mb-4">Sélectionnez où vos clients discuteront avec l'IA</p>
                <div className="flex flex-wrap gap-3">
                  {chattingPlatforms.map(p => {
                    const selected = form.chatting_platforms.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            chatting_platforms: selected
                              ? form.chatting_platforms.filter(x => x !== p.id)
                              : [...form.chatting_platforms, p.id],
                          })
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          selected
                            ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 2 — Réseaux Sociaux */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 size={18} className="text-cyan-400" />
                  <label className="block text-sm font-semibold text-gray-300">Réseaux sociaux (pour le posting)</label>
                </div>
                <p className="text-xs text-gray-500 mb-4">Sélectionnez où poster votre contenu via AdsPower/GeeLark</p>
                <div className="flex flex-wrap gap-3">
                  {socialNetworks.map(n => {
                    const selected = form.social_networks.includes(n.id)
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            social_networks: selected
                              ? form.social_networks.filter(x => x !== n.id)
                              : [...form.social_networks, n.id],
                          })
                        }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          selected
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-cyan-500/30'
                        }`}
                      >
                        {n.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingModel(null)
                  }}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
                >
                  ✓ {editingModel ? 'Mettre à jour' : 'Créer le modèle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
