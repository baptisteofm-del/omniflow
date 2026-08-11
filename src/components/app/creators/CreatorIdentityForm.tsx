'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil } from 'lucide-react'
import { updateCreator } from '@/lib/creators/actions'

interface Creator {
  id: string
  display_name: string
  internal_name: string | null
  default_language: string
  timezone: string
  notes: string | null
}

export function CreatorIdentityForm({ creator }: { creator: Creator }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{creator.display_name}</h1>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </button>
        </div>
        <div className="mt-1 space-y-0.5 text-xs text-[color:var(--foreground-muted)]">
          {creator.internal_name && <p>Nom interne : {creator.internal_name}</p>}
          <p>Langue : {creator.default_language === 'fr' ? 'Français' : 'Anglais'} · Fuseau : {creator.timezone}</p>
          {creator.notes && <p>Notes : {creator.notes}</p>}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
          try {
            await updateCreator(creator.id, formData)
            setEditing(false)
            router.refresh()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue')
          }
        })
      }}
      className="space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs text-[color:var(--foreground-muted)]">Nom de la créatrice</label>
        <input
          name="display_name"
          required
          defaultValue={creator.display_name}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[color:var(--foreground-muted)]">Nom interne (optionnel)</label>
        <input
          name="internal_name"
          defaultValue={creator.internal_name ?? ''}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-[color:var(--foreground-muted)]">Langue</label>
          <select
            name="default_language"
            defaultValue={creator.default_language}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          >
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[color:var(--foreground-muted)]">Fuseau horaire</label>
          <input
            name="timezone"
            defaultValue={creator.timezone}
            placeholder="Europe/Paris"
            className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[color:var(--foreground-muted)]">Notes internes</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={creator.notes ?? ''}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="gradient-bg-signature flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs text-white disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-xs text-[color:var(--foreground-muted)]"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
