'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, FlaskConical, ShoppingBag, XCircle, Loader2, Sparkles, RotateCcw, Pencil } from 'lucide-react'
import { sendHumanMessage, simulateFanMessage, simulatePurchase, simulateDecline } from '@/lib/inbox/actions'
import {
  generateCopilotSuggestion,
  regenerateCopilotSuggestion,
  sendCopilotSuggestion,
  discardCopilotSuggestion,
} from '@/lib/copilot/actions'
import type { QuickAction } from '@/lib/ai/tasks'

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  sender_type: 'fan' | 'human' | 'ai' | 'system'
  text: string
  is_paid: boolean
  price_amount: number | null
  message_type: string
  sent_at: string
}

interface PendingSuggestion {
  id: string
  suggested_text: string
}

const QUICK_ACTIONS: { key: QuickAction; label: string }[] = [
  { key: 'shorter', label: 'Plus court' },
  { key: 'direct', label: 'Plus direct' },
  { key: 'affectionate', label: 'Plus affectueux' },
]

export function ConversationView({
  conversationId,
  initialMessages,
  aiMode,
  pendingSuggestion,
}: {
  conversationId: string
  initialMessages: Message[]
  aiMode: string
  pendingSuggestion: PendingSuggestion | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reply, setReply] = useState(pendingSuggestion?.suggested_text ?? '')
  const [fanDraft, setFanDraft] = useState('')
  const [showMockPanel, setShowMockPanel] = useState(false)
  const isCopilot = aiMode === 'copilot'

  useEffect(() => {
    if (pendingSuggestion) setReply(pendingSuggestion.suggested_text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSuggestion?.id])

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn()
      router.refresh()
      // Fan Intelligence / Copilot suggestions finish in the background
      // (no manual click needed). They aren't done yet by the time this
      // refresh fires, so schedule a couple more to pick up the result —
      // Response Generation (Sonnet-tier) is slower than the Fast-tier
      // extraction/scoring calls.
      setTimeout(() => router.refresh(), 3000)
      setTimeout(() => router.refresh(), 7000)
    })
  }

  return (
    <div>
      <div className="glass mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl p-5">
        {initialMessages.length === 0 && (
          <p className="text-center text-sm text-[color:var(--foreground-muted)]">Aucun message pour l&apos;instant.</p>
        )}
        {initialMessages.map((m) => {
          if (m.message_type === 'purchase_confirmation') {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1 text-xs text-[color:var(--success)]">
                  {m.text} {m.price_amount ? `— ${m.price_amount}€` : ''}
                </span>
              </div>
            )
          }
          const isOutbound = m.direction === 'outbound'
          return (
            <div key={m.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isOutbound ? 'gradient-bg-signature rounded-br-sm text-white' : 'rounded-bl-sm bg-[color:var(--surface-elevated)]'
                }`}
              >
                {m.is_paid && m.price_amount && (
                  <span className="mb-1 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
                    💰 {m.price_amount}€
                  </span>
                )}
                <p>{m.text}</p>
                <span className="mt-1 block text-[10px] opacity-60">{m.sender_type}</span>
              </div>
            </div>
          )
        })}
      </div>

      {isCopilot && pendingSuggestion && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-[color:var(--foreground-muted)]">
            <Sparkles className="h-3 w-3" />
            Suggestion IA
          </span>
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.key}
              type="button"
              disabled={isPending}
              onClick={() =>
                runAction(() => regenerateCopilotSuggestion(conversationId, pendingSuggestion.id, qa.key))
              }
              className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
            >
              {qa.label}
            </button>
          ))}
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => regenerateCopilotSuggestion(conversationId, pendingSuggestion.id))}
            className="flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Régénérer
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setReply('')
              runAction(() => discardCopilotSuggestion(conversationId, pendingSuggestion.id))
            }}
            className="flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
          >
            <Pencil className="h-2.5 w-2.5" />
            Écrire moi-même
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!reply.trim()) return
          const text = reply
          setReply('')
          if (isCopilot && pendingSuggestion) {
            runAction(() => sendCopilotSuggestion(conversationId, pendingSuggestion.id, text))
          } else {
            runAction(() => sendHumanMessage(conversationId, text))
          }
        }}
        className="mb-2 flex gap-2"
      >
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Écrire une réponse..."
          className="flex-1 rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="gradient-bg-signature flex items-center justify-center rounded-xl px-4 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {isCopilot && !pendingSuggestion && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction(() => generateCopilotSuggestion(conversationId))}
          className="mb-4 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Générer une suggestion
        </button>
      )}

      <button
        onClick={() => setShowMockPanel((v) => !v)}
        className="mb-2 mt-2 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Outils de test (MOCK)
      </button>

      {showMockPanel && (
        <div className="glass space-y-3 rounded-2xl p-4">
          <div className="flex gap-2">
            <input
              value={fanDraft}
              onChange={(e) => setFanDraft(e.target.value)}
              placeholder="Simuler un message du fan..."
              className="flex-1 rounded-xl border border-[color:var(--border)] bg-white/5 px-3 py-2 text-sm focus:border-[color:var(--border-strong)] focus:outline-none"
            />
            <button
              onClick={() => {
                if (!fanDraft.trim()) return
                const text = fanDraft
                setFanDraft('')
                runAction(() => simulateFanMessage(conversationId, text))
              }}
              disabled={isPending}
              className="rounded-xl border border-[color:var(--border-strong)] px-3 py-2 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
            >
              Envoyer (fan)
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => runAction(() => simulatePurchase(conversationId, 'Contenu exclusif', 39))}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[color:var(--border-strong)] px-3 py-2 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Simuler un achat (39€)
            </button>
            <button
              onClick={() => runAction(() => simulateDecline(conversationId))}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[color:var(--border-strong)] px-3 py-2 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Simuler un refus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
