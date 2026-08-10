'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { setConversationAiMode } from '@/lib/inbox/actions'

const MODE_LABELS: Record<string, string> = {
  human_takeover: 'Humain',
  copilot: 'Copilot',
}

export function AiModeToggle({ conversationId, aiMode }: { conversationId: string; aiMode: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const knownMode = aiMode === 'copilot' ? 'copilot' : 'human_takeover'

  return (
    <div className="flex items-center gap-1.5">
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-[color:var(--foreground-muted)]" />}
      <select
        value={knownMode}
        disabled={isPending}
        onChange={(e) => {
          const mode = e.target.value as 'human_takeover' | 'copilot'
          startTransition(async () => {
            await setConversationAiMode(conversationId, mode)
            router.refresh()
          })
        }}
        className="rounded-full border border-[color:var(--border)] bg-transparent px-3 py-1 text-xs text-[color:var(--foreground-muted)] focus:border-[color:var(--border-strong)] focus:outline-none disabled:opacity-50"
      >
        <option value="human_takeover">{MODE_LABELS.human_takeover}</option>
        <option value="copilot">{MODE_LABELS.copilot}</option>
      </select>
    </div>
  )
}
