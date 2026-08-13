'use client'

import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, FlaskConical, ShoppingBag, XCircle, Loader2, Sparkles, RotateCcw, Pencil, Bot } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendHumanMessage, simulateFanMessage, simulatePurchase, simulateDecline } from '@/lib/inbox/actions'
import {
  generateCopilotSuggestion,
  regenerateCopilotSuggestion,
  sendCopilotSuggestion,
  discardCopilotSuggestion,
} from '@/lib/copilot/actions'
import type { QuickAction } from '@/lib/ai/tasks'
import { playNotificationSound, playSaleSound } from '@/lib/utils/notificationSound'
import { formatMessageTime, formatDaySeparator } from '@/lib/utils/relativeTime'
import { ScriptRunPanel, type ActiveRun, type AvailableScript } from '@/components/app/inbox/ScriptRunPanel'
import { MediaPickerDrawer, type SellableMedia } from '@/components/app/inbox/MediaPickerDrawer'

interface Offer {
  status: string
  price: number
}

interface Message {
  id: string
  direction: 'inbound' | 'outbound'
  sender_type: 'fan' | 'human' | 'ai' | 'system'
  senderName: string | null
  text: string
  is_paid: boolean
  price_amount: number | null
  message_type: string
  sent_at: string
  offer?: Offer | null
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

// Owner request: show which team member sent a message, not just the
// generic sender_type — falls back gracefully if the member has since
// been removed from the agency (senderName then null).
function senderLabel(m: Message): string {
  if (m.sender_type === 'human') return m.senderName || 'Équipe'
  if (m.sender_type === 'ai') return 'IA'
  if (m.sender_type === 'fan') return 'Fan'
  return 'Système'
}

// Real statuses only (offers.status check constraint) — never a simulated
// "opened"/"read" state the MYM integration doesn't actually provide (spec
// brief: "ne jamais simuler une donnée que l'intégration ne fournit pas").
const OFFER_STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-white/10 text-[color:var(--foreground-muted)]' },
  sent: { label: 'Envoyée', className: 'bg-[color:var(--warning)]/20 text-[color:var(--warning)]' },
  purchased: { label: 'Achetée', className: 'bg-[color:var(--success)]/20 text-[color:var(--success)]' },
  declined: { label: 'Refusée', className: 'bg-[color:var(--danger)]/20 text-[color:var(--danger)]' },
  expired: { label: 'Sans réponse', className: 'bg-white/10 text-[color:var(--foreground-muted)]' },
  canceled: { label: 'Annulée', className: 'bg-white/10 text-[color:var(--foreground-muted)]' },
  failed: { label: 'Échouée', className: 'bg-[color:var(--danger)]/20 text-[color:var(--danger)]' },
}

// Groups messages into same-sender clusters (tighter spacing, sender label
// only once per cluster — repeating "Équipe" under every bubble is noise,
// not information) with day separators between them, MyFeed-style density.
type ThreadItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message; isClusterStart: boolean; isClusterEnd: boolean }

function buildThread(messages: Message[]): ThreadItem[] {
  const items: ThreadItem[] = []
  let lastDay: string | null = null
  let lastClusterKey: string | null = null

  messages.forEach((m, i) => {
    const day = new Date(m.sent_at).toDateString()
    if (day !== lastDay) {
      items.push({ kind: 'day', key: `day-${m.id}`, label: formatDaySeparator(m.sent_at) })
      lastDay = day
      lastClusterKey = null
    }

    const clusterKey = m.message_type === 'purchase_confirmation' ? null : `${m.sender_type}:${m.senderName ?? ''}`
    const isClusterStart = clusterKey === null || clusterKey !== lastClusterKey
    const next = messages[i + 1]
    const nextClusterKey =
      next && next.message_type !== 'purchase_confirmation' ? `${next.sender_type}:${next.senderName ?? ''}` : null
    const isClusterEnd = clusterKey === null || new Date(next?.sent_at ?? 0).toDateString() !== day || nextClusterKey !== clusterKey

    items.push({ kind: 'message', key: m.id, message: m, isClusterStart, isClusterEnd })
    lastClusterKey = clusterKey
  })

  return items
}

export function ConversationView({
  conversationId,
  initialMessages,
  aiMode,
  pendingSuggestion,
  isMockConversation,
  activeScriptRun,
  availableScripts,
  sellableMedia,
}: {
  conversationId: string
  initialMessages: Message[]
  aiMode: string
  pendingSuggestion: PendingSuggestion | null
  isMockConversation: boolean
  activeScriptRun: ActiveRun | null
  availableScripts: AvailableScript[]
  sellableMedia: SellableMedia[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [reply, setReply] = useState(pendingSuggestion?.suggested_text ?? '')
  const [fanDraft, setFanDraft] = useState('')
  const [showMockPanel, setShowMockPanel] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const isCopilot = aiMode === 'copilot'
  const isFullAi = aiMode === 'full_ai'

  // Optimistic send (Inbox V2 spec §38): the message appears the instant
  // "Envoyer" is clicked, tagged "sending" via its temp- id, instead of
  // waiting for the round trip. React discards the optimistic entry and
  // falls back to initialMessages automatically if the transition throws —
  // the catch below then restores the draft text so nothing typed is lost.
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (state, newMessage: Message) => [...state, newMessage]
  )

  // Only newly-arrived messages get the entrance animation — not the whole
  // history on first open. null on first render means "don't know yet,
  // animate nothing"; populated after that render commits.
  const prevMessageIdsRef = useRef<Set<string> | null>(null)
  const currentMessageIds = new Set(initialMessages.map((m) => m.id))
  const isNewMessage = (id: string) => prevMessageIdsRef.current !== null && !prevMessageIdsRef.current.has(id)
  useEffect(() => {
    prevMessageIdsRef.current = currentMessageIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages])

  useEffect(() => {
    if (pendingSuggestion) setReply(pendingSuggestion.suggested_text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSuggestion?.id])

  // Fan Intelligence / Copilot suggestions / Full AI decisions all finish in
  // the background (no manual click needed) — a fixed-delay guess at when to
  // refresh was unreliable (Full AI's decision task can run longer than any
  // reasonable fixed wait). Realtime reacts to the actual DB change instead:
  // a new message, or the conversation's ai_mode flipping (e.g. Full AI
  // escalating to paused).
  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    // RLS gates messages/conversations by agency membership — the Realtime
    // socket needs the session's access token explicitly set before
    // subscribing, or it can authorize as anon and silently receive nothing
    // (no error, just no events, which is exactly what looked like "not
    // instant" but was actually "not connected").
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            const inserted = payload.new as { direction?: string; message_type?: string } | undefined
            // A sale gets its own, more celebratory sound (brief: distinct
            // from a plain new-message ping) regardless of direction.
            if (inserted?.message_type === 'purchase_confirmation') playSaleSound()
            else if (inserted?.direction === 'inbound') playNotificationSound()
            router.refresh()
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${conversationId}` },
          () => router.refresh()
        )
        .subscribe((status) => console.log('[realtime]', status))
    })

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  const runAction = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  const thread = buildThread(optimisticMessages)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="glass mb-4 min-h-0 flex-1 overflow-y-auto rounded-2xl p-5">
        {/* Short conversations should anchor near the composer, like every
            real chat app — not float at the top with dead space below. */}
        <div className="flex min-h-full flex-col justify-end">
        {initialMessages.length === 0 && (
          <p className="text-center text-sm text-[color:var(--foreground-muted)]">Aucun message pour l&apos;instant.</p>
        )}
        {thread.map((item) => {
          if (item.kind === 'day') {
            return (
              <div key={item.key} className="my-4 flex items-center gap-3 first:mt-0">
                <div className="h-px flex-1 bg-[color:var(--border)]" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--foreground-muted)]">
                  {item.label}
                </span>
                <div className="h-px flex-1 bg-[color:var(--border)]" />
              </div>
            )
          }

          const m = item.message
          const animClass = isNewMessage(m.id) ? 'message-in' : ''

          if (m.message_type === 'purchase_confirmation') {
            return (
              <div key={m.id} className={`my-2 flex justify-center ${animClass}`}>
                <span className="flex items-center gap-1.5 rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-3 py-1 text-xs text-[color:var(--success)]">
                  💸 {m.text} {m.price_amount ? `— ${m.price_amount}€` : ''}
                </span>
              </div>
            )
          }

          const isOutbound = m.direction === 'outbound'
          const isAi = m.sender_type === 'ai'
          const isSending = m.id.startsWith('temp-')
          const clusterMargin = item.isClusterStart ? 'mt-3' : 'mt-0.5'
          const offerStatus = m.offer ? OFFER_STATUS[m.offer.status] : null

          return (
            <div key={m.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} ${clusterMargin} ${animClass}`}>
              <div className={`flex max-w-[75%] flex-col ${isOutbound ? 'items-end' : 'items-start'} ${isSending ? 'opacity-60' : ''}`}>
                {item.isClusterStart && m.sender_type === 'human' && (
                  <span className="mb-1 px-1 text-[10px] font-medium text-[color:var(--foreground-muted)]">{senderLabel(m)}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm transition-shadow ${
                    isOutbound
                      ? isAi
                        ? 'border border-[color:var(--cyan)]/30 bg-[color:var(--cyan)]/10 rounded-br-sm text-[color:var(--foreground)] shadow-[0_4px_16px_rgba(34,211,238,0.12)]'
                        : 'gradient-bg-signature rounded-br-sm text-white shadow-[0_4px_20px_rgba(124,58,237,0.25)]'
                      : 'rounded-bl-sm bg-[color:var(--surface-elevated)]'
                  }`}
                >
                  {isAi && isOutbound && (
                    <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-[color:var(--cyan)]">
                      <Bot className="h-3 w-3" />
                      IA
                    </span>
                  )}
                  {m.is_paid && m.price_amount && (
                    <span className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
                        💰 {m.price_amount}€
                      </span>
                      {offerStatus && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${offerStatus.className}`}>
                          {offerStatus.label}
                        </span>
                      )}
                    </span>
                  )}
                  <p>{m.text}</p>
                </div>
                {item.isClusterEnd && (
                  <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-[color:var(--foreground-muted)]">
                    {m.id.startsWith('temp-') ? (
                      <>
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      formatMessageTime(m.sent_at)
                    )}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Scripts/Médias/Copilot all live in the operational zone around the
          composer (brief §17: "tout ce qui sert directement à construire ou
          envoyer un message") — not tucked away in the right-hand fan panel,
          which is reserved for understanding the fan, not sending to them. */}
      {(activeScriptRun || availableScripts.length > 0) && (
        <div className="mb-2 shrink-0">
          <ScriptRunPanel conversationId={conversationId} activeRun={activeScriptRun} availableScripts={availableScripts} />
        </div>
      )}

      {isCopilot && pendingSuggestion && (
        <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5">
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

      {isFullAi ? (
        <div className="glass mb-2 flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs text-[color:var(--foreground-muted)]">
          <Bot className="h-4 w-4 shrink-0" />
          Mode Full AI actif — l&apos;IA répond automatiquement. Utilisez « Prendre le contrôle » en haut pour écrire vous-même.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!reply.trim()) return
            const text = reply
            setReply('')
            setSendError(null)
            startTransition(async () => {
              addOptimisticMessage({
                id: `temp-${Date.now()}`,
                direction: 'outbound',
                sender_type: 'human',
                senderName: null,
                text,
                is_paid: false,
                price_amount: null,
                message_type: 'text',
                sent_at: new Date().toISOString(),
              })
              try {
                if (isCopilot && pendingSuggestion) {
                  await sendCopilotSuggestion(conversationId, pendingSuggestion.id, text)
                } else {
                  await sendHumanMessage(conversationId, text)
                }
                router.refresh()
              } catch (err) {
                setReply(text)
                setSendError(err instanceof Error ? err.message : "Échec de l'envoi — réessayez")
              }
            })
          }}
          className="mb-2 flex shrink-0 gap-2"
        >
          <MediaPickerDrawer conversationId={conversationId} media={sellableMedia} />
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Écrire une réponse..."
            className="flex-1 rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-2.5 text-sm transition-colors focus:border-[color:var(--violet)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="gradient-bg-signature flex items-center justify-center rounded-xl px-4 shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      )}
      {sendError && <p className="mb-2 shrink-0 text-xs text-[color:var(--danger)]">{sendError}</p>}

      {isCopilot && !pendingSuggestion && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction(() => generateCopilotSuggestion(conversationId))}
          className="mb-4 flex shrink-0 items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Générer une suggestion
        </button>
      )}

      {isMockConversation && (
      <button
        onClick={() => setShowMockPanel((v) => !v)}
        className="mb-2 mt-2 flex shrink-0 items-center gap-1.5 text-xs text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Outils de test (MOCK)
      </button>
      )}

      {isMockConversation && showMockPanel && (
        <div className="glass shrink-0 space-y-3 rounded-2xl p-4">
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
