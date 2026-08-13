'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, Pencil } from 'lucide-react'
import { updateCreatorModelDna } from '@/lib/creators/actions'
import { CollapsibleSection } from '@/components/app/inbox/CollapsibleSection'

interface ModelDna {
  warmth: number
  flirt_intensity: number
  directness: number
  sales_aggressiveness: number
  message_length: string
  emoji_style: string
}

const SLIDERS: { key: keyof Pick<ModelDna, 'warmth' | 'flirt_intensity' | 'directness' | 'sales_aggressiveness'>; label: string; hint: string }[] = [
  { key: 'warmth', label: 'Chaleur', hint: 'Distant ↔ Très chaleureux' },
  { key: 'flirt_intensity', label: 'Flirt', hint: 'Neutre ↔ Très flirt' },
  { key: 'directness', label: 'Franchise', hint: 'Suggestif ↔ Très direct' },
  { key: 'sales_aggressiveness', label: 'Agressivité commerciale', hint: 'Discret ↔ Très commercial' },
]

// Owner request: adjust how the AI writes for THIS creator without leaving
// the conversation — previously the only place these sliders existed was
// the one-time "New Creator" form; there was no way back in afterward.
export function ModelDnaPanel({
  creatorId,
  conversationId,
  creatorName,
  dna,
}: {
  creatorId: string
  conversationId: string
  creatorName: string
  dna: ModelDna | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<ModelDna>(
    dna ?? { warmth: 50, flirt_intensity: 50, directness: 50, sales_aggressiveness: 50, message_length: 'medium', emoji_style: 'medium' }
  )

  if (!dna) return null

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      await updateCreatorModelDna(creatorId, conversationId, formData)
      setEditing(false)
      router.refresh()
    })
  }

  return (
    <div className="glass rounded-2xl p-5">
      <CollapsibleSection
        icon={<Sparkles className="h-4 w-4" />}
        title={`Personnalité IA — ${creatorName}`}
        right={
          !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
          )
        }
      >
        <p className="mb-3 text-[10px] text-[color:var(--foreground-muted)]">
          S&apos;applique à toutes les conversations de {creatorName}, pas seulement celle-ci.
        </p>
        {!editing ? (
          <div className="space-y-2.5">
            {SLIDERS.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-xs">
                <span className="w-36 shrink-0 text-[color:var(--foreground-muted)]">{s.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="gradient-bg-signature h-full" style={{ width: `${values[s.key]}%` }} />
                </div>
                <span className="w-7 shrink-0 text-right text-[color:var(--foreground-muted)]">{values[s.key]}</span>
              </div>
            ))}
          </div>
        ) : (
          <form
            action={(formData) => handleSave(formData)}
            className="space-y-3"
          >
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{s.label}</span>
                  <span className="text-[color:var(--foreground-muted)]">{values[s.key]}</span>
                </div>
                <input
                  type="range"
                  name={s.key}
                  min={0}
                  max={100}
                  value={values[s.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
                  className="w-full accent-[color:var(--violet)]"
                />
                <p className="mt-0.5 text-[9px] text-[color:var(--foreground-muted)]">{s.hint}</p>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Longueur des messages</label>
                <select
                  name="message_length"
                  value={values.message_length}
                  onChange={(e) => setValues((v) => ({ ...v, message_length: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                >
                  <option value="very_short">Très courte</option>
                  <option value="short">Courte</option>
                  <option value="medium">Moyenne</option>
                  <option value="long">Longue</option>
                  <option value="adaptive">Adaptative</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-[color:var(--foreground-muted)]">Emojis</label>
                <select
                  name="emoji_style"
                  value={values.emoji_style}
                  onChange={(e) => setValues((v) => ({ ...v, emoji_style: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1.5 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                >
                  <option value="off">Aucun</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="gradient-bg-signature flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(dna)
                  setEditing(false)
                }}
                className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--foreground-muted)]"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </CollapsibleSection>
    </div>
  )
}
