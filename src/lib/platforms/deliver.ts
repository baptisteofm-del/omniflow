import type { SupabaseClient } from '@supabase/supabase-js'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import { getMymCredentialsForCreator } from '@/lib/platforms/credentialsActions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// The single place every outbound-send path (human reply, Copilot, Script
// Engine, Full AI) routes through before writing to our own `messages`
// table — exactly the dispatcher TECH_DEBT.md flagged as the next step
// once read-sync was confirmed working: "checks the conversation's
// platform, calls the adapter's sendMessage() when it's a real platform...
// rather than duplicating platform-dispatch logic 4 times."
//
// MUST be called and awaited BEFORE the local `messages` insert at every
// call site. A failed real send must never be recorded locally as if it
// succeeded — the chatter or the AI would believe the fan received
// something they never did. Mock conversations no-op (nothing external to
// reach), preserving exactly the old all-local behavior.
export async function deliverOutboundMessage(
  supabase: AnySupabaseClient,
  conversationId: string,
  text: string
): Promise<{ externalMessageId: string | null }> {
  const { data: conversation } = await supabase
    .from('conversations')
    .select('creator_id, external_conversation_id, platforms(code)')
    .eq('id', conversationId)
    .single()

  const platformCode = (conversation?.platforms as unknown as { code: string } | null)?.code

  if (!platformCode || platformCode === 'MOCK') return { externalMessageId: null }

  if (platformCode === 'MYM') {
    const credentials = await getMymCredentialsForCreator(supabase, conversation!.creator_id as string)
    if (!credentials) throw new Error("MYM non connecté pour cette créatrice — message non envoyé, rien n'a été enregistré")
    if (!conversation!.external_conversation_id) {
      throw new Error("Conversation MYM sans identifiant externe — message non envoyé, rien n'a été enregistré")
    }
    const result = await mymAdapter.sendMessage(credentials, conversation!.external_conversation_id as string, text)
    return { externalMessageId: result.externalMessageId ?? null }
  }

  // OnlyFans doesn't have an adapter yet (queued behind MYM) — fail loudly
  // rather than silently pretending a send happened, per this project's
  // "no hidden shortcuts" rule.
  throw new Error(`Plateforme ${platformCode} non supportée pour l'envoi réel`)
}
