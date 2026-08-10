'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { uploadMediaAsset } from '@/lib/media/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="gradient-bg-signature flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Envoi...' : 'Ajouter'}
    </button>
  )
}

export function NewMediaForm({ creators }: { creators: { id: string; display_name: string }[] }) {
  return (
    <form action={uploadMediaAsset} className="glass space-y-4 rounded-2xl p-6">
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Créatrice</label>
        <select
          name="creator_id"
          required
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        >
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Fichier (image, vidéo ou audio)</label>
        <input
          type="file"
          name="file"
          required
          accept="image/*,video/*,audio/*"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Titre</label>
        <input
          name="title"
          required
          placeholder="Ex: Set exclusif studio"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Description (optionnel)</label>
        <textarea
          name="description"
          rows={2}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Prix cible (€)</label>
          <input
            type="number"
            name="target_price"
            required
            min={1}
            step="0.01"
            className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Prix minimum (€)</label>
          <input
            type="number"
            name="minimum_price"
            required
            min={1}
            step="0.01"
            className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-[color:var(--foreground-muted)]">
        <input type="checkbox" name="standalone_allowed" defaultChecked />
        Utilisable hors script (vente spontanée)
      </label>
      <SubmitButton />
    </form>
  )
}
