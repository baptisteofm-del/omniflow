'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { runAiTask } from '@/lib/ai/gateway'
import {
  buildResponseGenerationPrompt,
  RESPONSE_GENERATION_PROMPT_VERSION,
  type ResponseGenerationResult,
  type QuickAction,
} from '@/lib/ai/tasks'
import { levenshtein } from '@/lib/utils/levenshtein'
import { deliverOutboundMessage } from '@/lib/platforms/deliver'

async function getAgencyAndUser() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser!.id)
    .single()
  if (!appUser) throw new Error('Utilisateur introuvable')

  const { data: membership } = await supabase
    .from('agency_memberships')
    .select('agency_id')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (!membership) throw new Error('Aucune agence active pour cet utilisateur')

  return { supabase, appUser, agencyId: membership.agency_id as string }
}

async function createSuggestion(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  agencyId: string,
  conversationId: string,
  quickAction?: QuickAction
) {
  const { data: conversation } = await supabase
    .from('conversations')
    .select('fan_id, creator_id, fans(display_name)')
    .eq('id', conversationId)
    .single()
  if (!conversation) throw new Error('Conversation introuvable')

  const fanId = conversation.fan_id as string
  const creatorId = conversation.creator_id as string
  const fan = conversation.fans as unknown as { display_name: string } | null

  const { data: messages } = await supabase
    .from('messages')
    .select('sender_type, text, message_type, price_amount, sent_at')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(30)
  if (!messages || messages.length === 0) throw new Error('Aucun message à répondre')

  const transcript = messages
    .map((m) => {
      if (m.message_type === 'purchase_confirmation') {
        return `[Achat confirmé${m.price_amount ? ` — ${m.price_amount}€` : ''}]`
      }
      const speaker = m.sender_type === 'fan' ? 'Fan' : 'Créatrice'
      return `${speaker}: ${m.text}`
    })
    .join('\n')

  const { data: dna } = await supabase
    .from('creator_ai_profiles')
    .select('warmth, flirt_intensity, directness, sales_aggressiveness, message_length, emoji_style, tone, persona_description')
    .eq('creator_id', creatorId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: memories } = await supabase
    .from('fan_memories')
    .select('category, label, value')
    .eq('fan_id', fanId)
    .eq('status', 'active')
    .order('importance', { ascending: false })
    .limit(8)

  const { system, user } = buildResponseGenerationPrompt({
    transcript,
    dna: dna ?? null,
    memories: memories ?? [],
    fanName: fan?.display_name ?? 'Fan',
    quickAction,
  })

  const { data: result, decisionId } = await runAiTask<ResponseGenerationResult>({
    taskType: 'RESPONSE_GENERATION',
    promptVersion: RESPONSE_GENERATION_PROMPT_VERSION,
    systemPrompt: system,
    userPrompt: user,
    agencyId,
    conversationId,
    fanId,
    creatorId,
  })

  const { error } = await supabase.from('copilot_suggestions').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    ai_decision_id: decisionId,
    suggested_text: result.message.trim(),
    status: 'pending',
  })
  if (error) throw new Error(error.message)
}

export async function generateCopilotSuggestion(conversationId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()
  await createSuggestion(supabase, agencyId, conversationId)
  revalidatePath(`/inbox/${conversationId}`)
}

export async function regenerateCopilotSuggestion(
  conversationId: string,
  suggestionId: string,
  quickAction?: QuickAction
) {
  const { supabase, agencyId, appUser } = await getAgencyAndUser()

  await supabase
    .from('copilot_suggestions')
    .update({ status: 'discarded', resolved_by: appUser.id, resolved_at: new Date().toISOString() })
    .eq('id', suggestionId)

  await createSuggestion(supabase, agencyId, conversationId, quickAction)
  revalidatePath(`/inbox/${conversationId}`)
}

export async function sendCopilotSuggestion(conversationId: string, suggestionId: string, finalText: string) {
  const { supabase, agencyId, appUser } = await getAgencyAndUser()

  const trimmed = finalText.trim()
  if (!trimmed) throw new Error('Message vide')

  const { data: suggestion } = await supabase
    .from('copilot_suggestions')
    .select('suggested_text')
    .eq('id', suggestionId)
    .single()
  if (!suggestion) throw new Error('Suggestion introuvable')

  const delivery = await deliverOutboundMessage(supabase, conversationId, trimmed)

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      agency_id: agencyId,
      conversation_id: conversationId,
      direction: 'outbound',
      sender_type: 'human',
      sender_user_id: appUser.id,
      text: trimmed,
      external_message_id: delivery.externalMessageId,
    })
    .select('id')
    .single()
  if (error || !message) throw new Error(error?.message || "Échec de l'envoi")

  const suggestedTrimmed = suggestion.suggested_text.trim()
  const wasEdited = trimmed !== suggestedTrimmed

  await supabase
    .from('copilot_suggestions')
    .update({
      final_text: trimmed,
      edit_distance: wasEdited ? levenshtein(suggestedTrimmed, trimmed) : 0,
      status: wasEdited ? 'edited_sent' : 'sent',
      message_id: message.id,
      resolved_by: appUser.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', suggestionId)

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
}

export async function discardCopilotSuggestion(conversationId: string, suggestionId: string) {
  const { supabase, appUser } = await getAgencyAndUser()

  await supabase
    .from('copilot_suggestions')
    .update({ status: 'discarded', resolved_by: appUser.id, resolved_at: new Date().toISOString() })
    .eq('id', suggestionId)

  revalidatePath(`/inbox/${conversationId}`)
}
