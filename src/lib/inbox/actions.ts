'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeConversationWithAI } from '@/lib/ai/actions'
import { generateCopilotSuggestion } from '@/lib/copilot/actions'
import { resolveScriptOffer } from '@/lib/scripts/engine'

// Fan Intelligence must stay current without a human clicking "Analyser"
// (owner requirement). Scheduled via after() so it runs once the response
// has been sent — it never adds latency to sending a message. Failures are
// swallowed here: a stale analysis must never block or crash the chat.
function scheduleAnalysis(conversationId: string) {
  after(() => analyzeConversationWithAI(conversationId).catch((err) => {
    console.error(`[fan-intelligence] analysis failed for conversation ${conversationId}:`, err)
  }))
}

function scheduleSuggestion(conversationId: string) {
  after(() => generateCopilotSuggestion(conversationId).catch((err) => {
    console.error(`[copilot] suggestion generation failed for conversation ${conversationId}:`, err)
  }))
}

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

export async function startMockConversation(formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const creatorId = String(formData.get('creator_id') || '')
  const fanName = String(formData.get('fan_name') || '').trim()
  if (!creatorId) throw new Error('Sélectionnez une créatrice')
  if (!fanName) throw new Error('Le nom du fan est requis')

  const { data: mockPlatform, error: platformError } = await supabase
    .from('platforms')
    .select('id')
    .eq('code', 'MOCK')
    .single()
  if (platformError || !mockPlatform) throw new Error('Plateforme Mock introuvable')

  await supabase
    .from('platform_connections')
    .upsert(
      { agency_id: agencyId, creator_id: creatorId, platform_id: mockPlatform.id, status: 'connected' },
      { onConflict: 'creator_id,platform_id' }
    )

  const { data: fan, error: fanError } = await supabase
    .from('fans')
    .insert({ agency_id: agencyId, creator_id: creatorId, platform_id: mockPlatform.id, display_name: fanName })
    .select('id')
    .single()
  if (fanError || !fan) throw new Error(fanError?.message || 'Échec de la création du fan')

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      agency_id: agencyId,
      creator_id: creatorId,
      fan_id: fan.id,
      platform_id: mockPlatform.id,
      ai_mode: 'human_takeover',
    })
    .select('id')
    .single()
  if (convError || !conversation) throw new Error(convError?.message || 'Échec de la création de la conversation')

  redirect(`/inbox/${conversation.id}`)
}

export async function sendHumanMessage(conversationId: string, text: string) {
  const { supabase, agencyId, appUser } = await getAgencyAndUser()
  if (!text.trim()) return

  const { error } = await supabase.from('messages').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    direction: 'outbound',
    sender_type: 'human',
    sender_user_id: appUser.id,
    text: text.trim(),
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
  scheduleAnalysis(conversationId)
}

export async function simulateFanMessage(conversationId: string, text: string) {
  const { supabase, agencyId } = await getAgencyAndUser()
  if (!text.trim()) return

  const { error } = await supabase.from('messages').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    direction: 'inbound',
    sender_type: 'fan',
    text: text.trim(),
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
  scheduleAnalysis(conversationId)

  const { data: conversation } = await supabase.from('conversations').select('ai_mode').eq('id', conversationId).single()
  if (conversation?.ai_mode === 'copilot') {
    scheduleSuggestion(conversationId)
  }
}

export async function setConversationAiMode(conversationId: string, mode: 'human_takeover' | 'copilot') {
  const { supabase } = await getAgencyAndUser()
  if (!['human_takeover', 'copilot'].includes(mode)) throw new Error('Mode invalide')

  const { error } = await supabase
    .from('conversations')
    .update({ ai_mode: mode, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
}

export async function simulatePurchase(conversationId: string, description: string, priceAmount: number) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const { error } = await supabase.from('messages').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    direction: 'inbound',
    sender_type: 'system',
    text: `[MOCK] Achat simulé — ${description || 'Contenu'}`,
    message_type: 'purchase_confirmation',
    is_paid: true,
    price_amount: priceAmount,
  })
  if (error) throw new Error(error.message)

  await resolveScriptOffer(supabase, agencyId, conversationId, 'purchased')

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
  scheduleAnalysis(conversationId)
}

export async function simulateDecline(conversationId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const { error } = await supabase.from('messages').insert({
    agency_id: agencyId,
    conversation_id: conversationId,
    direction: 'inbound',
    sender_type: 'system',
    text: '[MOCK] Refus simulé',
    message_type: 'system',
  })
  if (error) throw new Error(error.message)

  await resolveScriptOffer(supabase, agencyId, conversationId, 'not_purchased')

  revalidatePath(`/inbox/${conversationId}`)
  revalidatePath('/inbox')
  scheduleAnalysis(conversationId)
}
