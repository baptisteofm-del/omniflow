'use client'
import { useState, useEffect } from 'react'
import {
  Calendar, Plus, Clock, CheckCircle2, XCircle,
  Loader2, Smartphone, Send, Trash2, ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

interface Model {
  id: string
  name: string
  platform: string
  profiles?: Array<{
    id: string
    profile_id: string
    profile_name: string
    tool: string
    platform: string
  }>
}

interface ScheduledPost {
  id: string
  model_name: string
  platform: string
  caption: string
  scheduled_at: string
  status: 'pending' | 'posted' | 'failed'
  profile_id?: string
  tool?: 'adspower' | 'geelark'
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Smartphone size={14} />,
  tiktok: <Smartphone size={14} />,
  telegram: <Send size={14} />,
}

const platformColors: Record<string, string> = {
  instagram: 'text-pink-400 bg-pink-500/10',
  tiktok: 'text-white bg-white/10',
  telegram: 'text-blue-400 bg-blue-500/10',
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', label: 'En attente' },
  posted: { icon: CheckCircle2, color: 'text-green-400', label: 'Publié' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Échoué' },
}

export default function PostingPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({
    model_id: '',
    platform: 'instagram',
    caption: '',
    scheduled_at: '',
    profile_id: '',
    tool: 'adspower',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [postsRes, modelsRes] = await Promise.all([
        fetch('/api/posting/schedule'),
        fetch('/api/models'),
      ])

      if (postsRes.ok) {
        const data = await postsRes.json()
        setPosts(data.posts || [])
      }

      if (modelsRes.ok) {
        const data = await modelsRes.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModelChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId)
    if (model) {
      const platform = model.platform || 'instagram'
      const profile = model.profiles?.[0]
      setForm({
        ...form,
        model_id: modelId,
        platform,
        profile_id: profile?.profile_id || '',
        tool: profile?.tool || 'adspower',
      })
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.model_id) {
      toast.error('Sélectionnez un modèle')
      return
    }
    setFormLoading(true)
    try {
      const res = await fetch('/api/posting/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur scheduling')
      const data = await res.json()
      setPosts(prev => [data.post, ...prev])
      setShowForm(false)
      setForm({
        model_id: '',
        platform: 'instagram',
        caption: '',
        scheduled_at: '',
        profile_id: '',
        tool: 'adspower',
      })
      toast.success('Post schedulé ✅')
    } catch {
      toast.error('Erreur lors du scheduling')
    } finally {
      setFormLoading(false)
    }
  }

  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    posted: posts.filter(p => p.status === 'posted').length,
    failed: posts.filter(p => p.status === 'failed').length,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Posting automatique</h1>
          <p className="text-gray-400 mt-1">Schedulez vos posts sur AdsPower, GeeLark et Telegram</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          <Plus size={18} />
          Nouveau post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total schedulés', value: stats.total, color: 'text-purple-400' },
          { label: 'En attente', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Publiés', value: stats.posted, color: 'text-green-400' },
          { label: 'Échoués', value: stats.failed, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">Scheduler un post</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              {/* Sélectionnez un modèle */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Modèle</label>
                <select
                  required
                  value={form.model_id}
                  onChange={e => handleModelChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="">-- Sélectionnez un modèle --</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.platform})
                    </option>
                  ))}
                </select>
              </div>

              {/* Profil auto-détecté */}
              {form.model_id && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Profil & Outil</label>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-sm font-medium">
                      {form.profile_id ? `Profil: ${form.profile_id}` : 'Pas de profil assigné'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Outil: {form.tool.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* Plateforme */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Plateforme</label>
                <select
                  value={form.platform}
                  onChange={e => setForm({...form, platform: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="telegram">Telegram</option>
                  <option value="onlyfans">OnlyFans</option>
                </select>
              </div>

              {/* Date & heure */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Date & heure</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduled_at}
                  onChange={e => setForm({...form, scheduled_at: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/60"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Caption</label>
                <textarea
                  rows={3}
                  value={form.caption}
                  onChange={e => setForm({...form, caption: e.target.value})}
                  placeholder="Texte du post..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 glass rounded-xl text-gray-400 hover:text-white transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={formLoading || !form.model_id}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {formLoading && <Loader2 size={16} className="animate-spin" />}
                  Scheduler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des posts */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            <h2 className="font-semibold">Posts schedulés</h2>
          </div>
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aucun post schedulé</p>
              <p className="text-sm mt-1">Clique sur "Nouveau post" pour commencer</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {posts.map(post => {
                const status = statusConfig[post.status]
                return (
                  <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                    <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', platformColors[post.platform] || 'text-gray-400 bg-white/10')}>
                      {platformIcons[post.platform]}
                      {post.platform}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.model_name}</p>
                      <p className="text-xs text-gray-500 truncate">{post.caption || 'Pas de caption'}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(post.scheduled_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={cn('flex items-center gap-1.5 text-xs font-medium', status.color)}>
                      <status.icon size={14} />
                      {status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
