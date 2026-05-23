'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Send, Plus, Trash2, CheckCircle2, Loader2, Bot,
  Users, Clock, Zap, Image as ImageIcon, Film,
  ArrowUpRight, AlertTriangle, Sparkles, X, Check, RefreshCw, Edit2, Type
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const BOT_USERNAME = '@omniflowapp_bot'
const MAX_POSTS_PER_DAY = 10

const AI_STYLES = [
  { id: 'soft',            label: 'Doux & Engageant',     desc: 'Chaleureux, proche, intime' },
  { id: 'provocant',       label: 'Provocant & Mystérieux', desc: 'Accrocheur, suggestif, tease' },
  { id: 'direct',          label: 'Direct & Commercial',  desc: 'Orienté conversion, CTA clair' },
  { id: 'conversationnel', label: 'Naturel & Authentique', desc: 'Comme parler à un ami' },
]

const CONTENT_TYPES = [
  { id: 'text',       label: 'Texte',         short: 'T',   icon: Type },
  { id: 'text_image', label: 'Texte + Image', short: 'T+I', icon: ImageIcon },
  { id: 'text_video', label: 'Texte + Vidéo', short: 'T+V', icon: Film },
]

const AUTOMATION_LEVELS = [
  { id: 'manual', label: 'Manuel',      desc: 'Vous rédigez et envoyez chaque message' },
  { id: 'semi',   label: 'Semi-auto',   desc: "L'IA propose, vous validez avant envoi" },
  { id: 'auto',   label: 'Automatique', desc: 'Publication autonome 100% automatisée' },
]

interface PostSlot { time: string; content_type: string }

interface Channel {
  id: string
  channel_username: string
  channel_name: string
  model_id?: string
  posts_per_day: number
  post_schedule: PostSlot[]
  automation_level: string
  is_active: boolean
  total_posts: number
  last_post_at?: string
  ai_tone?: string
}

// ── Post Schedule Editor ──────────────────────────────────────
function PostScheduleEditor({
  schedule, onChange
}: {
  schedule: PostSlot[]
  onChange: (s: PostSlot[]) => void
}) {
  const addSlot = () => {
    if (schedule.length >= MAX_POSTS_PER_DAY) return
    const lastHour = schedule.length > 0
      ? parseInt(schedule[schedule.length - 1].time.split(':')[0]) + 3
      : 9
    const h = Math.min(lastHour, 23).toString().padStart(2, '0')
    onChange([...schedule, { time: `${h}:00`, content_type: 'text_image' }])
  }

  const removeSlot = (i: number) => onChange(schedule.filter((_, idx) => idx !== i))

  const updateSlot = (i: number, patch: Partial<PostSlot>) =>
    onChange(schedule.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500">Planning ({schedule.length}/{MAX_POSTS_PER_DAY} posts max)</label>
        <button onClick={addSlot} disabled={schedule.length >= MAX_POSTS_PER_DAY}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <Plus size={11} />Ajouter un post
        </button>
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-600 border border-dashed border-white/10 rounded-xl">
          Aucun post planifié — cliquez sur "Ajouter un post"
        </div>
      )}

      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {schedule.map((slot, i) => {
          const ct = CONTENT_TYPES.find(c => c.id === slot.content_type) || CONTENT_TYPES[1]
          return (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white/3 border border-white/8 rounded-xl group">
              <span className="text-xs text-gray-600 w-6 flex-shrink-0 tabular-nums">#{i + 1}</span>

              {/* Heure libre */}
              <input
                type="time"
                value={slot.time}
                onChange={e => updateSlot(i, { time: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-blue-500/40 focus:outline-none tabular-nums w-20 flex-shrink-0"
              />

              {/* Type de contenu pour CE post */}
              <div className="flex gap-1 flex-1">
                {CONTENT_TYPES.map(ct => {
                  const Icon = ct.icon
                  return (
                    <button key={ct.id} onClick={() => updateSlot(i, { content_type: ct.id })}
                      title={ct.label}
                      className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all flex-1 justify-center',
                        slot.content_type === ct.id
                          ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                          : 'border-white/8 text-gray-600 hover:border-white/15 hover:text-gray-400')}>
                      <Icon size={10} />
                      <span className="hidden sm:inline">{ct.short}</span>
                    </button>
                  )
                })}
              </div>

              <button onClick={() => removeSlot(i)}
                className="p-1 rounded text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <X size={11} />
              </button>
            </div>
          )
        })}
      </div>

      {schedule.length >= MAX_POSTS_PER_DAY && (
        <p className="text-xs text-amber-500">Maximum {MAX_POSTS_PER_DAY} posts par jour atteint</p>
      )}
    </div>
  )
}

// ── Channel Modal (Add & Edit) ────────────────────────────────
function ChannelModal({ models, media, channel, onClose, onSave }: {
  models: any[]; media: any[]
  channel?: Channel | null
  onClose: () => void
  onSave: (d: any) => Promise<void>
}) {
  const isEdit = !!channel
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  const defaultSchedule: PostSlot[] = [
    { time: '09:00', content_type: 'text_image' },
    { time: '15:00', content_type: 'text' },
    { time: '21:00', content_type: 'text_video' },
  ]

  const [form, setForm] = useState({
    channel_username: channel?.channel_username || '',
    channel_name:     channel?.channel_name || '',
    model_id:         channel?.model_id || '',
    posts_per_day:    channel?.posts_per_day || 3,
    post_schedule:    channel?.post_schedule?.length ? channel.post_schedule : defaultSchedule,
    automation_level: channel?.automation_level || 'semi',
    ai_tone:          (channel as any)?.ai_tone || '',
    ai_examples:      (channel as any)?.ai_examples || '',
    ai_style:         (channel as any)?.ai_style || 'soft',
    ai_auto:          (channel as any)?.ai_auto || false,
  })
  const [generatedPreviews, setGeneratedPreviews] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)

  const handlePreviewGenerate = async () => {
    const examples = form.ai_examples.split('\n').filter(e => e.trim())
    if (examples.length < 3 && !form.ai_auto) {
      toast.error('Ajoutez au moins 3 exemples pour prévisualiser')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/telegram/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples,
          style: form.ai_style,
          count: 3,
          channel_name: form.channel_name || form.channel_username,
        }),
      })
      const data = await res.json()
      if (data.posts) setGeneratedPreviews(data.posts)
      else toast.error(data.error || 'Erreur de génération')
    } catch { toast.error('Erreur réseau') }
    finally { setGenerating(false) }
  }

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.channel_username) { toast.error('Username du canal requis'); return }
    setSaving(true)
    await onSave({ ...form, id: channel?.id, posts_per_day: form.post_schedule.length })
    setSaving(false)
  }

  const steps = ['Canal', 'Planning', 'Textes IA']

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bot size={14} className="text-blue-400" />
            {isEdit ? `Modifier ${channel?.channel_name || channel?.channel_username}` : 'Connecter un canal'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={14} className="text-gray-400" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-5 py-2.5 border-b border-white/5 gap-2">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i + 1)}
              className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                step === i + 1 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : step > i + 1 ? 'text-green-400' : 'text-gray-600')}>
              {step > i + 1 && <Check size={9} />}{s}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">

          {/* Step 1 — Canal */}
          {step === 1 && (
            <div className="space-y-4">
              {!isEdit && (
                <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-300 font-semibold mb-1">Prérequis</p>
                  <ol className="text-xs text-gray-400 space-y-1 list-decimal ml-3">
                    <li>Ajoutez <strong className="text-white">{BOT_USERNAME}</strong> comme admin dans votre canal</li>
                    <li>Donnez-lui les droits de publication</li>
                    <li>Renseignez le @username ou l'ID ci-dessous</li>
                  </ol>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">@username du canal *</label>
                <input value={form.channel_username} onChange={e => set('channel_username', e.target.value)}
                  placeholder="@mon_canal_vip ou -100xxxxxxxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none" />
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

              <div>
                <label className="text-xs text-gray-500 block mb-2">Niveau d'automatisation</label>
                <div className="space-y-1.5">
                  {AUTOMATION_LEVELS.map(l => (
                    <button key={l.id} onClick={() => set('automation_level', l.id)}
                      className={cn('w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all',
                        form.automation_level === l.id ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/8 hover:border-white/15')}>
                      <div>
                        <p className="text-xs font-semibold text-white">{l.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{l.desc}</p>
                      </div>
                      {form.automation_level === l.id && <Check size={12} className="text-blue-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Planning individuel par post */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl text-xs text-gray-500 space-y-1">
                <p className="text-gray-300 font-medium">Planning individuel par post</p>
                <p>Configurez l'heure et le type de contenu pour <strong className="text-white">chaque post séparément</strong>. Maximum {MAX_POSTS_PER_DAY} posts par jour.</p>
              </div>

              <PostScheduleEditor
                schedule={form.post_schedule}
                onChange={s => set('post_schedule', s)}
              />

              {form.post_schedule.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                  <span>Résumé : {form.post_schedule.length} post{form.post_schedule.length > 1 ? 's' : ''}/jour</span>
                  <div className="flex gap-2">
                    {(['text', 'text_image', 'text_video'] as const).map(ct => {
                      const count = form.post_schedule.filter(s => s.content_type === ct).length
                      if (!count) return null
                      const ct_info = CONTENT_TYPES.find(c => c.id === ct)!
                      return <span key={ct}>{ct_info.short}: {count}</span>
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Textes IA */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Toggle IA Auto */}
              <div className="flex items-center justify-between p-3.5 bg-purple-500/8 border border-purple-500/20 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Génération automatique IA</p>
                  <p className="text-xs text-gray-500 mt-0.5">L'IA génère tous les posts sans texte supplémentaire</p>
                </div>
                <button onClick={() => set('ai_auto', !form.ai_auto)}
                  className="flex-shrink-0 transition-all">
                  {form.ai_auto
                    ? <ToggleRight size={28} className="text-purple-400" />
                    : <ToggleLeft size={28} className="text-gray-600" />
                  }
                </button>
              </div>

              {/* Style IA */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">Style de génération</label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_STYLES.map(s => (
                    <button key={s.id} onClick={() => set('ai_style', s.id)}
                      className={cn('p-2.5 rounded-xl border text-left transition-all',
                        form.ai_style === s.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/15')}>
                      <p className="text-xs font-semibold text-white">{s.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exemples */}
              {!form.ai_auto && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-500">
                      Exemples de posts
                      <span className="text-gray-700 ml-1">(1 ligne = 1 exemple, min. 20 recommandés)</span>
                    </label>
                    <span className="text-xs text-gray-600">
                      {form.ai_examples.split('\n').filter(e => e.trim()).length} exemples
                    </span>
                  </div>
                  <textarea
                    value={form.ai_examples}
                    onChange={e => set('ai_examples', e.target.value)}
                    rows={12}
                    placeholder={"Exemple 1 de post...\nExemple 2 de post...\nExemple 3 de post...\n\nAjoutez au moins 20 exemples pour de meilleurs résultats.\nChaque ligne = 1 exemple de post."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-gray-700 focus:border-purple-500/40 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                  <p className="text-xs text-gray-700 mt-1">
                    L'IA analyse le style, le ton et les patterns pour générer des variations uniques.
                  </p>
                </div>
              )}

              {/* Prévisualisation */}
              <div>
                <button onClick={handlePreviewGenerate} disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-xs text-purple-300 hover:bg-purple-500/10 transition-all disabled:opacity-50">
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  {generating ? 'Génération en cours...' : 'Prévisualiser 3 posts générés'}
                </button>

                {generatedPreviews.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Aperçu des posts générés :</p>
                    {generatedPreviews.map((p, i) => (
                      <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                        <p className="text-xs text-gray-300 leading-relaxed">{p}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Retour</button>}
          <button onClick={onClose} className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">Annuler</button>
          <button
            onClick={step < steps.length ? () => setStep(s => s + 1) : handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {step < steps.length ? 'Continuer' : isEdit ? 'Enregistrer les modifications' : 'Connecter le canal'}
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
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
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
        // Normalise post_schedule si absent (legacy data)
        const normalized = (d.channels || []).map((c: any) => ({
          ...c,
          post_schedule: c.post_schedule || (c.post_times || ['09:00', '15:00', '21:00']).map((t: string) => ({
            time: t, content_type: c.content_type || 'text_image'
          })),
        }))
        setChannels(normalized)
        setStats(d.stats || {})
      }
      if (modelsRes.ok) setModels((await modelsRes.json()).models || [])
      if (mediaRes.ok) { const d = await mediaRes.json(); setMedia(d.files || d.media || []) }
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const handleSave = async (data: any) => {
    const method = data.id ? 'PATCH' : 'POST'
    // Enforce max limit
    const schedule = (data.post_schedule || []).slice(0, MAX_POSTS_PER_DAY)
    const payload = {
      ...data,
      post_schedule: schedule,
      posts_per_day: schedule.length,
      post_times: schedule.map((s: PostSlot) => s.time),
    }
    const res = await fetch('/api/telegram/channels', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      toast.success(data.id ? 'Canal modifié' : `Canal ${data.channel_username} connecté`)
      setShowModal(false)
      setEditingChannel(null)
      await loadData()
    } else {
      toast.error('Erreur lors de la sauvegarde')
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
    toast[d.success ? 'success' : 'error'](d.demo ? 'Test simulé (pas de token)' : d.success ? 'Message test envoyé' : d.error || 'Erreur')
    setTestingId(null)
  }

  const handleToggle = async (ch: Channel) => {
    const res = await fetch('/api/telegram/channels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ch.id, is_active: !ch.is_active }),
    })
    if (res.ok) setChannels(prev => prev.map(c => c.id === ch.id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleDelete = async (ch: Channel) => {
    const res = await fetch(`/api/telegram/channels?id=${ch.id}`, { method: 'DELETE' })
    if (res.ok) { setChannels(prev => prev.filter(c => c.id !== ch.id)); toast.success('Canal supprimé') }
  }

  const kpis = [
    { label: 'Bot principal',    value: BOT_USERNAME,       color: 'text-blue-400',    sub: 'Connecté' },
    { label: 'Canaux actifs',    value: stats.activeCount,  color: 'text-green-400',   sub: `/${stats.channelCount} total` },
    { label: 'Posts/jour auto',  value: stats.postsPerDay,  color: 'text-purple-400',  sub: `max ${MAX_POSTS_PER_DAY}/canal` },
    { label: 'Posts envoyés',    value: stats.totalPosts,   color: 'text-cyan-400',    sub: 'total' },
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
          <button onClick={() => { setEditingChannel(null); setShowModal(true) }}
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
              <p className="text-gray-600 text-sm mb-5">Ajoutez {BOT_USERNAME} à votre canal puis connectez-le ici</p>
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                <Plus size={14} />Connecter un canal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map(ch => {
                const schedule = ch.post_schedule || []
                const autoLabel = AUTOMATION_LEVELS.find(a => a.id === ch.automation_level)?.label || '—'
                return (
                  <div key={ch.id} className={cn('glass rounded-2xl p-5 border transition-all',
                    ch.is_active ? 'border-blue-500/20 hover:border-blue-500/35' : 'border-white/5 opacity-60')}>

                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold">
                          {(ch.channel_name || ch.channel_username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{ch.channel_name || ch.channel_username}</span>
                            <span className="text-xs text-blue-400">{ch.channel_username}</span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                              ch.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-500')}>
                              {ch.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1"><Zap size={10} />{schedule.length}/{MAX_POSTS_PER_DAY} posts/jour</span>
                            <span className="flex items-center gap-1"><Sparkles size={10} />{autoLabel}</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={10} />{ch.total_posts || 0} envoyés</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleTest(ch)} disabled={testingId === ch.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition-all">
                          {testingId === ch.id ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                          Test
                        </button>
                        <button onClick={() => { setEditingChannel(ch); setShowModal(true) }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                          <Edit2 size={11} />Modifier
                        </button>
                        <button onClick={() => handleToggle(ch)}
                          className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                            ch.is_active ? 'bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25'
                            : 'bg-gray-500/15 border-gray-500/20 text-gray-400 hover:bg-gray-500/25')}>
                          {ch.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => handleDelete(ch)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Planning des posts */}
                    {schedule.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-white/5">
                        <Clock size={11} className="text-gray-600 flex-shrink-0" />
                        {schedule.map((slot, i) => {
                          const ct = CONTENT_TYPES.find(c => c.id === slot.content_type)
                          const Icon = ct?.icon || Send
                          return (
                            <div key={i} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/8 rounded-lg text-xs text-gray-400">
                              <span className="tabular-nums">{slot.time}</span>
                              <Icon size={9} className="text-gray-600" />
                              <span className="text-gray-600">{ct?.short || '?'}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
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
              <div className="text-center py-6"><p className="text-xs text-gray-600 mb-2">Aucun média disponible</p><Link href="/media" className="text-xs text-blue-400 hover:text-blue-300">Ajouter des médias →</Link></div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-14 gap-2">
                {media.slice(0, 28).map((m: any) => (
                  <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-white/5">
                    {m.type === 'image' ? <img src={m.public_url} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={12} className="text-gray-600" /></div>}
                  </div>
                ))}
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
                { step: '02', title: `Ajoutez ${BOT_USERNAME} comme admin`, desc: 'Paramètres → Administrateurs → Ajouter un admin → @omniflowapp_bot → Droits de publication.' },
                { step: '03', title: 'Récupérez le @username', desc: 'Le @username est visible dans Info du canal. Pour les canaux privés, utilisez @getidsbot pour obtenir l\'ID numérique.' },
                { step: '04', title: 'Configurez dans OmniFlow', desc: 'Connecter un canal → entrez le @username → configurez le planning individuel de chaque post.' },
                { step: '05', title: 'Testez la connexion', desc: 'Cliquez sur "Test" pour envoyer un message de vérification.' },
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
        </div>
      )}

      {(showModal || editingChannel) && (
        <ChannelModal
          models={models}
          media={media}
          channel={editingChannel}
          onClose={() => { setShowModal(false); setEditingChannel(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
