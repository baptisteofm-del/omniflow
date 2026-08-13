'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert, Hand, Bot, Sparkles } from 'lucide-react'
import { setConversationAiMode } from '@/lib/inbox/actions'

// Owner request: no more per-conversation Human/Copilot/Full AI dropdown —
// the mode an agency wants is set once per creator (Paramètres → IA →
// "Mode par défaut", applied automatically to every new conversation via a
// DB trigger). The only manual, per-conversation control left is a single
// takeover/release button.
export function AiModeToggle({
  conversationId,
  aiMode,
  defaultAiMode,
  fullAiEnabled,
  escalationReason,
}: {
  conversationId: string
  aiMode: string
  defaultAiMode: string
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

  if (aiMode === 'human_takeover') {
    // No "Rendre à l'IA" button when the creator's own default is "Humain"
    // — there's no AI mode configured to hand back to.
    const canReturnToAi = defaultAiMode === 'copilot' || (defaultAiMode === 'full_ai' && fullAiEnabled)
    const returnMode: 'copilot' | 'full_ai' = defaultAiMode === 'full_ai' && fullAiEnabled ? 'full_ai' : 'copilot'
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-white/10 px-3 py-1 text-xs">
          <Hand className="h-3 w-3" />
          Humain
        </span>
        {canReturnToAi && (
          <button
            onClick={() => setMode(returnMode)}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Rendre à l&apos;IA
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--border-strong)] bg-white/10 px-3 py-1 text-xs">
        <Bot className="h-3 w-3" />
        {aiMode === 'full_ai' ? 'Full AI actif' : 'Copilot actif'}
      </span>
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
