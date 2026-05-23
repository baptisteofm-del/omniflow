'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Trash2, Settings, Users, Upload, X, Link as LinkIcon, Edit2, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Model {
  id: string
  name: string
  avatar_url?: string
  bio?: string
  status: string
  revenue_month?: number
  posts_count?: number
}

const TOOLS = [
  {
    id: 'onlyfans',
    label: 'OnlyFans',
    bg: 'bg-[#00aff0]',
    logo: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
        <path d="M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173 0 0-2.399.585-4.43 0 4.018-.777 6.333-3.037 7.005-5.995zM5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996 7.996 7.996 0 0 0-7.996-7.996Zm0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z"/>
      </svg>
    ),
    href: (modelId: string) => `/settings/integrations?model=${modelId}&tool=onlyfans`,
  },
  {
    id: 'mym',
    label: 'MYM',
    bg: 'bg-[#1a1a1a]',
    logo: (
      <svg viewBox="0 0 40 20" className="w-7 h-4" fill="white">
        <text x="0" y="15" fontSize="14" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="-0.5">MYM</text>
      </svg>
    ),
    href: (modelId: string) => `/settings/integrations?model=${modelId}&tool=mym`,
  },
  {
    id: 'adspower',
    label: 'AdsPower',
    bg: 'bg-[#2563eb]',
    logo: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    href: (modelId: string) => `/settings/integrations?model=${modelId}&tool=adspower`,
  },
  {
    id: 'geelark',
    label: 'GeeLark',
    bg: 'bg-[#059669]',
    logo: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-3a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      </svg>
    ),
    href: (modelId: string) => `/settings/integrations?model=${modelId}&tool=geelark`,
  },
]

export default function AccountsPage() {
  const router = useRouter()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState<Record<string, boolean>>({})
  const [modelStats, setModelStats] = useState<Record<string, { revenue_month: number; posts_count: number }>>({})
  const [form, setForm] = useState({ name: '', bio: '' })

  useEffect(() => { loadModels() }, [])

  const loadModels = async () => {
    try {
      const res = await fetch('/api/models')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setModels(data.models || [])
      const statsRes = await fetch('/api/models/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setModelStats(statsData.stats || {})
      }
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, modelId: string) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setUploadingAvatar(p => ({ ...p, [modelId]: true }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('modelId', modelId)
      const res = await fetch('/api/models/avatar', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setModels(m => m.map(x => x.id === modelId ? { ...x, avatar_url: data.avatar_url } : x))
      toast.success('Photo mise à jour ✅')
    } catch { toast.error('Erreur upload') }
    finally { setUploadingAvatar(p => ({ ...p, [modelId]: false })) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nom requis'); return }
    try {
      const url = editingModel ? `/api/models/${editingModel.id}` : '/api/models'
      const res = await fetch(url, {
        method: editingModel ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, bio: form.bio, chatting_platforms: [], social_networks: [] }),
      })
      if (!res.ok) throw new Error('Failed')
      await loadModels()
      setShowForm(false)
      setEditingModel(null)
      setForm({ name: '', bio: '' })
      toast.success(editingModel ? 'Modèle mis à jour ✅' : 'Modèle créé ✅')
    } catch { toast.error('Erreur lors de la sauvegarde') }
  }

  const handleDelete = async (modelId: string) => {
    if (!confirm('Supprimer ce modèle ?')) return
    try {
      await fetch(`/api/models/${modelId}`, { method: 'DELETE' })
      await loadModels()
      toast.success('Modèle supprimé')
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 mb-1">
            <Users size={22} className="text-purple-400" />
            Modèles
          </h1>
          <p className="text-gray-500 text-sm">Gérez vos profils et leurs connexions aux outils</p>
        </div>
        <button
          onClick={() => { setEditingModel(null); setForm({ name: '', bio: '' }); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} /> Ajouter un modèle
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : models.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">Aucun modèle — commencez par en créer un</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium">
            <Plus size={16} /> Créer le premier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map(model => (
            <div key={model.id} className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all group">

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                      {model.avatar_url
                        ? <img src={model.avatar_url} alt={model.name} className="w-full h-full object-cover" />
                        : model.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <label className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700 transition-all opacity-0 group-hover:opacity-100">
                      {uploadingAvatar[model.id]
                        ? <Loader2 size={12} className="text-white animate-spin" />
                        : <Upload size={12} className="text-white" />
                      }
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e, model.id)} />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{model.name}</h3>
                    {model.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{model.bio}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setEditingModel(model); setForm({ name: model.name, bio: model.bio || '' }); setShowForm(true) }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all">
                    <Settings size={15} />
                  </button>
                  <button onClick={() => handleDelete(model.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <Link href="/finance" className="p-3 bg-white/3 rounded-xl border border-white/5 hover:border-green-500/25 transition-all group/stat">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={11} className="text-green-400" />
                    <p className="text-xs text-gray-600">Revenus</p>
                  </div>
                  <p className="text-lg font-bold text-green-400 tabular-nums">{modelStats[model.id]?.revenue_month ?? 0}€</p>
                </Link>
                <Link href="/posting" className="p-3 bg-white/3 rounded-xl border border-white/5 hover:border-cyan-500/25 transition-all group/stat">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={11} className="text-cyan-400" />
                    <p className="text-xs text-gray-600">Posts</p>
                  </div>
                  <p className="text-lg font-bold text-cyan-400 tabular-nums">{modelStats[model.id]?.posts_count ?? 0}</p>
                </Link>
              </div>

              {/* 4 boutons de connexion */}
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest font-medium mb-2.5">Connexions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {TOOLS.map(tool => (
                    <Link
                      key={tool.id}
                      href={tool.href(model.id)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-white/8 hover:border-purple-500/30 bg-white/3 hover:bg-white/8 transition-all group/btn"
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${tool.bg}`}>
                        {tool.logo}
                      </div>
                      <span className="text-xs font-medium text-gray-400 group-hover/btn:text-white transition-colors truncate">{tool.label}</span>
                      <LinkIcon size={10} className="ml-auto text-gray-700 group-hover/btn:text-purple-400 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingModel ? 'Modifier' : 'Nouveau modèle'}</h2>
              <button onClick={() => { setShowForm(false); setEditingModel(null) }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Nom du modèle *</label>
                <input
                  required autoFocus
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Victoria, Leelou, Sofia..."
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notes internes <span className="text-gray-600">(optionnel)</span></label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="Infos utiles sur ce profil..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>
              <p className="text-xs text-gray-600 bg-white/5 rounded-xl px-4 py-3 border border-white/5 leading-relaxed">
                Après la création, connectez les outils (OnlyFans, MYM, AdsPower, GeeLark) depuis la carte du modèle.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingModel(null) }}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-400 border border-white/10 hover:bg-white/5 transition-all">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
                  {editingModel ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
