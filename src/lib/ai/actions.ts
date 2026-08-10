'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { runAiTask } from '@/lib/ai/gateway'
import {
  buildMemoryExtractionPrompt,
  buildFanScoringPrompt,
  MEMORY_EXTRACTION_PROMPT_VERSION,
  FAN_SCORING_PROMPT_VERSION,
  type MemoryExtractionResult,
  type FanScoringResult,
} from '@/lib/ai/tasks'

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

// Memory Write Gate (spec 8.19), simplified for this vertical slice:
// - drop low-confidence candidates
// - merge into an existing active memory of the same category+label instead
//   of duplicating (spec 8.16: don't create identical memories that could
//   be merged; spec 8.17: recent explicit info supersedes older memory)
const MIN_MEMORY_CONFIDENCE = 0.5

export async function analyzeConversationWithAI(conversationId: string) {
  const { supabase, appUser, agencyId } = await getAgencyAndUser()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, fan_id, creator_id, fans(display_name)')
    .eq('id', conversationId)
    .single()
  if (!conversation) throw new Error('Conversation introuvable')

  const fan = conversation.fans as unknown as { display_name: string } | null
  const fanId = conversation.fan_id as string

  const { data: messages } = await supabase
    .from('messages')
    .select('sender_type, text, message_type, price_amount, sent_at')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(50)

  if (!messages || messages.length === 0) {
    throw new Error("Aucun message dans cette conversation à analyser")
  }

  const transcript = messages
    .map((m) => {
      if (m.message_type === 'purchase_confirmation') {
        return `[Achat confirmé${m.price_amount ? ` — ${m.price_amount}€` : ''}]`
      }
      const speaker = m.sender_type === 'fan' ? 'Fan' : 'Créatrice'
      return `${speaker}: ${m.text}`
    })
    .join('\n')

  const { data: existingMemories } = await supabase
    .from('fan_memories')
    .select('category, label, value')
    .eq('fan_id', fanId)
    .eq('status', 'active')

  const { system: memSystem, user: memUser } = buildMemoryExtractionPrompt(transcript, existingMemories ?? [])

  const { data: memoryResult } = await runAiTask<MemoryExtractionResult>({
    taskType: 'MEMORY_EXTRACTION',
    promptVersion: MEMORY_EXTRACTION_PROMPT_VERSION,
    systemPrompt: memSystem,
    userPrompt: memUser,
    agencyId,
    conversationId,
    fanId,
    creatorId: conversation.creator_id as string,
  })

  for (const candidate of memoryResult.memories) {
    if (candidate.confidence < MIN_MEMORY_CONFIDENCE) continue
    if (!candidate.label?.trim() || !candidate.value?.trim()) continue

    const { data: existing } = await supabase
      .from('fan_memories')
      .select('id, value')
      .eq('fan_id', fanId)
      .eq('status', 'active')
      .eq('category', candidate.category)
      .ilike('label', candidate.label.trim())
      .maybeSingle()

    if (existing) {
      await supabase
        .from('fan_memories')
        .update({
          value: candidate.value.trim(),
          confidence: candidate.confidence,
          importance: candidate.importance,
          last_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('fan_memories').insert({
        agency_id: agencyId,
        fan_id: fanId,
        category: candidate.category,
        label: candidate.label.trim(),
        value: candidate.value.trim(),
        confidence: candidate.confidence,
        importance: candidate.importance,
        source: 'ai',
        created_by: appUser.id,
      })
    }
  }

  const { system: scoreSystem, user: scoreUser } = buildFanScoringPrompt(transcript, fan?.display_name ?? 'Fan')

  const { data: scoringResult } = await runAiTask<FanScoringResult>({
    taskType: 'FAN_SCORING',
    promptVersion: FAN_SCORING_PROMPT_VERSION,
    systemPrompt: scoreSystem,
    userPrompt: scoreUser,
    agencyId,
    conversationId,
    fanId,
    creatorId: conversation.creator_id as string,
  })

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)))

  const { data: existingScore } = await supabase.from('fan_scores').select('version').eq('fan_id', fanId).maybeSingle()

  await supabase.from('fan_scores').upsert(
    {
      agency_id: agencyId,
      fan_id: fanId,
      purchase_intent: clamp(scoringResult.purchase_intent),
      relationship_score: clamp(scoringResult.relationship_score),
      spending_potential: clamp(scoringResult.spending_potential),
      engagement_score: clamp(scoringResult.engagement_score),
      churn_risk: clamp(scoringResult.churn_risk),
      reasons: scoringResult.reasons?.trim() || null,
      computed_by: 'system',
      version: (existingScore?.version || 0) + 1,
      updated_by: appUser.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'fan_id' }
  )

  revalidatePath(`/inbox/${conversationId}`)
}
