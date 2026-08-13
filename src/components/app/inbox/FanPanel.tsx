'use client'

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  Brain,
  Tag,
  StickyNote,
  X,
  Plus,
  Check,
  Trash2,
  Pencil,
  Loader2,
  Sparkles,
  CreditCard,
  UserRound,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Heart,
  Flame,
  ShieldAlert,
  Workflow,
  Circle,
} from 'lucide-react'
import {
  addFanMemory,
  confirmFanMemory,
  deleteFanMemory,
  upsertFanScores,
  updateFanProfile,
  addFanNote,
  deleteFanNote,
  addFanTag,
  removeFanTag,
} from '@/lib/fans/actions'
import { analyzeConversationWithAI } from '@/lib/ai/actions'
import { FanFlowBar } from '@/components/app/inbox/FanFlowBar'
import { CollapsibleSection } from '@/components/app/inbox/CollapsibleSection'
import { relativeTimeFr } from '@/lib/utils/relativeTime'
import type { FanFlowStage } from '@/lib/fans/fanFlow'

interface Memory {
  id: string
  category: string
  label: string
  value: string
  confidence: number
  importance: number
  status: string
  source: string
  last_confirmed_at: string | null
}

interface ScoreValues {
  purchase_intent: number
  relationship_score: number
  spending_potential: number
  engagement_score: number
  churn_risk: number
  omni_score: number | null
  reasons: string | null
  computed_by: string
  version: number
}

type Scores = ScoreValues | null

interface FanProfile {
  id: string
  birthday: string | null
  location: string | null
  income_amount: number | null
  income_frequency: string | null
  subscription_status: string
  source: string | null
}

interface FanNote {
  id: string
  text: string
  priority: string
  created_at: string
}

interface FanTagAssignment {
  id: string
  name: string
}

const CATEGORY_LABELS: Record<string, string> = {
  profile: 'Profil',
  relationship: 'Relation',
  preference: 'Préférence',
  commercial: 'Commercial',
  conversation: 'Conversation',
  temporal: 'Temporel',
  boundary: 'Limite',
}

const SCORES = [
  { key: 'purchase_intent', label: "Intention d'achat", icon: ShoppingCart },
  { key: 'relationship_score', label: 'Score relationnel', icon: Heart },
  { key: 'spending_potential', label: 'Potentiel de dépense', icon: Wallet },
  { key: 'engagement_score', label: 'Engagement', icon: Flame },
  { key: 'churn_risk', label: 'Risque de churn', icon: ShieldAlert },
] as const

// A high churn_risk is bad (danger), a high value on every other score is
// good (success) — this table encodes that inversion once instead of
// scattering a `key === 'churn_risk' ? ... : ...` check through the JSX.
const SCORE_QUALITATIVE: Record<(typeof SCORES)[number]['key'], Record<'high' | 'mid' | 'low', string>> = {
  purchase_intent: { high: 'Élevée', mid: 'Modérée', low: 'Faible' },
  relationship_score: { high: 'Excellent', mid: 'Bon', low: 'Faible' },
  spending_potential: { high: 'Très élevé', mid: 'Modéré', low: 'Faible' },
  engagement_score: { high: 'Très engagé', mid: 'Engagé', low: 'Peu engagé' },
  churn_risk: { high: 'Élevé', mid: 'Modéré', low: 'Faible' },
}

const TONE_CLASSES = {
  success: 'text-[color:var(--success)]',
  warning: 'text-[color:var(--warning)]',
  danger: 'text-[color:var(--danger)]',
} as const

function scoreTone(key: (typeof SCORES)[number]['key'], value: number): keyof typeof TONE_CLASSES {
  const bucket = value >= 70 ? 'high' : value >= 40 ? 'mid' : 'low'
  if (key === 'churn_risk') return bucket === 'high' ? 'danger' : bucket === 'mid' ? 'warning' : 'success'
  return bucket === 'high' ? 'success' : bucket === 'mid' ? 'warning' : 'danger'
}

function scoreLabel(key: (typeof SCORES)[number]['key'], value: number): string {
  const bucket = value >= 70 ? 'high' : value >= 40 ? 'mid' : 'low'
  return SCORE_QUALITATIVE[key][bucket]
}

// Fixed per-score-type icon color (independent of the value's tone) —
// matches the reference's colorful icon chips even before any score is
// computed. Every color here is one of the existing functional tokens
// (success/violet/cyan/warning/danger), no new palette introduced.
const SCORE_ICON_CLASSES: Record<(typeof SCORES)[number]['key'], { bg: string; text: string }> = {
  purchase_intent: { bg: 'bg-[color:var(--success)]/15', text: 'text-[color:var(--success)]' },
  spending_potential: { bg: 'bg-[color:var(--violet)]/15', text: 'text-[color:var(--violet)]' },
  relationship_score: { bg: 'bg-[color:var(--cyan)]/15', text: 'text-[color:var(--cyan)]' },
  engagement_score: { bg: 'bg-[color:var(--warning)]/15', text: 'text-[color:var(--warning)]' },
  churn_risk: { bg: 'bg-[color:var(--danger)]/15', text: 'text-[color:var(--danger)]' },
}

interface ScriptStep {
  id: string
  title: string
  status: 'done' | 'current' | 'upcoming'
}

interface ScriptProgress {
  scriptName: string
  steps: ScriptStep[]
}

const INCOME_FREQUENCY_LABELS: Record<string, string> = {
  weekly: '/ semaine',
  monthly: '/ mois',
  yearly: '/ an',
}

type FanPanelTab = 'profile' | 'memory' | 'flow' | 'notes'

// Design handoff: "Onglets principaux: Profil, Mémoire et Fan Flow" — scores
// and value now live together under Profil (matching the reference's single
// dense view) instead of a separate "IA" tab; Notes stays as a 4th tab
// beyond the three named ones (the spec calls those "principaux", not
// exhaustive, and human notes is real existing functionality worth keeping
// reachable).
const TABS: { key: FanPanelTab; label: string; icon: typeof UserRound }[] = [
  { key: 'profile', label: 'Profil', icon: UserRound },
  { key: 'memory', label: 'Mémoire', icon: Brain },
  { key: 'flow', label: 'Fan Flow', icon: Sparkles },
  { key: 'notes', label: 'Notes', icon: StickyNote },
]

export function FanPanel({
  conversationId,
  fanId,
  fan,
  flowStage,
  totalSpent,
  purchaseCount,
  mediaSpend,
  tipsSpend,
  subscriptionSpend,
  lastPurchaseAt,
  memories,
  scores,
  scoresAreStale,
  scriptProgress,
  notes,
  tags,
}: {
  conversationId: string
  fanId: string
  fan: FanProfile
  flowStage: FanFlowStage
  totalSpent: number
  purchaseCount: number
  mediaSpend: number
  tipsSpend: number
  subscriptionSpend: number
  lastPurchaseAt: string | null
  memories: Memory[]
  scores: Scores
  scoresAreStale: boolean
  scriptProgress: ScriptProgress | null
  notes: FanNote[]
  tags: FanTagAssignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [editingScores, setEditingScores] = useState(false)
  const [addingMemory, setAddingMemory] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [activeTab, setActiveTab] = useState<FanPanelTab>('profile')

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  const handleAnalyze = () => {
    setAnalyzeError(null)
    setIsAnalyzing(true)
    startTransition(async () => {
      try {
        await analyzeConversationWithAI(conversationId)
        router.refresh()
      } catch (err) {
        setAnalyzeError(err instanceof Error ? err.message : "Échec de l'analyse IA")
      } finally {
        setIsAnalyzing(false)
      }
    })
  }

  const activeMemories = memories.filter((m) => m.status === 'active')
  const preferenceMemories = activeMemories.filter((m) => m.category === 'preference')

  return (
    <div className="glass rounded-2xl p-5">
      {/* Structured in tabs, not one long scrolling page (Inbox V2 spec
          §20: "onglets/sections plutôt qu'une très longue page"). */}
      {/* BUG FIX (owner report): 4 tabs at full label width didn't fit the
          panel's ~320px, clipping "Notes" outside the visible frame.
          overflow-x-auto is the safety net (never breaks layout even if
          content is still too wide at some zoom level); the tightened
          padding/gap is what actually makes all 4 fit at normal width. */}
      <div className="mb-4 flex gap-0.5 overflow-x-auto border-b border-[color:var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex shrink-0 items-center gap-1 border-b-2 px-2 py-2 text-[11px] font-medium transition-colors ${
              activeTab === t.key
                ? 'border-[color:var(--violet)] text-[color:var(--foreground)]'
                : 'border-transparent text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            <t.icon className="h-3.5 w-3.5 shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              {/* Design handoff: "ne jamais simuler indéfiniment une
                  analyse en cours" — say plainly whether these numbers
                  reflect the fan's latest message or predate it, instead
                  of presenting them as always-current. */}
              {!scores ? (
                <p className="flex items-center gap-1.5 text-[10px] text-[color:var(--foreground-muted)]">
                  <Clock className="h-3 w-3" />
                  Pas encore analysé
                </p>
              ) : scoresAreStale ? (
                <p className="flex items-center gap-1.5 text-[10px] text-[color:var(--warning)]">
                  <Clock className="h-3 w-3" />
                  Nouveau message depuis la dernière analyse
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-[10px] text-[color:var(--success)]">
                  <CheckCircle2 className="h-3 w-3" />
                  À jour
                </p>
              )}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                title="Se met à jour automatiquement après chaque message — force une ré-analyse immédiate"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Ré-analyser
              </button>
            </div>
            {analyzeError && <p className="mb-3 text-xs text-[color:var(--danger)]">{analyzeError}</p>}

            {!editingScores ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {SCORES.map((s) => {
                    const value = scores ? scores[s.key] : null
                    const tone = value !== null ? scoreTone(s.key, value) : null
                    const iconClasses = SCORE_ICON_CLASSES[s.key]
                    return (
                      <div key={s.key} className="rounded-xl border border-[color:var(--border)] p-3">
                        <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full ${iconClasses.bg}`}>
                          <s.icon className={`h-3.5 w-3.5 ${iconClasses.text}`} />
                        </div>
                        <p className="text-[10px] text-[color:var(--foreground-muted)]">{s.label}</p>
                        <p className={`text-lg font-semibold ${tone ? TONE_CLASSES[tone] : 'text-[color:var(--foreground-muted)]'}`}>
                          {value ?? '—'}
                        </p>
                        {value !== null && (
                          <p className={`text-[9px] ${tone ? TONE_CLASSES[tone] : ''}`}>{scoreLabel(s.key, value)}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Note IA — the AI's existing free-text "reasons" signal,
                    given a real card instead of a buried caption. No fake
                    live-analysis animation (waveform, spinner) here — the
                    handoff explicitly warns against simulating an ongoing
                    analysis that isn't actually happening; this is a static
                    note tied to the freshness state shown above. */}
                {scores?.reasons && (
                  <div className="mt-2 rounded-xl border border-[color:var(--violet)]/30 bg-[color:var(--violet)]/5 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-[color:var(--violet)]">
                      <Sparkles className="h-3 w-3" />
                      Note IA
                    </div>
                    <p className="text-xs text-[color:var(--foreground-muted)]">{scores.reasons}</p>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => setEditingScores(true)}
                    className="flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                  >
                    <Pencil className="h-3 w-3" />
                    {scores ? 'Modifier les scores' : 'Renseigner les scores'}
                  </button>
                  {scores && (
                    <span className="text-[10px] text-[color:var(--foreground-muted)]">
                      {scores.computed_by === 'system' ? 'calculé par l’IA' : 'saisi manuellement'} · v{scores.version}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  runAction(() => upsertFanScores(conversationId, formData))
                  setEditingScores(false)
                }}
                className="space-y-2"
              >
                <input type="hidden" name="fan_id" value={fanId} />
                {SCORES.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 text-xs">
                    <span className="w-32 shrink-0 text-[color:var(--foreground-muted)]">{s.label}</span>
                    <input
                      type="number"
                      name={s.key}
                      min={0}
                      max={100}
                      defaultValue={scores ? scores[s.key] : 0}
                      className="w-16 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                    />
                  </div>
                ))}
                <textarea
                  name="reasons"
                  defaultValue={scores?.reasons ?? ''}
                  placeholder="Signaux / raisons (optionnel)"
                  rows={2}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingScores(false)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="h-px bg-[color:var(--border)]" />

          {/* Valeur Fan — grille dense façon MyFeed : dépense totale, nombre
              d'achats, puis répartition réelle par type de transaction
              (schéma transactions.transaction_type), plus la date du
              dernier achat. */}
          <CollapsibleSection icon={<Wallet className="h-4 w-4" />} title="Valeur Fan">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="col-span-2 rounded-xl border border-[color:var(--border-strong)] bg-white/[0.03] py-3">
                <p className="text-xl font-semibold gradient-text">{totalSpent}€</p>
                <p className="text-[10px] text-[color:var(--foreground-muted)]">Dépensé au total</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{purchaseCount}</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Achats</p>
              </div>
              {/* Panier moyen — derived from the same two real numbers
                  already shown above (totalSpent / purchaseCount), not a
                  new data source. */}
              <div className="rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{purchaseCount > 0 ? Math.round(totalSpent / purchaseCount) : 0}€</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Panier moyen</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{lastPurchaseAt ? relativeTimeFr(lastPurchaseAt) : 'Jamais'}</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Dernier achat</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{mediaSpend}€</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Média / PPV</p>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{tipsSpend}€</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Tips</p>
              </div>
              <div className="col-span-2 rounded-xl border border-[color:var(--border)] py-2.5">
                <p className="text-sm font-semibold">{subscriptionSpend}€</p>
                <p className="text-[9px] text-[color:var(--foreground-muted)]">Abonnement</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Préférences — reuses fan_memories entries already collected
              under the "preference" category (the memory tab's own data,
              just surfaced here too) instead of inventing structured fields
              (heures actives, budget moyen...) the schema doesn't have. */}
          {preferenceMemories.length > 0 && (
            <>
              <div className="h-px bg-[color:var(--border)]" />
              <CollapsibleSection icon={<Heart className="h-4 w-4" />} title="Préférences">
                <div className="space-y-1.5 text-xs">
                  {preferenceMemories.map((m) => (
                    <p key={m.id}>
                      <span className="text-[color:var(--foreground-muted)]">{m.label} : </span>
                      <span className="text-[color:var(--foreground)]">{m.value}</span>
                    </p>
                  ))}
                </div>
              </CollapsibleSection>
            </>
          )}

          <div className="h-px bg-[color:var(--border)]" />

          {/* Profil */}
          <CollapsibleSection
            icon={<UserRound className="h-4 w-4" />}
            title="Profil"
            right={
              !editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
                >
                  <Pencil className="h-3 w-3" />
                  Modifier
                </button>
              )
            }
          >
            {!editingProfile ? (
              <div className="space-y-1.5 text-xs text-[color:var(--foreground-muted)]">
                <p>Anniversaire : {fan.birthday ? new Date(fan.birthday).toLocaleDateString('fr-FR') : '—'}</p>
                <p>Localisation : {fan.location || '—'}</p>
                <p>
                  Revenu :{' '}
                  {fan.income_amount
                    ? `${fan.income_amount}€ ${INCOME_FREQUENCY_LABELS[fan.income_frequency ?? ''] ?? ''}`
                    : '—'}
                </p>
                <p>Source : {fan.source || '—'}</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  runAction(() => updateFanProfile(conversationId, formData))
                  setEditingProfile(false)
                }}
                className="space-y-2"
              >
                <input type="hidden" name="fan_id" value={fan.id} />
                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Anniversaire</label>
                  <input
                    type="date"
                    name="birthday"
                    defaultValue={fan.birthday ?? ''}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Localisation</label>
                  <input
                    name="location"
                    defaultValue={fan.location ?? ''}
                    placeholder="Paris, Lyon..."
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="income_amount"
                    defaultValue={fan.income_amount ?? ''}
                    placeholder="Revenu"
                    className="w-1/2 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                  <select
                    name="income_frequency"
                    defaultValue={fan.income_frequency ?? ''}
                    className="w-1/2 rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  >
                    <option value="">Fréquence</option>
                    <option value="weekly">Par semaine</option>
                    <option value="monthly">Par mois</option>
                    <option value="yearly">Par an</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Source</label>
                  <input
                    name="source"
                    defaultValue={fan.source ?? ''}
                    placeholder="Bio link, mass DM..."
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Abonnement</label>
                  <select
                    name="subscription_status"
                    defaultValue={fan.subscription_status}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </CollapsibleSection>

          <div className="h-px bg-[color:var(--border)]" />

          {/* Abonnement */}
          <CollapsibleSection icon={<CreditCard className="h-4 w-4" />} title="Abonnement">
            <span
              className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${
                fan.subscription_status === 'active'
                  ? 'border-[color:var(--success)]/40 text-[color:var(--success)]'
                  : 'border-[color:var(--danger)]/40 text-[color:var(--danger)]'
              }`}
            >
              {fan.subscription_status === 'active' ? 'Abonnement actif' : 'Abonnement inactif'}
            </span>
          </CollapsibleSection>

          <div className="h-px bg-[color:var(--border)]" />

          {/* Listes / tags */}
          <CollapsibleSection icon={<Tag className="h-4 w-4" />} title="Listes">
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] px-2.5 py-1 text-[10px] text-[color:var(--foreground)]"
                >
                  {t.name}
                  <button
                    onClick={() => runAction(() => removeFanTag(conversationId, t.id))}
                    disabled={isPending}
                    className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)]"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!tagDraft.trim()) return
                  const formData = new FormData()
                  formData.set('fan_id', fan.id)
                  formData.set('name', tagDraft.trim())
                  runAction(() => addFanTag(conversationId, formData))
                  setTagDraft('')
                }}
                className="flex items-center gap-1"
              >
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  placeholder="+ liste"
                  className="w-20 rounded-full border border-dashed border-[color:var(--border)] bg-transparent px-2.5 py-1 text-[10px] focus:border-[color:var(--border-strong)] focus:outline-none"
                />
              </form>
            </div>
          </CollapsibleSection>

          {/* Progression Script — real step list from script_nodes
              (sequence_order), not an approximation: only rendered when a
              script is actually running on this conversation. */}
          {scriptProgress && scriptProgress.steps.length > 0 && (
            <>
              <div className="h-px bg-[color:var(--border)]" />
              <CollapsibleSection icon={<Workflow className="h-4 w-4" />} title={`Script — ${scriptProgress.scriptName}`}>
                {/* Horizontal stepper (design handoff reference), not a
                    vertical checklist — same real step data as before
                    (script_nodes.sequence_order), just laid out as connected
                    circles. overflow-x-auto is the safety net if a script
                    ever has enough steps to not fit the panel width (same
                    defensive pattern as the 4-tab row above). */}
                <div className="flex overflow-x-auto pb-1">
                  {scriptProgress.steps.map((step, i) => (
                    <Fragment key={step.id}>
                      <div className="flex w-11 shrink-0 flex-col items-center gap-1.5">
                        {step.status === 'done' ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--success)]" />
                        ) : step.status === 'current' ? (
                          <Circle className="h-4 w-4 shrink-0 fill-[color:var(--violet)]/20 text-[color:var(--violet)]" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-[color:var(--border-strong)]" />
                        )}
                        <span
                          className={`break-words text-center text-[9px] leading-tight ${
                            step.status === 'current'
                              ? 'font-medium text-[color:var(--foreground)]'
                              : step.status === 'done'
                                ? 'text-[color:var(--foreground)]'
                                : 'text-[color:var(--foreground-muted)]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {i < scriptProgress.steps.length - 1 && (
                        <div
                          className={`mt-2 h-px min-w-1 flex-1 ${
                            step.status === 'done' ? 'bg-[color:var(--success)]' : 'bg-[color:var(--border)]'
                          }`}
                        />
                      )}
                    </Fragment>
                  ))}
                </div>
              </CollapsibleSection>
            </>
          )}
        </div>
      )}

      {activeTab === 'memory' && (
        <div className="space-y-2">
          {activeMemories.length === 0 && (
            <p className="text-xs text-[color:var(--foreground-muted)]">Aucune mémoire enregistrée pour ce fan.</p>
          )}
          {activeMemories.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs">
              <div>
                <span className="mr-2 rounded-full border border-[color:var(--border-strong)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)]">
                  {CATEGORY_LABELS[m.category] ?? m.category}
                </span>
                {m.source === 'ai' && (
                  <span className="mr-2 inline-flex items-center gap-1 text-[10px] text-[color:var(--foreground-muted)]">
                    <Sparkles className="h-2.5 w-2.5" />
                    IA
                  </span>
                )}
                <span className="text-[color:var(--foreground)]">{m.label} :</span>{' '}
                <span className="text-[color:var(--foreground-muted)]">{m.value}</span>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => runAction(() => confirmFanMemory(conversationId, m.id))}
                  disabled={isPending}
                  title="Confirmer"
                  className="text-[color:var(--foreground-muted)] hover:text-[color:var(--success)] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => runAction(() => deleteFanMemory(conversationId, m.id))}
                  disabled={isPending}
                  title="Supprimer"
                  className="text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)] disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {!addingMemory ? (
            <button
              onClick={() => setAddingMemory(true)}
              className="flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une mémoire
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                runAction(() => addFanMemory(conversationId, formData))
                setAddingMemory(false)
                e.currentTarget.reset()
              }}
              className="space-y-2 rounded-xl border border-[color:var(--border)] p-3"
            >
              <input type="hidden" name="fan_id" value={fanId} />
              <select
                name="category"
                required
                defaultValue="preference"
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="label"
                required
                placeholder="Ex: intérêt, surnom, dernier achat..."
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <input
                name="value"
                required
                placeholder="Ex: adore le football"
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <input type="hidden" name="importance" value="0.5" />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingMemory(false)}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'flow' && (
        <div>
          <FanFlowBar stage={flowStage} totalSpent={totalSpent} />
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-2">
          {notes.length === 0 && <p className="text-xs text-[color:var(--foreground-muted)]">Aucune note.</p>}
          {notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-2 rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs">
              <div>
                {n.priority === 'important' && (
                  <span className="mr-1.5 rounded-full bg-[color:var(--danger)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--danger)]">
                    important
                  </span>
                )}
                <span className="text-[color:var(--foreground-muted)]">{n.text}</span>
              </div>
              <button
                onClick={() => runAction(() => deleteFanNote(conversationId, n.id))}
                disabled={isPending}
                className="shrink-0 text-[color:var(--foreground-muted)] hover:text-[color:var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {!addingNote ? (
            <button
              onClick={() => setAddingNote(true)}
              className="flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une note
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                runAction(() => addFanNote(conversationId, formData))
                setAddingNote(false)
                e.currentTarget.reset()
              }}
              className="space-y-2 rounded-xl border border-[color:var(--border)] p-3"
            >
              <input type="hidden" name="fan_id" value={fan.id} />
              <textarea
                name="text"
                required
                rows={2}
                placeholder="Note interne pour l'agence..."
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              />
              <select
                name="priority"
                defaultValue="normal"
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
              >
                <option value="normal">Normale</option>
                <option value="important">Importante</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="gradient-bg-signature rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingNote(false)}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
