'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import { getMymCredentialsForCreator } from '@/lib/platforms/credentialsActions'

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

  return { supabase, agencyId: membership.agency_id as string }
}

// Progressive Integration (spec 47.115): this covers "Read conversations"
// and "Receive updates" — a manual pull for now (no background scheduler
// exists yet, same constraint already documented for Script delays and
// Full AI, see TECH_DEBT.md). Idempotent: relies on the unique
// (creator_id, external_conversation_id) / (conversation_id,
// external_message_id) indexes from 0019 to upsert rather than duplicate on
// repeated syncs.
export async function syncMymCreator(creatorId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const credentials = await getMymCredentialsForCreator(supabase, creatorId)
  if (!credentials) throw new Error('MYM non connecté pour cette créatrice')

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) throw new Error('Plateforme MYM introuvable')

  let conversationsSynced = 0
  let messagesSynced = 0

  const remoteConversations = await mymAdapter.fetchConversations(credentials)

  for (const remoteConv of remoteConversations) {
    const { data: fan, error: fanError } = await supabase
      .from('fans')
      .upsert(
        {
          agency_id: agencyId,
          creator_id: creatorId,
          platform_id: mymPlatform.id,
          external_fan_id: remoteConv.externalFanId,
          display_name: remoteConv.fanDisplayName,
        },
        { onConflict: 'creator_id,platform_id,external_fan_id' }
      )
      .select('id')
      .single()
    if (fanError || !fan) continue
    const fanId = fan.id as string

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .upsert(
        {
          agency_id: agencyId,
          creator_id: creatorId,
          fan_id: fanId,
          platform_id: mymPlatform.id,
          external_conversation_id: remoteConv.externalConversationId,
        },
        { onConflict: 'creator_id,external_conversation_id' }
      )
      .select('id')
      .single()
    if (convError || !conversation) continue
    conversationsSynced += 1

    const remoteMessages = await mymAdapter.fetchMessages(credentials, remoteConv.externalConversationId)
    for (const remoteMessage of remoteMessages) {
      const { data: existingMessage } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversation.id)
        .eq('external_message_id', remoteMessage.externalMessageId)
        .maybeSingle()
      if (existingMessage) continue

      const { error: msgError } = await supabase.from('messages').insert({
        agency_id: agencyId,
        conversation_id: conversation.id,
        direction: remoteMessage.direction,
        sender_type: remoteMessage.direction === 'inbound' ? 'fan' : 'human',
        text: remoteMessage.text,
        external_message_id: remoteMessage.externalMessageId,
        sent_at: remoteMessage.sentAt,
      })
      if (!msgError) messagesSynced += 1
    }
  }

  await supabase
    .from('platform_connections')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('creator_id', creatorId)
    .eq('platform_id', mymPlatform.id)

  revalidatePath('/inbox')
  return { conversationsSynced, messagesSynced }
}
