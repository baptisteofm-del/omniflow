'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import { getMymCredentialsForCreator } from '@/lib/platforms/credentialsActions'

// A full sync (list + per-conversation messages, all serial network calls
// to styx.mym.fans) can run well past Vercel's default Server Action
// timeout for an account with many conversations. A 'use server' file can
// only export async functions, so the higher ceiling is instead declared
// via `maxDuration` on the pages that trigger this action (see
// settings/integrations/page.tsx and creators/[id]/page.tsx) — Next.js
// applies a route's maxDuration to Server Actions invoked from it.
// Requires a Vercel plan that allows it; Hobby caps below this regardless.

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

  const setProgress = (fields: { sync_status?: string; sync_total?: number | null; sync_done?: number | null; sync_current_label?: string | null }) =>
    supabase.from('platform_connections').update(fields).eq('creator_id', creatorId).eq('platform_id', mymPlatform.id)

  let conversationsSynced = 0
  let messagesSynced = 0

  try {
    await setProgress({ sync_status: 'syncing', sync_total: null, sync_done: 0, sync_current_label: null })

    const remoteConversations = await mymAdapter.fetchConversations(credentials)
    await setProgress({ sync_total: remoteConversations.length })

    let processed = 0
    for (const remoteConv of remoteConversations) {
      await setProgress({ sync_done: processed, sync_current_label: remoteConv.fanDisplayName })

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
      if (fanError || !fan) {
        processed += 1
        continue
      }
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
      if (convError || !conversation) {
        processed += 1
        continue
      }
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

      processed += 1
    }

    await setProgress({ sync_status: 'done', sync_done: processed, sync_current_label: null })
    await supabase
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('creator_id', creatorId)
      .eq('platform_id', mymPlatform.id)
  } catch (err) {
    await setProgress({ sync_status: 'error' })
    throw err
  }

  revalidatePath('/inbox')
  return { conversationsSynced, messagesSynced }
}

// Lightweight read the client polls while a sync is in flight (see
// MymConnectionCard) — a separate request from syncMymCreator() itself, so
// it can observe progress rows committed by the still-running sync.
export async function getMymSyncProgress(creatorId: string) {
  const { supabase } = await getAgencyAndUser()

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) return null

  const { data } = await supabase
    .from('platform_connections')
    .select('sync_status, sync_total, sync_done, sync_current_label')
    .eq('creator_id', creatorId)
    .eq('platform_id', mymPlatform.id)
    .maybeSingle()

  return data
}
