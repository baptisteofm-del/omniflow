'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, Pencil, Tag, StickyNote, X, Plus, Loader2 } from 'lucide-react'
import { updateFanProfile, addFanNote, deleteFanNote, addFanTag, removeFanTag } from '@/lib/fans/actions'
import { FAN_FLOW_LABELS, type FanFlowStage } from '@/lib/fans/fanFlow'

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

const INCOME_FREQUENCY_LABELS: Record<string, string> = {
  weekly: '/ semaine',
  monthly: '/ mois',
  yearly: '/ an',
}

export function FanProfileCard({
  conversationId,
  fan,
  flowStage,
  totalSpent,
  purchaseCount,
  notes,
  tags,
}: {
  conversationId: string
  fan: FanProfile
  flowStage: FanFlowStage
  totalSpent: number
  purchaseCount: number
  notes: FanNote[]
  tags: FanTagAssignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [tagDraft, setTagDraft] = useState('')

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  return (
    <div className="glass rounded-2xl p-5">
      {/* Valeur Fan + Fan Flow */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="h-4 w-4" />
          Valeur Fan
        </div>
        <span className="rounded-full border border-[color:var(--border-strong)] px-2.5 py-1 text-xs font-medium text-[color:var(--foreground)]">
          {FAN_FLOW_LABELS[flowStage]}
        </span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-[color:var(--border)] py-3">
          <p className="text-lg font-semibold gradient-text">{totalSpent}€</p>
          <p className="text-[10px] text-[color:var(--foreground-muted)]">Dépensé</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border)] py-3">
          <p className="text-lg font-semibold">{purchaseCount}</p>
          <p className="text-[10px] text-[color:var(--foreground-muted)]">Achats</p>
        </div>
      </div>

      <div className="mb-3 h-px bg-[color:var(--border)]" />

      {/* Profil + Abonnement */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          Profil
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="flex items-center gap-1 text-xs font-normal text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
          )}
        </div>

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
            <p>
              Abonnement :{' '}
              <span className={fan.subscription_status === 'active' ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]'}>
                {fan.subscription_status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </p>
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
      </div>

      <div className="mb-3 h-px bg-[color:var(--border)]" />

      {/* Listes / tags */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4" />
          Listes
        </div>
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
      </div>

      <div className="mb-3 h-px bg-[color:var(--border)]" />

      {/* Notes humaines */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <StickyNote className="h-4 w-4" />
          Notes
        </div>
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
      </div>
    </div>
  )
}
