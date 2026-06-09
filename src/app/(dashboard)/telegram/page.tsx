'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Send, Plus, Trash2, CheckCircle2, Loader2, Bot,
  Clock, Zap, Image as ImageIcon, Film, ArrowUpRight,
  Sparkles, X, Check, RefreshCw, Edit2, Type, ChevronDown,
  Search, AlertCircle, Users, Layers, Globe, Info
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

const BOT_USERNAME = '@omniflowapp_bot'
const MAX_POSTS_PER_DAY = 10

// ── Styles IA ──────────────────────────────────────────────
const AI_STYLES = [
  { id: 'soft',            label: 'Doux & Engageant',      desc: 'Chaleureux, proche, intime' },
  { id: 'provocant',       label: 'Provocant & Mystérieux', desc: 'Teasing, suggestif, suspense' },
  { id: 'conversationnel', label: 'Naturel & Authentique',  desc: 'Coulisses, spontané, vrai' },
  { id: 'direct',          label: 'Direct & Commercial',    desc: 'CTA clair, promo, conversion' },
]

// ── Types de contenu ───────────────────────────────────────
const CONTENT_TYPES = [
  { id: 'text',       label: 'Texte',         short: 'T',   icon: Type },
  { id: 'text_image', label: 'Texte + Image', short: 'T+I', icon: ImageIcon },
  { id: 'text_video', label: 'Texte + Vidéo', short: 'T+V', icon: Film },
]

// ── Niveaux d'automatisation ──────────────────────────────
const AUTOMATION_LEVELS = [
  { id: 'auto', label: 'Automatique', desc: 'Publication autonome, 100% automatisée', icon: '⚡' },
]

// ── Sources de médias ──────────────────────────────────────
const MEDIA_SOURCES = [
  {
    id: 'omniflow',
    label: 'Banque de médias OmniFlow',
    desc: 'Tous les médias disponibles dans votre banque OmniFlow',
    icon: '🗂️',
  },
]

// ── Catégories de médias ───────────────────────────────────
const MEDIA_CATEGORIES = [
  { id: 'all',       label: 'Toutes les catégories' },
  { id: 'sensual',   label: 'Photos sensuelles' },
  { id: 'videos',    label: 'Vidéos' },
  { id: 'stories',   label: 'Stories' },
  { id: 'exclusive', label: 'Exclusifs' },
]

// ── Types ──────────────────────────────────────────────────
interface PostSlot { time: string; content_type: string }
interface Channel {
  id: string
  channel_username: string
  channel_name: string
  channel_chat_id?: string
  model_id?: string
  posts_per_day: number
  post_schedule: PostSlot[]
  automation_level: string
  media_source?: string
  is_active: boolean
  total_posts: number
  last_post_at?: string
  ai_style?: string
  ai_auto?: boolean
}
interface DetectedChannel { id: string; username: string | null; name: string; member_count: number }

// ════════════════════════════════════════════════════════════
// Composant : Planning individuel des posts
// ════════════════════════════════════════════════════════════
function PostScheduleEditor({ schedule, onChange }: { schedule: PostSlot[]; onChange: (s: PostSlot[]) => void }) {
  const addSlot = () => {
    if (schedule.length >= MAX_POSTS_PER_DAY) return
    const lastHour = schedule.length > 0
      ? parseInt(schedule[schedule.length - 1].time.split(':')[0]) + 3
      : 9
    onChange([...schedule, { time: `${Math.min(lastHour, 23).toString().padStart(2, '0')}:00`, content_type: 'text_image' }])
  }
  const removeSlot = (i: number) => onChange(schedule.filter((_, idx) => idx !== i))
  const updateSlot = (i: number, patch: Partial<PostSlot>) =>
    onChange(schedule.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-500">Planning ({schedule.length}/{MAX_POSTS_PER_DAY} posts max)</label>
        <button onClick={addSlot} disabled={schedule.length >= MAX_POSTS_PER_DAY}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40 transition-colors">
          <Plus size={11} />Ajouter un post
        </button>
      </div>
      {schedule.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-600 border border-dashed border-white/10 rounded-xl">
          Aucun post planifié — cliquez sur "Ajouter un post"
        </div>
      )}
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {schedule.map((slot, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 bg-white/3 border border-white/8 rounded-xl group">
            <span className="text-xs text-gray-600 w-6 flex-shrink-0 tabular-nums">#{i + 1}</span>
            <input type="time" value={slot.time} onChange={e => updateSlot(i, { time: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-blue-500/40 focus:outline-none tabular-nums w-24 min-w-[90px] flex-shrink-0" />
            <div className="flex gap-1 flex-1">
              {CONTENT_TYPES.map(ct => {
                const Icon = ct.icon
                return (
                  <button key={ct.id} onClick={() => updateSlot(i, { content_type: ct.id })} title={ct.label}
                    className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all flex-1 justify-center',
                      slot.content_type === ct.id
                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                        : 'border-white/8 text-gray-600 hover:border-white/15 hover:text-gray-400')}>
                    <Icon size={10} /><span className="hidden sm:inline">{ct.short}</span>
                  </button>
                )
              })}
            </div>
            <button onClick={() => removeSlot(i)}
              className="p-1 rounded text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Composant : Dropdown custom (remplace <select> natif)
// ════════════════════════════════════════════════════════════
function ModelSelect({ models, value, onChange }: {
  models: any[]; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = models.find(m => m.id === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm transition-all hover:border-white/20 focus:outline-none focus:border-blue-500/40">
        <span className={selected ? 'text-white' : 'text-gray-500'}>
          {selected ? selected.name : '— Global agence —'}
        </span>
        <ChevronDown size={14} className={cn('text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#12111a] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className={cn('w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/8',
                !value ? 'text-white bg-white/5' : 'text-gray-400')}>
              — Global agence —
            </button>
            {models.map(m => (
              <button key={m.id} type="button" onClick={() => { onChange(m.id); setOpen(false) }}
                className={cn('w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/8',
                  value === m.id ? 'text-blue-300 bg-blue-500/10' : 'text-gray-300')}>
                <span className="font-medium">{m.name}</span>
                {m.platform && <span className="ml-2 text-xs text-gray-600 capitalize">{m.platform}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Composant : Modal ajout / modification de canal
// ════════════════════════════════════════════════════════════
function ChannelModal({ models, channel, onClose, onSave }: {
  models: any[]
  channel?: Channel | null
  onClose: () => void
  onSave: (d: any) => Promise<void>
}) {
  const isEdit = !!channel
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  // ── Détection automatique ──
  const [detecting, setDetecting]                 = useState(false)
  const [detectedChannels, setDetectedChannels]   = useState<DetectedChannel[]>([])
  const [detectError, setDetectError]             = useState<string | null>(null)
  const [verifying, setVerifying]                 = useState(false)
  const [verifyResult, setVerifyResult]           = useState<any>(null)

  const defaultSchedule: PostSlot[] = [
    { time: '09:00', content_type: 'text_image' },
    { time: '15:00', content_type: 'text' },
    { time: '21:00', content_type: 'text_video' },
  ]

  const [form, setForm] = useState({
    channel_identifier: channel?.channel_chat_id || channel?.channel_username || '',
    channel_name:       channel?.channel_name || '',
    channel_chat_id:    channel?.channel_chat_id || '',
    model_id:           channel?.model_id || '',
    post_schedule:      channel?.post_schedule?.length ? channel.post_schedule : defaultSchedule,
    automation_level:   'auto',
    media_source:       'omniflow',
    media_category:     (channel as any)?.media_category || 'all',
    ai_style:           channel?.ai_style || 'soft',
    ai_examples:        (channel as any)?.ai_examples || '',
    ai_auto:            (channel as any)?.ai_auto || false,
    toneDistribution:   (channel as any)?.toneDistribution || { hot: 0, moderate: 0, soft: 0 },
  })
  const [generatedPreviews, setGeneratedPreviews] = useState<string[]>([])
  const [generatedModelName, setGeneratedModelName] = useState<string>('')
  const [generating, setGenerating] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  // ── Détecter les canaux automatiquement ──
  const handleDetect = async () => {
    setDetecting(true)
    setDetectError(null)
    try {
      const res = await fetch('/api/telegram/detect-channels')
      const data = await res.json()
      if (data.demo) {
        setDetectError('Token bot non configuré — entrez le canal manuellement.')
        return
      }
      if (data.channels?.length > 0) {
        setDetectedChannels(data.channels)
      } else {
        setDetectError('Aucun canal détecté. Assurez-vous d\'avoir ajouté le bot comme admin récemment, puis réessayez.')
      }
    } catch { setDetectError('Erreur réseau') }
    finally { setDetecting(false) }
  }

  // ── Sélectionner un canal détecté ──
  const handleSelectDetected = (ch: DetectedChannel) => {
    set('channel_identifier', ch.username || ch.id)
    set('channel_name', ch.name)
    set('channel_chat_id', ch.id)
    setVerifyResult({ verified: true, name: ch.name, member_count: ch.member_count, username: ch.username, chat_id: ch.id })
    setDetectedChannels([])
  }

  // ── Vérifier un canal manuellement ──
  const handleVerify = async () => {
    const id = form.channel_identifier.trim()
    if (!id) { toast.error('Entrez un @username ou un ID numérique'); return }
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/telegram/verify-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_identifier: id }),
      })
      const data = await res.json()
      if (data.verified) {
        setVerifyResult(data)
        if (data.name && !form.channel_name) set('channel_name', data.name)
        if (data.chat_id) set('channel_chat_id', data.chat_id)
        if (data.demo) toast('Mode démo — vérification simulée', { icon: '⚠️' })
        else toast.success(`Canal vérifié : ${data.name}`)
      } else {
        setVerifyResult({ verified: false, error: data.error })
        toast.error(data.error || 'Impossible de vérifier ce canal')
      }
    } catch { toast.error('Erreur réseau') }
    finally { setVerifying(false) }
  }

  // ── Générer des aperçus ──
  const handlePreviewGenerate = async () => {
    setGenerating(true)
    try {
      const examples = form.ai_examples.split('\n').filter((e: string) => e.trim())
      const selectedModel = models.find(m => m.id === form.model_id)
      const res = await fetch('/api/telegram/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples,
          style: form.ai_style,
          count: 3,
          channel_name: form.channel_name || form.channel_identifier,
          model_id: form.model_id || null,
          model_name: selectedModel?.name || null,
        }),
      })
      const data = await res.json()
      if (data.posts) {
        setGeneratedPreviews(data.posts)
        setGeneratedModelName(data.model_name || '')
      } else toast.error(data.error || 'Erreur de génération')
    } catch { toast.error('Erreur réseau') }
    finally { setGenerating(false) }
  }

  // ── Sauvegarder ──
  const handleSave = async () => {
    if (!form.channel_identifier.trim()) { toast.error('Renseignez le canal'); return }
    setSaving(true)
    await onSave({
      ...form,
      id: channel?.id,
      channel_username: form.channel_identifier.startsWith('@')
        ? form.channel_identifier
        : form.channel_identifier.startsWith('-')
          ? form.channel_identifier
          : `@${form.channel_identifier}`,
      channel_name: form.channel_name || form.channel_identifier,
      posts_per_day: form.post_schedule.length,
      post_times: form.post_schedule.map((s: PostSlot) => s.time),
    })
    setSaving(false)
  }

  const steps = ['Canal', 'Planning', 'Textes IA']
  const selectedModel = models.find(m => m.id === form.model_id)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Bot size={14} className="text-blue-400" />
            {isEdit ? `Modifier ${channel?.channel_name || channel?.channel_username}` : 'Connecter un canal'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
            <X size={14} className="text-gray-400" />
          </button>
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

          {/* ═══════ STEP 1 — Canal ═══════ */}
          {step === 1 && (
            <div className="space-y-4">

              {/* Instructions */}
              {!isEdit && (
                <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-300 font-semibold mb-1.5">Prérequis</p>
                  <ol className="text-xs text-gray-400 space-y-1 list-decimal ml-3">
                    <li>Ajoutez <strong className="text-white">{BOT_USERNAME}</strong> comme <strong className="text-white">administrateur</strong> de votre canal Telegram</li>
                    <li>Donnez-lui les droits de <strong className="text-white">publication de messages</strong></li>
                    <li>Utilisez "Détecter" ou entrez l'identifiant du canal ci-dessous</li>
                  </ol>
                </div>
              )}

              {/* Bouton détection automatique */}
              {!isEdit && (
                <div className="space-y-2">
                  <button onClick={handleDetect} disabled={detecting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-sm text-blue-300 hover:bg-blue-500/15 transition-all disabled:opacity-50 font-medium">
                    {detecting
                      ? <><Loader2 size={14} className="animate-spin" />Détection en cours...</>
                      : <><Search size={14} />Détecter mes canaux automatiquement</>}
                  </button>

                  {detectError && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                      {detectError}
                    </div>
                  )}

                  {detectedChannels.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500">{detectedChannels.length} canal(ux) détecté(s) — sélectionnez :</p>
                      {detectedChannels.map(ch => (
                        <button key={ch.id} onClick={() => handleSelectDetected(ch)}
                          className="w-full flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                          <div className="text-left">
                            <p className="text-sm text-white font-medium">{ch.name}</p>
                            <p className="text-xs text-gray-600">{ch.username || ch.id}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {ch.member_count > 0 && <span className="flex items-center gap-1"><Users size={10} />{ch.member_count.toLocaleString('fr-FR')}</span>}
                            <Check size={12} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="flex-1 border-t border-white/8" />
                    <span>ou entrez manuellement</span>
                    <div className="flex-1 border-t border-white/8" />
                  </div>
                </div>
              )}

              {/* Identifiant canal */}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Chat ID numérique *</label>
                <div className="flex gap-2">
                  <input
                    value={form.channel_identifier}
                    onChange={e => { set('channel_identifier', e.target.value); setVerifyResult(null) }}
                    placeholder="-100xxxxxxxxx"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none placeholder-gray-600"
                  />
                  <button onClick={handleVerify} disabled={verifying || !form.channel_identifier.trim()}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-xs text-blue-300 hover:bg-blue-500/20 transition-all disabled:opacity-40 whitespace-nowrap font-medium">
                    {verifying ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Vérifier
                  </button>
                </div>
                <div className="flex items-start gap-1.5 mt-2 p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                  <Info size={11} className="mt-0.5 flex-shrink-0 text-blue-400" />
                  <p className="text-xs text-gray-400">
                    Trouvez votre Chat ID avec <strong className="text-white">@userinfobot</strong> sur Telegram. Envoyez <strong className="text-white">/start</strong> à ce bot pour obtenir votre ID.
                  </p>
                </div>
              </div>

              {/* Résultat de vérification */}
              {verifyResult && (
                <div className={cn('p-3 rounded-xl border text-xs', verifyResult.verified
                  ? 'bg-green-500/8 border-green-500/25 text-green-300'
                  : 'bg-red-500/8 border-red-500/20 text-red-300')}>
                  {verifyResult.verified ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 size={12} />
                        {verifyResult.demo ? 'Connexion simulée (démo)' : 'Canal vérifié avec succès'}
                      </div>
                      <p className="text-gray-400">
                        {verifyResult.name}
                        {verifyResult.username && verifyResult.username !== verifyResult.name && ` · ${verifyResult.username}`}
                        {verifyResult.member_count > 0 && ` · ${verifyResult.member_count.toLocaleString('fr-FR')} abonnés`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                      {verifyResult.error}
                    </div>
                  )}
                </div>
              )}

              {/* Nom d'affichage */}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Nom affiché dans OmniFlow</label>
                <input value={form.channel_name} onChange={e => set('channel_name', e.target.value)}
                  placeholder="Canal VIP Victoria"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500/40 focus:outline-none" />
              </div>

              {/* Modèle associé — custom dropdown */}
              {models.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Modèle associé</label>
                  <ModelSelect models={models} value={form.model_id} onChange={v => set('model_id', v)} />
                  <p className="text-xs text-gray-700 mt-1.5">
                    Le modèle associé détermine la personnalité de l'IA et la source des médias.
                  </p>
                </div>
              )}

              {/* Source des médias */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">
                  Source des médias publiés
                  <span className="ml-1.5 text-gray-700">(photos & vidéos)</span>
                </label>

                {/* Source fixe */}
                <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl mb-3">
                  <span className="text-lg flex-shrink-0">🗂️</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">Banque de médias OmniFlow</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tous les médias disponibles dans votre banque OmniFlow</p>
                  </div>
                  <Check size={13} className="text-blue-400 flex-shrink-0" />
                </div>

                {/* Catégorie */}
                <label className="text-xs text-gray-500 block mb-1.5">Catégorie</label>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIA_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => set('media_category', cat.id)}
                      className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                        (form as any).media_category === cat.id
                          ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                          : 'border-white/8 text-gray-500 hover:border-white/20 hover:text-gray-300')}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niveau d'automatisation — forcé à automatique */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">Niveau d'automatisation</label>
                <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                  <span className="text-base">⚡</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">Automatique</p>
                    <p className="text-xs text-gray-500 mt-0.5">Publication autonome, 100% automatisée</p>
                  </div>
                  <Check size={13} className="text-blue-400 flex-shrink-0" />
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2 — Planning ═══════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-white/3 border border-white/8 rounded-xl text-xs text-gray-500">
                <p className="text-gray-300 font-medium mb-1">Planning individuel</p>
                <p>Définissez l'heure et le type de contenu <strong className="text-white">pour chaque post séparément</strong>. Max {MAX_POSTS_PER_DAY} posts/jour.</p>
              </div>
              <PostScheduleEditor schedule={form.post_schedule} onChange={s => set('post_schedule', s)} />
              {form.post_schedule.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                  <span>{form.post_schedule.length} post{form.post_schedule.length > 1 ? 's' : ''}/jour</span>
                  <div className="flex gap-3">
                    {CONTENT_TYPES.map(ct => {
                      const count = form.post_schedule.filter(s => s.content_type === ct.id).length
                      return count ? <span key={ct.id}>{ct.short}: {count}</span> : null
                    })}
                  </div>
                </div>
              )}

              {/* Répartition du ton */}
              {form.post_schedule.length > 0 && (() => {
                const td = (form as any).toneDistribution as { hot: number; moderate: number; soft: number }
                const total = td.hot + td.moderate + td.soft
                const tones = [
                  { key: 'hot',      label: 'Très chaud' },
                  { key: 'moderate', label: 'Modéré' },
                  { key: 'soft',     label: 'Soft' },
                ]
                return (
                  <div className="p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400 font-medium">Répartition du ton</label>
                      <span className={cn('text-xs tabular-nums', total === form.post_schedule.length ? 'text-green-400' : 'text-amber-400')}>
                        {total}/{form.post_schedule.length} posts assignés
                      </span>
                    </div>
                    {tones.map(({ key, label }) => {
                      const val = td[key as keyof typeof td]
                      const canIncrease = total < form.post_schedule.length
                      return (
                        <div key={key} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                          <span className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => val > 0 && set('toneDistribution', { ...td, [key]: val - 1 })}
                              disabled={val === 0}
                              className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-sm font-bold">
                              −
                            </button>
                            <span className="text-sm text-white w-5 text-center tabular-nums font-medium">{val}</span>
                            <button
                              onClick={() => canIncrease && set('toneDistribution', { ...td, [key]: val + 1 })}
                              disabled={!canIncrease}
                              className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition-all flex items-center justify-center text-sm font-bold">
                              +
                            </button>
                          </div>
                          <span className="text-xs text-gray-600">post{val > 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          {/* ═══════ STEP 3 — Textes IA ═══════ */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Contexte modèle */}
              {selectedModel ? (
                <div className="flex items-center gap-3 p-3 bg-purple-500/8 border border-purple-500/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {selectedModel.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">L'IA écrira en tant que {selectedModel.name}</p>
                    <p className="text-xs text-gray-500">Les posts seront personnalisés pour ce modèle</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>Aucun modèle associé — l'IA utilisera un ton générique. Associez un modèle à l'étape 1 pour de meilleurs résultats.</span>
                </div>
              )}

              {/* Toggle génération automatique */}
              <div className="flex items-center justify-between p-3.5 bg-white/3 border border-white/8 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Génération 100% automatique</p>
                  <p className="text-xs text-gray-500 mt-0.5">L'IA génère tous les posts sans exemples</p>
                </div>
                <button onClick={() => set('ai_auto', !form.ai_auto)}
                  className={cn('flex-shrink-0 w-11 h-6 rounded-full border transition-all relative',
                    form.ai_auto ? 'bg-purple-500 border-purple-500' : 'bg-white/10 border-white/20')}>
                  <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow',
                    form.ai_auto ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </div>

              {/* Style IA */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">Style de génération</label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_STYLES.map(s => (
                    <button key={s.id} onClick={() => set('ai_style', s.id)}
                      className={cn('p-2.5 rounded-xl border text-left transition-all',
                        form.ai_style === s.id
                          ? 'border-purple-500/40 bg-purple-500/10'
                          : 'border-white/8 hover:border-white/15')}>
                      <p className="text-xs font-semibold text-white mb-1">{s.label}</p>
                      <p className="text-xs text-gray-600">{s.desc}</p>
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
                      <span className="text-gray-700 ml-1">(1 ligne = 1 exemple)</span>
                    </label>
                    <span className="text-xs text-gray-600">
                      {form.ai_examples.split('\n').filter((e: string) => e.trim()).length} exemples
                    </span>
                  </div>
                  <textarea
                    value={form.ai_examples}
                    onChange={e => set('ai_examples', e.target.value)}
                    rows={8}
                    placeholder={"Bonne nuit les loulous 🌙 Demain y'a du nouveau sur la page...\nJe viens de finir mon shooting, j'ai des photos dingues pour vous 😏\nVous êtes trop chou, merci pour vos messages ce soir ❤️\n\nChaque ligne = 1 exemple de post de la créatrice.\n20+ exemples = meilleurs résultats."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder-gray-700 focus:border-purple-500/40 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Prévisualisation */}
              <div>
                <button onClick={handlePreviewGenerate} disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 hover:bg-purple-500/15 transition-all disabled:opacity-50 font-medium">
                  {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {generating ? 'Génération en cours...' : 'Prévisualiser 3 posts générés'}
                </button>

                {generatedPreviews.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">Aperçu — posts générés</p>
                      {generatedModelName && <span className="text-xs text-purple-400">en tant que {generatedModelName}</span>}
                    </div>
                    {generatedPreviews.map((p, i) => (
                      <div key={i} className="p-3 bg-white/3 border border-white/8 rounded-xl">
                        <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{p}</p>
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
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">
              Retour
            </button>
          )}
          <button onClick={onClose}
            className="px-3.5 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">
            Annuler
          </button>
          <button
            onClick={step < steps.length ? () => setStep(s => s + 1) : handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {step < steps.length ? 'Continuer' : isEdit ? 'Enregistrer' : 'Connecter le canal'}
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
        const normalized = (d.channels || []).map((c: any) => ({
          ...c,
          automation_level: 'auto',
          post_schedule: c.post_schedule || (c.post_times || ['09:00', '15:00', '21:00']).map((t: string) => ({
            time: t, content_type: c.content_type || 'text_image',
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
    const schedule = (data.post_schedule || []).slice(0, MAX_POSTS_PER_DAY)
    const res = await fetch('/api/telegram/channels', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, post_schedule: schedule, posts_per_day: schedule.length }),
    })
    if (res.ok) {
      toast.success(data.id ? 'Canal modifié' : `Canal connecté`)
      setShowModal(false)
      setEditingChannel(null)
      await loadData()
    } else { toast.error('Erreur lors de la sauvegarde') }
  }

  const handleTest = async (ch: Channel) => {
    setTestingId(ch.id)
    const res = await fetch('/api/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: ch.channel_chat_id || ch.channel_username }),
    })
    const d = await res.json()
    toast[d.success ? 'success' : 'error'](d.demo ? 'Test simulé (mode démo)' : d.success ? 'Message test envoyé ✓' : d.error || 'Erreur')
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
    if (!confirm(`Supprimer le canal ${ch.channel_name || ch.channel_username} ?`)) return
    const res = await fetch(`/api/telegram/channels?id=${ch.id}`, { method: 'DELETE' })
    if (res.ok) { setChannels(prev => prev.filter(c => c.id !== ch.id)); toast.success('Canal supprimé') }
  }

  const kpis = [
    { label: 'Bot',           value: BOT_USERNAME,      color: 'text-blue-400',   sub: 'Connecté' },
    { label: 'Canaux actifs', value: stats.activeCount, color: 'text-green-400',  sub: `sur ${stats.channelCount}` },
    { label: 'Posts/jour',    value: stats.postsPerDay, color: 'text-purple-400', sub: 'automatisés' },
    { label: 'Total envoyés', value: stats.totalPosts,  color: 'text-cyan-400',   sub: 'tous canaux' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
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

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="h-20 glass rounded-2xl border border-white/5 animate-pulse" />)
          : kpis.map(k => (
              <div key={k.label} className="glass rounded-2xl p-4 border border-white/5 hover:border-blue-500/20 transition-all">
                <div className={cn('text-lg font-bold mb-0.5 truncate', k.color)}>{k.value}</div>
                <div className="text-xs text-gray-500">{k.label}</div>
                <div className="text-xs text-gray-700">{k.sub}</div>
              </div>
            ))
        }
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'channels',   label: 'Canaux' },
          { id: 'automation', label: 'Médias & Sources' },
          { id: 'guide',      label: 'Guide' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════ CANAUX ════ */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          {loading
            ? <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
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
                  const autoLevel = AUTOMATION_LEVELS.find(a => a.id === ch.automation_level)
                  const mediaSrc = MEDIA_SOURCES.find(s => s.id === ch.media_source)
                  const linkedModel = models.find(m => m.id === ch.model_id)
                  return (
                    <div key={ch.id}
                      className={cn('glass rounded-2xl p-5 border transition-all',
                        ch.is_active ? 'border-blue-500/20 hover:border-blue-500/35' : 'border-white/5 opacity-60')}>

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold text-sm">
                            {(ch.channel_name || ch.channel_username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm">{ch.channel_name || ch.channel_username}</span>
                              <span className="text-xs text-blue-400/80">{ch.channel_username}</span>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                                ch.is_active ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-500')}>
                                {ch.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1"><Zap size={10} />{schedule.length}/{MAX_POSTS_PER_DAY} posts/jour</span>
                              {autoLevel && <span className="flex items-center gap-1">{autoLevel.icon} {autoLevel.label}</span>}
                              {linkedModel && <span className="flex items-center gap-1">👤 {linkedModel.name}</span>}
                              {mediaSrc && <span className="flex items-center gap-1">{mediaSrc.icon} {mediaSrc.label}</span>}
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
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all">
                            <Edit2 size={11} />Modifier
                          </button>
                          <button onClick={() => handleToggle(ch)}
                            className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                              ch.is_active
                                ? 'bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25'
                                : 'bg-gray-500/15 border-gray-500/20 text-gray-400 hover:bg-gray-500/25')}>
                            {ch.is_active ? 'ON' : 'OFF'}
                          </button>
                          <button onClick={() => handleDelete(ch)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Planning */}
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
                                <span className="text-gray-600">{ct?.short}</span>
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

      {/* ════ MÉDIAS & SOURCES ════ */}
      {activeTab === 'automation' && (
        <div className="space-y-5">
          {/* Explications des sources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MEDIA_SOURCES.map(src => (
              <div key={src.id} className="glass rounded-2xl p-5 border border-white/5">
                <div className="text-2xl mb-3">{src.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{src.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{src.desc}</p>
              </div>
            ))}
          </div>

          {/* Aperçu banque de médias */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon size={14} className="text-gray-500" />
                Banque de médias disponible
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
              <>
                <p className="text-xs text-gray-600 mb-3">{media.length} fichier{media.length > 1 ? 's' : ''} dans votre banque</p>
                <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-14 gap-2">
                  {media.slice(0, 28).map((m: any) => (
                    <div key={m.id} className="aspect-square rounded-lg overflow-hidden border border-white/5">
                      {m.type === 'image'
                        ? <img src={m.public_url} alt={m.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={12} className="text-gray-600" /></div>}
                    </div>
                  ))}
                  {media.length > 28 && (
                    <div className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{media.length - 28}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modèles et leurs médias */}
          {models.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Users size={14} className="text-gray-500" />Médias par modèle
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {models.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{m.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{m.platform || 'onlyfans'}</p>
                    </div>
                    <Link href="/media" className="ml-auto text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">
                      Médias →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ GUIDE ════ */}
      {activeTab === 'guide' && (
        <div className="space-y-4 max-w-2xl">
          <div className="glass rounded-2xl p-5 border border-blue-500/20 bg-blue-500/3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Bot size={15} className="text-blue-400" />
              Connecter {BOT_USERNAME} à votre canal Telegram
            </h2>
            <ol className="space-y-4">
              {[
                {
                  step: '01',
                  title: 'Ouvrez votre canal Telegram',
                  desc: 'Dans Telegram, accédez à votre canal et ouvrez les paramètres (ℹ️ Info du canal).',
                },
                {
                  step: '02',
                  title: `Ajoutez ${BOT_USERNAME} comme administrateur`,
                  desc: `Administrateurs → Ajouter un admin → recherchez @omniflowapp_bot → accordez les droits "Publier des messages" et "Modifier les messages".`,
                },
                {
                  step: '03',
                  title: 'Identifiant du canal',
                  desc: 'Canal public : utilisez @votre_canal. Canal privé (sans username) : utilisez @getidsbot dans Telegram pour obtenir l\'ID numérique (-100xxxxxxxxx).',
                },
                {
                  step: '04',
                  title: 'Connexion dans OmniFlow',
                  desc: 'Cliquez "Connecter un canal" → entrez l\'identifiant → cliquez "Vérifier" pour confirmer l\'accès → configurez le planning.',
                },
                {
                  step: '05',
                  title: 'Test & activation',
                  desc: 'Cliquez "Test" sur votre canal pour envoyer un message de vérification. Activez le canal avec le bouton ON/OFF.',
                },
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

          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Globe size={14} className="text-gray-500" />
              Canaux privés vs publics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/3 rounded-xl border border-white/8">
                <p className="text-white font-semibold mb-1">Canal public</p>
                <p className="text-gray-500">Identifiant : <span className="text-blue-400 font-mono">@mon_canal_vip</span></p>
                <p className="text-gray-600 mt-1">Visible dans la recherche Telegram</p>
              </div>
              <div className="p-3 bg-white/3 rounded-xl border border-white/8">
                <p className="text-white font-semibold mb-1">Canal privé</p>
                <p className="text-gray-500">Identifiant : <span className="text-cyan-400 font-mono">-100xxxxxxxxx</span></p>
                <p className="text-gray-600 mt-1">Utilisez @getidsbot pour obtenir l'ID</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {(showModal || editingChannel) && (
        <ChannelModal
          models={models}
          channel={editingChannel}
          onClose={() => { setShowModal(false); setEditingChannel(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
