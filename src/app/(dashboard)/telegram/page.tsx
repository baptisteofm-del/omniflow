'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Send, Plus, Trash2, CheckCircle2, Loader2, Bot,
  Users, Clock, Zap, Settings, Image as ImageIcon, Film,
  ChevronRight, ArrowUpRight, Play, Pause, AlertTriangle,
  BarChart3, Sparkles, X, Check, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const BOT_USERNAME = '@omniflowapp_bot'

const CONTENT_TYPES = [
  { id: 'text',       label: 'Texte seul',      icon: Send },
  { id: 'text_image', label: 'Texte + Image',   icon: ImageIcon },
  { id: 'text_video', label: 'Texte + Vidéo',   icon: Film },
]

const AUTOMATION_LEVELS = [
  { id: 'manual',  label: 'Manuel',      desc: 'Vous rédigez et envoyez chaque message' },
  { id: 'semi',    label: 'Semi-auto',   desc: 'L\'IA propose, vous validez avant envoi' },
  { id: 'auto',    label: 'Automatique', desc: 'Publication autonome 100% automatisée' },
]

const DEFAULT_TIMES = ['08:00', '12:00', '18:00', '21:00']

interface Channel {
  id: string
  channel_username: string
  channel_name: string
  model_id?: string
  posts_per_day: number
  content_type: string
  post_times?: string[]
  automation_level: string
  is_active: boolean
  total_posts: number
  last_post_at?: string
}

// ── Add Channel Modal ─────────────────────────────────────────
function AddChannelModal({ models, media, onClose, onSave }: {
  models: any[]; media: any[];
  onClose: () => void; onSave: (d: any) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    channel_username: '',
    channel_name: '',
    model_id: '',
    posts_per_day: 3,
    content_type: 'text_image',
    post_times: ['09:00', '15:00', '21:00'],
    automation_level: 'semi',
    ai_tone: '',
    ai_examples: '',
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.channel_username) { toast.error('Username du canal requis'); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const steps = ['Canal', 'Automatisation', 'Contenu IA']

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bot size={14} className="text-blue-400" />Connecter un canal
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={14} className="text-gray-400" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-5 py-2.5 border-b border-white/5 gap-2">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i + 1)}
              className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                step === i + 1 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : step > i + 1 ? 'text-green-400' : 'text-gray-600')}>
              {step > i + 1 && <Check size={9} />}{s}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">

          {/* Step 1 — Canal */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 font-semibold mb-1">Prérequis</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal ml-3">
                  <li>Ajoutez <strong className="text-white">{BOT_USERNAME}</strong> comme admin dans votre canal</li>
                  <li>Donnez-lui les droits de publication</li>
                  <li>Renseignez le @username du canal ci-dessous</li>
                </ol>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">@username du canal *</label>
                <input value={form.channel_username} onChange={e => set('channel_username', e.target.value)}
                  placeholder="@mon_canal_vip"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none" />
                <p className="text-xs text-gray-600 mt-1">Ou l'ID numérique du canal (-100xxxxxxxxx)</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Nom affiché</label>
                <input value={form.channel_name} onChange={e => set('channel_name', e.target.value)}
                  placeholder="Canal VIP Victoria"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none" />
              </div>

              {models.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Modèle associé (optionnel)</label>
                  <select value={form.model_id} onChange={e => set('model_id', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none">
                    <option value="">— Global agence —</option>
                    {models.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Automatisation */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Niveau d'automatisation</label>
                <div className="space-y-2">
                  {AUTOMATION_LEVELS.map(l => (
                    <button key={l.id} onClick={() => set('automation_level', l.id)}
                      className={cn('w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                        form.automation_level === l.id ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/8 hover:border-white/15')}>
                      <div>
                        <p className="text-xs font-semibold text-white">{l.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{l.desc}</p>
                      </div>
                      {form.automation_level === l.id && <Check size={13} className="text-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Publications par jour</label>
                  <span className="text-white font-bold tabular-nums">{form.posts_per_day}x</span>
                </div>
                <input type="range" min={1} max={20} value={form.posts_per_day}
                  onChange={e => set('posts_per_day', Number(e.target.value))}
                  className="w-full accent-blue-500" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Type de contenu</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.map(c => {
                    const Icon = c.icon
                    return (
                      <button key={c.id} onClick={() => set('content_type', c.id)}
                        className={cn('flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all',
                          form.content_type === c.id ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-white/8 text-gray-500 hover:border-white/15')}>
                        <Icon size={14} />
                        <span>{c.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Horaires de publication</label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_TIMES.map(t => (
                    <button key={t} onClick={() => {
                      const times = form.post_times.includes(t)
                        ? form.post_times.filter(x => x !== t)
                        : [...form.post_times, t].sort()
                      set('post_times', times)
                    }}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        form.post_times.includes(t) ? 'border-blue-500/40 bg-blue-500/15 text-blue-300' : 'border-white/10 text-gray-500 hover:border-white/20')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Contenu IA */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/8 border border-purple-500/20 rounded-xl">
                <p className="text-xs text-purple-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles size={11} />Génération IA de posts
                </p>
                <p className="text-xs text-gray-500">Fournissez des exemples pour que l'IA génère des variations automatiques adaptées à votre canal.</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Ton / Style (optionnel)</label>
                <input value={form.ai_tone} onChange={e => set('ai_tone', e.target.value)}
                  placeholder="ex: Mystérieux, coquin, exclusif, premium..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/40 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Exemples de posts (optionnel)</label>
                <textarea value={form.ai_examples} onChange={e => set('ai_examples', e.target.value)}
                  placeholder="Collez ici 2-3 exemples de vos meilleurs posts Telegram pour que l'IA s'en inspire..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none" />
              </div>

              {/* Résumé */}
              <div className="p-3.5 bg-white/3 border border-white/8 rounded-xl space-y-1.5">
                <p className="text-xs font-semibold text-gray-400 mb-2">Résumé</p>
                {[
                  { label: 'Canal', value: form.channel_username || '—' },
                  { label: 'Posts/jour', value: `${form.posts_per_day}x` },
                  { label: 'Automation', value: AUTOMATION_LEVELS.find(l => l.id === form.automation_level)?.label || '—' },
                  { label: 'Contenu', value: CONTENT_TYPES.find(c => c.id === form.content_type)?.label || '—' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{r.label}</span>
                    <span className="text-white font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Retour</button>}
          <button onClick={onClose} className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Annuler</button>
          <button onClick={step < 3 ? () => setStep(s => s + 1) : handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {step < 3 ? 'Continuer' : 'Connecter le canal'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function TelegramPage() {
  const [channels, setChannels]     = useState<Channel[]>([])
  const [models, setModels]         = useState<any[]>([])
  const [media, setMedia]           = useState<any[]>([])
  const [stats, setStats]           = useState({ activeCount: 0, totalPosts: 0, postsPerDay: 0, channelCount: 0 })
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [testingId, setTestingId]   = useState<string | null>(null)
  const [activeTab, setActiveTab]   = useState<'channels' | 'guide' | 'automation'>('channels')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [chRes, modelsRes, mediaRes] = await Promise.all([
        fetch('/api/telegram/channels'),
        fetch('/api/models'),
        fetch('/api/media'),
      ])
      if (chRes.ok) {
        const d = await chRes.json()
        setChannels(d.channels || [])
        setStats(d.stats || {})
      }
      if (modelsRes.ok) setModels((await modelsRes.json()).models || [])
      if (mediaRes.ok) { const d = await mediaRes.json(); setMedia(d.files || d.media || []) }
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const handleSave = async (data: any) => {
    const res = await fetch('/api/telegram/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const d = await res.json()
      if (d.warning) toast.success(`Canal ajouté (mode démo)`)
      else toast.success(`Canal ${data.channel_username} connecté`)
      setShowModal(false)
      await loadData()
    } else {
      toast.error('Erreur lors de la connexion')
    }
  }

  const handleTest = async (ch: Channel) => {
    setTestingId(ch.id)
    const res = await fetch('/api/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: ch.channel_username }),
    })
    const d = await res.json()
    if (d.success) {
      toast.success(d.demo ? 'Test simulé (pas de token configuré)' : 'Message test envoyé dans le canal')
    } else {
      toast.error(d.error || 'Erreur lors du test')
    }
    setTestingId(null)
  }

  const handleToggle = async (ch: Channel) => {
    const res = await fetch('/api/telegram/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ch.id, is_active: !ch.is_active }),
    })
    if (res.ok) {
      setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, is_active: !c.is_active } : c))
    }
  }

  const handleDelete = async (ch: Channel) => {
    const res = await fetch(`/api/telegram/channels?id=${ch.id}`, { method: 'DELETE' })
    if (res.ok) {
      setChannels(prev => prev.filter(c => c.id !== ch.id))
      toast.success('Canal supprimé')
    }
  }

  const kpis = [
    { label: 'Bot principal',   value: BOT_USERNAME,           color: 'text-blue-400',   sub: 'Connecté' },
    { label: 'Canaux actifs',   value: stats.activeCount,      color: 'text-green-400',  sub: `/${stats.channelCount} total` },
    { label: 'Posts/jour auto', value: stats.postsPerDay,      color: 'text-purple-400', sub: 'automatisés' },
    { label: 'Posts envoyés',   value: stats.totalPosts,       color: 'text-cyan-400',   sub: 'total' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Send size={20} className="text-blue-400" />
            Bot Telegram
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Automatisation multi-canaux · {BOT_USERNAME}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <RefreshCw size={14} className="text-gray-400" />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
            <Plus size={14} />Connecter un canal
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-20 glass rounded-2xl border border-white/5 animate-pulse" />) : (
          kpis.map(k => (
            <div key={k.label} className="glass rounded-2xl p-4 border border-white/5 hover:border-blue-500/20 transition-all">
              <div className={cn('text-lg font-bold mb-0.5 truncate', k.color)}>{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
              <div className="text-xs text-gray-700">{k.sub}</div>
            </div>
          ))
        )}
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'channels',   label: 'Canaux' },
          { id: 'automation', label: 'Automatisation' },
          { id: 'guide',      label: 'Guide' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ CANAUX ════════ */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          {loading ? <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
          : channels.length === 0 ? (
            <div className="glass rounded-2xl border border-white/5 p-14 text-center">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot size={24} className="text-blue-400" />
              </div>
              <p className="text-gray-300 font-medium mb-1">Aucun canal connecté</p>
              <p className="text-gray-600 text-sm mb-5">Ajoutez {BOT_USERNAME} à votre canal Telegram puis connectez-le ici</p>
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                <Plus size={14} />Connecter un canal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map(ch => {
                const ctLabel = CONTENT_TYPES.find(c => c.id === ch.content_type)?.label || 'Texte + Image'
                const autoLabel = AUTOMATION_LEVELS.find(a => a.id === ch.automation_level)?.label || 'Semi-auto'
                return (
                  <div key={ch.id} className={cn('glass rounded-2xl p-5 border transition-all',
                    ch.is_active ? 'border-blue-500/20 hover:border-blue-500/35' : 'border-white/5 opacity-60')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 text-lg font-bold">
                          {(ch.channel_name || ch.channel_username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">{ch.channel_name || ch.channel_username}</span>
                            <span className="text-xs text-blue-400">{ch.channel_username}</span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                              ch.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-500')}>
                              {ch.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1"><Zap size={10} />{ch.posts_per_day}x/jour</span>
                            <span className="flex items-center gap-1"><BarChart3 size={10} />{ctLabel}</span>
                            <span className="flex items-center gap-1"><Sparkles size={10} />{autoLabel}</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={10} />{ch.total_posts || 0} posts</span>
                            {ch.last_post_at && <span className="flex items-center gap-1"><Clock size={10} />Dernier : {ch.last_post_at}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleTest(ch)} disabled={testingId === ch.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition-all">
                          {testingId === ch.id ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                          Tester
                        </button>
                        <button onClick={() => handleToggle(ch)}
                          className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                            ch.is_active ? 'bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25' : 'bg-gray-500/15 border-gray-500/20 text-gray-400 hover:bg-gray-500/25')}>
                          {ch.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => handleDelete(ch)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════ AUTOMATISATION ════════ */}
      {activeTab === 'automation' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AUTOMATION_LEVELS.map(l => (
              <div key={l.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl"><Zap size={14} className="text-blue-400" /></div>
                  <span className="text-sm font-semibold text-white">{l.label}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>

          {/* Banque médias */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon size={14} className="text-gray-500" />Banque de médias disponible
              </h2>
              <Link href="/media" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                Gérer <ArrowUpRight size={10} />
              </Link>
            </div>
            {media.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-600 mb-2">Aucun média disponible</p>
                <Link href="/media" className="text-xs text-blue-400 hover:text-blue-300">Ajouter des médias →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
                {media.slice(0, 24).map((m: any) => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-white/5">
                    {m.type === 'image'
                      ? <img src={m.public_url} alt={m.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={12} className="text-gray-600" /></div>
                    }
                  </div>
                ))}
                {media.length > 24 && (
                  <div className="aspect-square rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-xs text-gray-600">
                    +{media.length - 24}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ GUIDE ════════ */}
      {activeTab === 'guide' && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass rounded-2xl p-5 border border-blue-500/20 bg-blue-500/3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Bot size={15} className="text-blue-400" />Connecter {BOT_USERNAME} à votre canal
            </h2>
            <ol className="space-y-4">
              {[
                { step: '01', title: 'Ouvrez votre canal Telegram', desc: 'Dans Telegram, allez dans votre canal et ouvrez les paramètres.' },
                { step: '02', title: `Ajoutez ${BOT_USERNAME} comme admin`, desc: 'Paramètres → Administrateurs → Ajouter un admin → Recherchez @omniflowapp_bot → Donnez-lui les droits de publication.' },
                { step: '03', title: 'Récupérez le @username du canal', desc: 'Le @username est visible dans Info du canal (ex: @moncanal_vip). Si votre canal est privé, utilisez @getidsbot pour obtenir l\'ID numérique.' },
                { step: '04', title: 'Configurez dans OmniFlow', desc: 'Cliquez sur "Connecter un canal", entrez le @username ou l\'ID, choisissez vos paramètres d\'automatisation.' },
                { step: '05', title: 'Testez la connexion', desc: 'Cliquez sur "Tester" dans la carte du canal pour envoyer un message de test et vérifier que tout fonctionne.' },
              ].map(item => (
                <li key={item.step} className="flex gap-4">
                  <span className="text-2xl font-bold text-white/10 tabular-nums flex-shrink-0 leading-none w-8">{item.step}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="glass rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-300">Canaux privés :</strong> Pour les canaux privés sans @username, utilisez <strong className="text-white">@getidsbot</strong> — envoyez-lui un message depuis votre canal pour obtenir l'ID numérique (format : -100xxxxxxxxx).
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <AddChannelModal models={models} media={media} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  )
}
