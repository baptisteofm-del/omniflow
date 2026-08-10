import type { SupabaseClient } from '@supabase/supabase-js'
import { runAiTask } from '@/lib/ai/gateway'
import { buildFullAiDecisionPrompt, FULL_AI_DECISION_PROMPT_VERSION, type FullAiDecisionResult } from '@/lib/ai/tasks'
import { validateReply, validateOffer } from '@/lib/ai/actionValidator'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Full AI's autonomous decision loop for one conversation turn (spec
// 47.90-47.91: REPLY / OFFER / ESCALATE). Scheduled via after() once a fan
// message has been logged, same pattern as Copilot's suggestion generation —
// except this one can execute without a human clicking Send. Every path
// through this function ends in exactly one of: a sent message logged to
// `ai_actions` as executed, or an escalation that pauses the conversation
// for a human (spec 30.108: "never auto-send during human takeover" — the
// mode is re-checked here, not assumed from whoever scheduled this call).
//
// Deliberately no-ops if a Script Run is active on this conversation — the
// Script Engine already owns autonomous sending in that case, and running
// both at once would risk a double-send. Unifying script execution as an
// Action Validator action type (spec 28.33's START_SCRIPT/CONTINUE_SCRIPT)
// is future work, not needed to pass this phase's exit criteria.
export async function runFullAiDecision(supabase: AnySupabaseClient, agencyId: string, conversationId: string) {
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, ai_mode, fan_id, creator_id, fans(display_name)')
    .eq('id', conversationId)
    .single()
  if (!conversation || conversation.ai_mode !== 'full_ai') return

  const { data: activeRun } = await supabase
    .from('script_runs')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('status', 'active')
    .maybeSingle()
  if (activeRun) return

  const fanId = conversation.fan_id as string
  const creatorId = conversation.creator_id as string
  const fan = conversation.fans as unknown as { display_name: string } | null

  const { data: messages } = await supabase
    .from('messages')
    .select('sender_type, text, message_type, price_amount, sent_at')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(30)
  if (!messages || messages.length === 0) return

  const transcript = messages
    .map((m: { sender_type: string; text: string; message_type: string; price_amount: number | null }) => {
      if (m.message_type === 'purchase_confirmation') {
        return `[Achat confirmé${m.price_amount ? ` — ${m.price_amount}€` : ''}]`
      }
      return `${m.sender_type === 'fan' ? 'Fan' : 'Créatrice'}: ${m.text}`
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

  // Only media Full AI is even allowed to whitelist for the model: sellable,
  // already priced, active, and explicitly allowed to be sold standalone
  // (outside a human-authored script) — same filter the script builder uses
  // for its own paid-step picker, plus standalone_allowed.
  const { data: mediaRows } = await supabase
    .from('media_assets')
    .select('id, title, media_type, target_price')
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .eq('is_for_sale', true)
    .eq('standalone_allowed', true)
    .not('minimum_price', 'is', null)

  const { system, user } = buildFullAiDecisionPrompt({
    transcript,
    dna: dna ?? null,
    memories: memories ?? [],
    fanName: fan?.display_name ?? 'Fan',
    availableOffers: mediaRows ?? [],
  })

  let decision: FullAiDecisionResult
  let decisionId: string | null
  try {
    const result = await runAiTask<FullAiDecisionResult>({
      taskType: 'FULL_AI_DECISION',
      promptVersion: FULL_AI_DECISION_PROMPT_VERSION,
      systemPrompt: system,
      userPrompt: user,
      agencyId,
      conversationId,
      fanId,
      creatorId,
    })
    decision = result.data
    decisionId = result.decisionId
  } catch (err) {
    // An AI failure must never leave the conversation silently unattended.
    console.error('[full-ai] decision task failed, escalating:', err)
    await escalate(supabase, agencyId, conversationId, null, null, 'Échec de la tâche IA')
    return
  }

  const confidence = typeof decision.confidence === 'number' ? decision.confidence : 0

  if (decision.action === 'escalate') {
    await escalate(supabase, agencyId, conversationId, decisionId, confidence, decision.reason || 'Escalade demandée par l’IA')
    return
  }

  if (decision.action === 'reply') {
    const text = decision.message?.trim()
    if (!text) {
      await escalate(supabase, agencyId, conversationId, decisionId, confidence, 'Réponse vide générée par l’IA')
      return
    }

    const check = await validateReply(supabase, { agencyId, creatorId, confidence })
    if (!check.ok) {
      await escalate(supabase, agencyId, conversationId, decisionId, confidence, check.reason ?? 'Validation refusée')
      return
    }

    const { data: message } = await supabase
      .from('messages')
      .insert({ agency_id: agencyId, conversation_id: conversationId, direction: 'outbound', sender_type: 'ai', text })
      .select('id')
      .single()

    await supabase.from('ai_actions').insert({
      agency_id: agencyId,
      conversation_id: conversationId,
      ai_decision_id: decisionId,
      action_type: 'send_message',
      status: 'executed',
      confidence,
      message_text: text,
      validator_outcome: 'approved',
      message_id: message?.id ?? null,
    })
    return
  }

  // decision.action === 'offer'
  const text = decision.message?.trim()
  if (!text || !decision.media_asset_id) {
    await escalate(supabase, agencyId, conversationId, decisionId, confidence, 'Offre incomplète générée par l’IA')
    return
  }

  const check = await validateOffer(supabase, { agencyId, creatorId, confidence }, decision.media_asset_id)
  if (!check.ok || !check.media) {
    await escalate(supabase, agencyId, conversationId, decisionId, confidence, check.reason ?? 'Validation refusée')
    return
  }

  const { data: message } = await supabase
    .from('messages')
    .insert({
      agency_id: agencyId,
      conversation_id: conversationId,
      direction: 'outbound',
      sender_type: 'ai',
      text,
      is_paid: true,
      price_amount: check.media.target_price,
      currency: 'EUR',
    })
    .select('id')
    .single()

  await supabase.from('offers').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    fan_id: fanId,
    creator_id: creatorId,
    offer_type: 'out_of_script_media',
    source_type: 'full_ai',
    source_id: decisionId,
    media_asset_id: check.media.id,
    initial_price: check.media.target_price,
    final_price: check.media.target_price,
    minimum_allowed_price: check.media.minimum_price,
    currency: 'EUR',
    status: 'sent',
    ai_decision_id: decisionId,
    sent_message_id: message?.id ?? null,
  })

  await supabase.from('ai_actions').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    ai_decision_id: decisionId,
    action_type: 'send_paid_offer',
    status: 'executed',
    confidence,
    message_text: text,
    media_asset_id: check.media.id,
    price_amount: check.media.target_price,
    validator_outcome: 'approved',
    message_id: message?.id ?? null,
  })
}

async function escalate(
  supabase: AnySupabaseClient,
  agencyId: string,
  conversationId: string,
  decisionId: string | null,
  confidence: number | null,
  reason: string
) {
  // Only flip out of 'full_ai' — if a human already took over (or another
  // escalation already paused it) in the meantime, don't clobber that state
  // (spec 32.23/32.24: race conditions around takeover must never regress).
  await supabase
    .from('conversations')
    .update({ ai_mode: 'paused', updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('ai_mode', 'full_ai')

  await supabase.from('ai_actions').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    ai_decision_id: decisionId,
    action_type: 'escalate',
    status: 'blocked',
    confidence,
    validator_outcome: reason,
  })
}
