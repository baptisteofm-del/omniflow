'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { startMockConversation } from '@/lib/inbox/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="gradient-bg-signature flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? 'Création...' : 'Démarrer'}
    </button>
  )
}

export function NewMockConversationForm({ creators }: { creators: { id: string; display_name: string }[] }) {
  return (
    <form action={startMockConversation} className="space-y-4">
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
        <label className="mb-1.5 block text-xs text-[color:var(--foreground-muted)]">Nom du fan (test)</label>
        <input
          name="fan_name"
          required
          placeholder="Alex"
          className="w-full rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
      </div>
      <SubmitButton />
    </form>
  )
}
