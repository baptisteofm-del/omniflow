'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { createScript } from '@/lib/scripts/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="gradient-bg-signature flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Création...' : 'Créer le script'}
    </button>
  )
}

export function NewScriptForm({ creators }: { creators: { id: string; display_name: string }[] }) {
  return (
    <form action={createScript} className="glass space-y-4 rounded-2xl p-6">
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Nom du script</label>
        <input
          name="name"
          required
          placeholder="Ex: Vente contenu exclusif"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Description (optionnel)</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Objectif de ce script..."
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Créatrice (optionnel)</label>
        <select
          name="creator_id"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        >
          <option value="">Toutes les créatrices</option>
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton />
    </form>
  )
}
