'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar, Plus, Clock, CheckCircle2, XCircle, Loader2,
  Zap, BarChart3, Image as ImageIcon, Film, Layers,
  Settings, ArrowUpRight, Play, Pause, Trash2, ChevronRight,
  RefreshCw, Users, Target, Sparkles, AlertTriangle, Check, X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────
interface ScheduledPost {
  id: string
  model_name: string
  platform: string
  caption: string
  scheduled_at: string
  status: 'pending' | 'posted' | 'failed'
  tool?: string
  media_url?: string
}

interface Model { id: string; name: string; platform?: string; profiles?: any[] }
interface MediaItem { id: string; name: string; public_url: string; type: string }
interface Integration { tool: string; is_active: boolean; name: string }

// ── Constants ─────────────────────────────────────────────────
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram',   color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30' },
  { id: 'tiktok',    label: 'TikTok',      color: 'text-white',      bg: 'bg-white/10',       border: 'border-white/20' },
  { id: 'twitter',   label: 'X / Twitter', color: 'text-gray-300',   bg: 'bg-gray-500/10',    border: 'border-gray-500/30' },
  { id: 'reddit',    label: 'Reddit',      color: 'text-orange-400', bg: 'bg-orange-500/10',  border: 'border-orange-500/30' },
]

const AUTOMATION_LEVELS = [
  { id: 'manual',    label: 'Manuel',             desc: 'Vous choisissez et planifiez chaque contenu manuellement.', icon: Settings },
  { id: 'semi',      label: 'Semi-automatique',   desc: 'Le système propose les meilleurs contenus, vous validez.', icon: Sparkles },
  { id: 'auto',      label: 'Automatique',        desc: 'Publication intelligente basée sur les performances. Zéro action manuelle.', icon: Zap },
]

const STATUS_CONFIG = {
  pending: { icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'En attente' },
  posted:  { icon: CheckCircle2,  color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Publié' },
  failed:  { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Échoué' },
}

// ── New Campaign Modal ────────────────────────────────────────
function CampaignModal({ models, media, integrations, onClose, onSave }: {
  models: Model[]; media: MediaItem[]; integrations: Integration[];
  onClose: () => void; onSave: (data: any) => Promise<void>
}) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    platform: 'instagram',
    model_ids: [] as string[],
    media_ids: [] as string[],
    caption: '',
    scheduled_at: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    frequency: 1,
    automation_level: 'manual',
    content_mode: 'sequential',
    tool: 'adspower',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const hasIntegration = integrations.some(i => (i.tool === 'adspower' || i.tool === 'geelark') && i.is_active)

  const handleSave = async () => {
    if (!form.name || !form.platform || form.model_ids.length === 0) {
      toast.error('Nom, plateforme et au moins un modèle requis')
      return
    }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const steps = ['Campagne', 'Modèles', 'Contenu', 'Horaire']

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Nouvelle campagne</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all"><X size={14} className="text-gray-400" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center px-6 py-3 border-b border-white/5 gap-2">
          {steps.map((s, i) => (
            <button key={s} onClick={() => setStep(i + 1)}
              className={cn('flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                step === i + 1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : step > i + 1 ? 'text-green-400' : 'text-gray-600')}>
              {step > i + 1 && <Check size={10} />}
              {s}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">

          {/* Step 1 — Campagne */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Nom de la campagne *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: Instagram Daily Q2 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/40 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Plateforme cible *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => set('platform', p.id)}
                      className={cn('flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left',
                        form.platform === p.id ? `${p.bg} ${p.border} ${p.color}` : 'border-white/10 text-gray-500 hover:border-white/20')}>
                      <div className={cn('w-2 h-2 rounded-full', form.platform === p.id ? 'bg-current' : 'bg-gray-700')} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Niveau d'automatisation</label>
                <div className="space-y-2">
                  {AUTOMATION_LEVELS.map(l => {
                    const Icon = l.icon
                    return (
                      <button key={l.id} onClick={() => set('automation_level', l.id)}
                        className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                          form.automation_level === l.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/15')}>
                        <Icon size={15} className={form.automation_level === l.id ? 'text-purple-400' : 'text-gray-500'} />
                        <div>
                          <p className="text-xs font-semibold text-white">{l.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{l.desc}</p>
                        </div>
                        {form.automation_level === l.id && <Check size={13} className="ml-auto text-purple-400 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Intégration warning */}
              {!hasIntegration && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-300 font-medium">Aucune intégration active</p>
                    <p className="text-xs text-amber-400/60 mt-0.5">Connectez AdsPower ou GeeLark pour publier automatiquement.</p>
                    <Link href="/settings/integrations" className="text-xs text-amber-400 underline mt-1 inline-block">Configurer →</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Modèles */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Sélectionnez les modèles ({form.model_ids.length} sélectionnés)</p>
                <button onClick={() => set('model_ids', form.model_ids.length === models.length ? [] : models.map(m => m.id))}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  {form.model_ids.length === models.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>
              {models.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-2">Aucun modèle trouvé</p>
                  <Link href="/accounts" className="text-xs text-purple-400 hover:text-purple-300">Créer des modèles →</Link>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {models.map(m => (
                    <button key={m.id} onClick={() => set('model_ids', toggle(form.model_ids, m.id))}
                      className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                        form.model_ids.includes(m.id) ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/15')}>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{m.name}</span>
                      {form.model_ids.includes(m.id) && <Check size={13} className="ml-auto text-purple-400" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Outil */}
              <div>
                <label className="text-xs text-gray-500 block mb-2 mt-3">Outil de publication</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'adspower', label: 'AdsPower' }, { id: 'geelark', label: 'GeeLark' }].map(t => (
                    <button key={t.id} onClick={() => set('tool', t.id)}
                      className={cn('py-2.5 rounded-xl border text-sm font-medium transition-all',
                        form.tool === t.id ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-white/10 text-gray-500 hover:border-white/20')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Contenu */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Mode de sélection du contenu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sequential', label: 'Séquentiel', desc: 'Dans l\'ordre' },
                    { id: 'random',     label: 'Aléatoire',  desc: 'Ordre aléatoire' },
                    { id: 'priority',   label: 'Prioritaire', desc: 'Meilleurs en 1er' },
                  ].map(m => (
                    <button key={m.id} onClick={() => set('content_mode', m.id)}
                      className={cn('p-2.5 rounded-xl border text-left transition-all',
                        form.content_mode === m.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/8 hover:border-white/15')}>
                      <p className="text-xs font-semibold text-white">{m.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Médias depuis la bibliothèque */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Médias ({form.media_ids.length} sélectionnés)</label>
                  <Link href="/media" target="_blank" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Banque médias <ArrowUpRight size={10} />
                  </Link>
                </div>
                {media.length === 0 ? (
                  <div className="text-center py-6 bg-white/3 border border-white/5 rounded-xl">
                    <p className="text-xs text-gray-600 mb-2">Aucun média dans la bibliothèque</p>
                    <Link href="/media" className="text-xs text-purple-400 hover:text-purple-300">Ajouter des médias →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {media.map(m => (
                      <button key={m.id} onClick={() => set('media_ids', toggle(form.media_ids, m.id))}
                        className={cn('relative aspect-square rounded-lg overflow-hidden border transition-all',
                          form.media_ids.includes(m.id) ? 'border-purple-500/60 ring-1 ring-purple-500/40' : 'border-white/5 hover:border-white/20')}>
                        {m.type === 'image'
                          ? <img src={m.public_url} alt={m.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={16} className="text-gray-500" /></div>
                        }
                        {form.media_ids.includes(m.id) && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Caption / Texte</label>
                <textarea value={form.caption} onChange={e => set('caption', e.target.value)} rows={3}
                  placeholder="Texte du post, hashtags..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none transition-colors" />
              </div>
            </div>
          )}

          {/* Step 4 — Horaire */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Date & heure de publication *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/40 focus:outline-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Publications par jour</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={20} value={form.frequency} onChange={e => set('frequency', Number(e.target.value))}
                    className="flex-1 accent-purple-500" />
                  <span className="text-white font-bold w-8 text-right tabular-nums">{form.frequency}x</span>
                </div>
              </div>

              {/* Résumé */}
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-gray-400 mb-3">Résumé de la campagne</p>
                {[
                  { label: 'Nom',         value: form.name || '—' },
                  { label: 'Plateforme',  value: PLATFORMS.find(p => p.id === form.platform)?.label || '—' },
                  { label: 'Modèles',     value: `${form.model_ids.length} sélectionné(s)` },
                  { label: 'Médias',      value: `${form.media_ids.length} sélectionné(s)` },
                  { label: 'Fréquence',   value: `${form.frequency}x/jour` },
                  { label: 'Automation',  value: AUTOMATION_LEVELS.find(a => a.id === form.automation_level)?.label || '—' },
                  { label: 'Outil',       value: form.tool === 'adspower' ? 'AdsPower' : 'GeeLark' },
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
        <div className="flex gap-2 px-6 pb-5">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">
              Retour
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 border border-white/10 rounded-xl text-gray-400 text-sm hover:bg-white/5 transition-all">
            Annuler
          </button>
          <button
            onClick={step < 4 ? () => setStep(s => s + 1) : handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {step < 4 ? 'Continuer' : 'Lancer la campagne'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function AutoPostingPage() {
  const [posts, setPosts]                 = useState<ScheduledPost[]>([])
  const [models, setModels]               = useState<Model[]>([])
  const [media, setMedia]                 = useState<MediaItem[]>([])
  const [integrations, setIntegrations]   = useState<Integration[]>([])
  const [loading, setLoading]             = useState(true)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [activeTab, setActiveTab]         = useState<'campaigns' | 'library' | 'history'>('campaigns')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [postsRes, modelsRes, mediaRes, intRes] = await Promise.all([
        fetch('/api/posting/schedule'),
        fetch('/api/models'),
        fetch('/api/media'),
        fetch('/api/integrations'),
      ])
      if (postsRes.ok)   setPosts((await postsRes.json()).posts || [])
      if (modelsRes.ok)  setModels((await modelsRes.json()).models || [])
      if (mediaRes.ok) {
        const d = await mediaRes.json()
        setMedia(d.files || d.media || [])
      }
      if (intRes.ok) {
        const d = await intRes.json()
        setIntegrations(d.integrations || [])
      }
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  const hasAdsPowerOrGeeLark = integrations.some(i => (i.tool === 'adspower' || i.tool === 'geelark') && i.is_active)

  const handleSaveCampaign = async (data: any) => {
    try {
      const post = {
        model_id: data.model_ids[0] || '',
        platform: data.platform,
        caption: data.caption,
        scheduled_at: data.scheduled_at,
        tool: data.tool,
        content_mode: data.content_mode,
        automation_level: data.automation_level,
        media_ids: data.media_ids,
        model_ids: data.model_ids,
        frequency: data.frequency,
        name: data.name,
      }
      const res = await fetch('/api/posting/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      if (res.ok) {
        toast.success(`Campagne "${data.name}" créée`)
        setShowCampaignModal(false)
        await loadData()
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch { toast.error('Erreur réseau') }
  }

  const stats = [
    { label: 'Campagnes actives', value: posts.filter(p => p.status === 'pending').length, color: 'text-purple-400' },
    { label: 'Publiés ce mois',   value: posts.filter(p => p.status === 'posted').length,  color: 'text-green-400' },
    { label: 'Modèles gérés',     value: models.length,                                     color: 'text-cyan-400' },
    { label: 'Médias dispo.',     value: media.length,                                       color: 'text-yellow-400' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar size={22} className="text-cyan-400" />
            Auto Posting
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Automatisation multi-comptes — AdsPower · GeeLark</p>
        </div>
        <div className="flex items-center gap-2">
          {!hasAdsPowerOrGeeLark && (
            <Link href="/settings/integrations" className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 hover:bg-amber-500/15 transition-all">
              <AlertTriangle size={12} />Connecter AdsPower / GeeLark
            </Link>
          )}
          <button onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
            <Plus size={15} />Nouvelle campagne
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-20 glass rounded-2xl border border-white/5 animate-pulse" />) : (
          stats.map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
              <div className={cn('text-2xl font-bold tabular-nums mb-0.5', s.color)}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))
        )}
      </div>

      {/* ── INTÉGRATIONS STATUS ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {[
          { tool: 'adspower', label: 'AdsPower' },
          { tool: 'geelark',  label: 'GeeLark' },
        ].map(i => {
          const active = integrations.find(x => x.tool === i.tool)?.is_active
          return (
            <div key={i.tool} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs',
              active ? 'border-green-500/20 bg-green-500/5 text-green-400' : 'border-white/10 bg-white/3 text-gray-500')}>
              <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-green-400' : 'bg-gray-600')} />
              {i.label} — {active ? 'Connecté' : 'Non connecté'}
              {!active && <Link href="/settings/integrations" className="ml-1 underline hover:no-underline">Connecter</Link>}
            </div>
          )
        })}
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-5 w-fit">
        {[
          { id: 'campaigns', label: 'Campagnes' },
          { id: 'library',   label: 'Bibliothèque' },
          { id: 'history',   label: 'Historique' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════ CAMPAGNES ════════ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-purple-400" /></div>
          ) : posts.filter(p => p.status === 'pending').length === 0 ? (
            <div className="glass rounded-2xl border border-white/5 p-16 text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-1">Aucune campagne active</p>
              <p className="text-gray-600 text-sm mb-5">Créez votre première campagne pour automatiser vos publications</p>
              <button onClick={() => setShowCampaignModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all">
                <Plus size={15} />Créer une campagne
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Campagnes en cours
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {posts.filter(p => p.status === 'pending').map(post => {
                  const plat = PLATFORMS.find(p => p.id === post.platform)
                  return (
                    <div key={post.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                      <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border flex-shrink-0', plat?.bg, plat?.border, plat?.color)}>
                        {plat?.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{post.model_name}</p>
                        <p className="text-xs text-gray-500 truncate">{post.caption || 'Pas de caption'} · {post.tool?.toUpperCase()}</p>
                      </div>
                      <div className="text-xs text-gray-500 tabular-nums flex-shrink-0">
                        {new Date(post.scheduled_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-400 flex-shrink-0">
                        <Clock size={12} />En attente
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Automation levels explainer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AUTOMATION_LEVELS.map(l => {
              const Icon = l.icon
              return (
                <div key={l.id} className="glass rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="text-purple-400" />
                    <span className="text-xs font-semibold text-white">{l.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{l.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════ BIBLIOTHÈQUE ════════ */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Auto Posting Library</h2>
            <Link href="/media" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
              Gérer la banque de médias <ArrowUpRight size={11} />
            </Link>
          </div>
          {media.length === 0 ? (
            <div className="glass rounded-2xl border border-white/5 p-12 text-center">
              <ImageIcon size={28} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm mb-4">Aucun média dans la bibliothèque</p>
              <Link href="/media" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm hover:bg-white/10 transition-all">
                <Plus size={14} />Ajouter des médias
              </Link>
            </div>
          ) : (
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {media.map(m => (
                  <div key={m.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all">
                      {m.type === 'image'
                        ? <img src={m.public_url} alt={m.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/5 flex items-center justify-center"><Film size={20} className="text-gray-500" /></div>
                      }
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════ HISTORIQUE ════════ */}
      {activeTab === 'history' && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Historique des publications</h2>
          </div>
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-600 text-sm">Aucun historique</div>
          ) : (
            <div className="divide-y divide-white/5">
              {posts.map(post => {
                const status = STATUS_CONFIG[post.status]
                const plat = PLATFORMS.find(p => p.id === post.platform)
                return (
                  <div key={post.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                    <div className={cn('flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border flex-shrink-0', plat?.bg, plat?.border, plat?.color)}>
                      {plat?.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">{post.model_name}</p>
                      <p className="text-xs text-gray-600 truncate">{post.caption || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0 tabular-nums">
                      {new Date(post.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                    <div className={cn('flex items-center gap-1 text-xs font-medium flex-shrink-0', status.color)}>
                      <status.icon size={12} />{status.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          models={models}
          media={media}
          integrations={integrations}
          onClose={() => setShowCampaignModal(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  )
}
