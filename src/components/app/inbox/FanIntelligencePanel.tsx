'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, Check, Trash2, Pencil, Loader2 } from 'lucide-react'
import { addFanMemory, confirmFanMemory, deleteFanMemory, upsertFanScores } from '@/lib/fans/actions'

interface Memory {
  id: string
  category: string
  label: string
  value: string
  confidence: number
  importance: number
  status: string
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
  version: number
}

type Scores = ScoreValues | null

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
  { key: 'purchase_intent', label: "Intention d'achat" },
  { key: 'relationship_score', label: 'Relation' },
  { key: 'spending_potential', label: "Potentiel d'achat" },
  { key: 'engagement_score', label: 'Engagement' },
  { key: 'churn_risk', label: 'Risque de churn' },
] as const

export function FanIntelligencePanel({
  conversationId,
  fanId,
  memories,
  scores,
}: {
  conversationId: string
  fanId: string
  memories: Memory[]
  scores: Scores
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingScores, setEditingScores] = useState(false)
  const [addingMemory, setAddingMemory] = useState(false)

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  const activeMemories = memories.filter((m) => m.status === 'active')

  return (
    <div className="glass mb-4 rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Brain className="h-4 w-4" />
        Fan Intelligence
      </div>

      {/* Scores */}
      <div className="mb-4 space-y-2">
        {!editingScores ? (
          <>
            {SCORES.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-xs">
                <span className="w-32 shrink-0 text-[color:var(--foreground-muted)]">{s.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="gradient-bg-signature h-full"
                    style={{ width: `${scores ? scores[s.key] : 0}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[color:var(--foreground)]">{scores ? scores[s.key] : '—'}</span>
              </div>
            ))}
            {scores?.reasons && (
              <p className="mt-2 text-xs text-[color:var(--foreground-muted)]">{scores.reasons}</p>
            )}
            <button
              onClick={() => setEditingScores(true)}
              className="mt-2 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <Pencil className="h-3 w-3" />
              {scores ? 'Modifier les scores' : 'Renseigner les scores'}
            </button>
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

      <div className="mb-3 h-px bg-[color:var(--border)]" />

      {/* Memories */}
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
    </div>
  )
}
