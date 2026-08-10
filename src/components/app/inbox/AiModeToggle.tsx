'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert, Hand } from 'lucide-react'
import { setConversationAiMode } from '@/lib/inbox/actions'

const MODE_LABELS: Record<string, string> = {
  human_takeover: 'Humain',
  copilot: 'Copilot',
  full_ai: 'Full AI',
}

export function AiModeToggle({
  conversationId,
  aiMode,
  fullAiEnabled,
  escalationReason,
}: {
  conversationId: string
  aiMode: string
  fullAiEnabled: boolean
  escalationReason?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const setMode = (mode: 'human_takeover' | 'copilot' | 'full_ai') => {
    startTransition(async () => {
      await setConversationAiMode(conversationId, mode)
      router.refresh()
    })
  }

  if (aiMode === 'paused') {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-3 py-1.5 text-xs text-[color:var(--danger)]">
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
        <span>Full AI a escaladé{escalationReason ? ` — ${escalationReason}` : ''}</span>
        <button onClick={() => setMode('human_takeover')} disabled={isPending} className="underline disabled:opacity-50">
          Prendre le contrôle
        </button>
        {fullAiEnabled && (
          <button onClick={() => setMode('full_ai')} disabled={isPending} className="underline disabled:opacity-50">
            Reprendre en Full AI
          </button>
        )}
      </div>
    )
  }

  if (aiMode === 'full_ai') {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[color:var(--border-strong)] bg-white/10 px-3 py-1 text-xs">Full AI actif</span>
        <button
          onClick={() => setMode('human_takeover')}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Hand className="h-3 w-3" />}
          Prendre le contrôle
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-[color:var(--foreground-muted)]" />}
      <select
        value={aiMode === 'copilot' ? 'copilot' : 'human_takeover'}
        disabled={isPending}
        onChange={(e) => setMode(e.target.value as 'human_takeover' | 'copilot' | 'full_ai')}
        className="rounded-full border border-[color:var(--border)] bg-transparent px-3 py-1 text-xs text-[color:var(--foreground-muted)] focus:border-[color:var(--border-strong)] focus:outline-none disabled:opacity-50"
      >
        <option value="human_takeover">{MODE_LABELS.human_takeover}</option>
        <option value="copilot">{MODE_LABELS.copilot}</option>
        {fullAiEnabled && <option value="full_ai">{MODE_LABELS.full_ai}</option>}
      </select>
      {!fullAiEnabled && (
        <a href="/settings/ai" className="text-[10px] text-[color:var(--foreground-muted)] underline">
          Activer Full AI
        </a>
      )}
    </div>
  )
}
