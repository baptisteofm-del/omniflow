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

  // Shown separately (not just buried in the transcript) so the model can't
  // miss it — owner reported consecutive replies reading as the same
  // template despite a general anti-repetition instruction.
  const recentOwnMessages = messages
    .filter((m: { sender_type: string }) => m.sender_type === 'ai')
    .slice(-3)
    .map((m: { text: string }) => m.text)

  const { system, user } = buildFullAiDecisionPrompt({
    transcript,
    dna: dna ?? null,
    memories: memories ?? [],
    fanName: fan?.display_name ?? 'Fan',
    availableOffers: mediaRows ?? [],
    recentOwnMessages,
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
    // An AI failure must never leave the conversation silently unattended —
    // but the escalation reason must carry the real error, not a generic
    // label, or a real failure becomes undiagnosable from ai_actions alone.
    const message = err instanceof Error ? err.message : 'Erreur IA inconnue'
    console.error('[full-ai] decision task failed, escalating:', err)
    await escalate(supabase, agencyId, conversationId, null, null, `Échec de la tâche IA : ${message}`)
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

    // Occasionally the model splits a reply into 2-3 short consecutive
    // messages (owner requested this — reads more like real texting than
    // one long block every time) using a "---" line as the separator.
    const segments = text
      .split(/\n?-{3,}\n?/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)

    let firstMessageId: string | null = null
    for (const segment of segments) {
      const { data: message } = await supabase
        .from('messages')
        .insert({ agency_id: agencyId, conversation_id: conversationId, direction: 'outbound', sender_type: 'ai', text: segment })
        .select('id')
        .single()
      if (!firstMessageId) firstMessageId = message?.id ?? null
    }

    await supabase.from('ai_actions').insert({
      agency_id: agencyId,
      conversation_id: conversationId,
      ai_decision_id: decisionId,
      action_type: 'send_message',
      status: 'executed',
      confidence,
      message_text: text,
      validator_outcome: 'approved',
      message_id: firstMessageId,
    })
    return
  }

  if (decision.action === 'no_offer_available') {
    // Owner's explicit product requirement: Full AI never leaves a fan with
    // no reply just because the agency hasn't configured anything to sell —
    // that's a setup gap, not a trust/safety concern, so it must not pause
    // the conversation waiting for a human like a real escalate() does. The
    // AI deflects in character and keeps going; the agency gets a
    // "missed opportunity" notification instead so they fix their catalog.
    const text = decision.message?.trim()
    if (!text) {
      await escalate(supabase, agencyId, conversationId, decisionId, confidence, 'Esquive vide générée par l’IA')
      return
    }

    const check = await validateReply(supabase, { agencyId, creatorId, confidence })
    if (!check.ok) {
      // Even the deflection must respect a kill switch — if send_message
      // itself is killed, this still has to go through the human path.
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
      action_type: 'missed_opportunity',
      status: 'executed',
      confidence,
      message_text: text,
      validator_outcome: decision.reason || 'Aucune offre disponible',
      message_id: message?.id ?? null,
    })

    await notifyAgency(
      supabase,
      agencyId,
      'missed_opportunity',
      'Vente ratée — aucun contenu disponible',
      `Un fan était prêt à acheter mais aucun média vendable n'était configuré pour cette créatrice. L'IA a temporisé pour ne pas laisser le fan sans réponse — ajoutez un média tarifé pour ne plus manquer ces ventes.${decision.reason ? ` (${decision.reason})` : ''}`,
      conversationId
    )
    return
  }

  if (decision.action === 'offer') {
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
}

async function notifyAgency(
  supabase: AnySupabaseClient,
  agencyId: string,
  type: 'escalation' | 'missed_opportunity',
  title: string,
  body: string,
  conversationId: string
) {
  await supabase.from('agency_notifications').insert({
    agency_id: agencyId,
    type,
    title,
    body,
    conversation_id: conversationId,
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

  await notifyAgency(
    supabase,
    agencyId,
    'escalation',
    'Full AI a besoin d’un humain',
    reason,
    conversationId
  )
}
