'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import { getMymCredentialsForCreator } from '@/lib/platforms/credentialsActions'
import { analyzeConversationWithAI } from '@/lib/ai/actions'

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
  // Fan Intelligence (fan_scores/fan_memories) only ever auto-runs from the
  // Mock-conversation send paths (src/lib/inbox/actions.ts) — a synced MYM
  // conversation never triggered it, so real fans never got scored/analyzed.
  // Track which conversations actually received a new message this sync and
  // schedule analysis for exactly those, once, at the end.
  const touchedConversationIds = new Set<string>()
  // Separately: conversations synced *before* the fix above existed have
  // messages but were never analyzed even once, and a re-sync alone won't
  // touch them again (their messages already exist, deduped by
  // external_message_id — nothing "new" to trigger analysis on). Track
  // every conversation this sync actually processed so we can backfill
  // any fan still missing a fan_scores row entirely, once, below.
  const fanIdByConversationId = new Map<string, string>()

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
            avatar_url: remoteConv.fanAvatarUrl ?? null,
            is_subscriber: remoteConv.fanIsSubscriber ?? false,
            is_online: remoteConv.fanIsOnline ?? false,
            last_seen_at: remoteConv.fanLastSeenAt ?? null,
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
        .select('id, last_message_at')
        .single()
      if (convError || !conversation) {
        processed += 1
        continue
      }
      conversationsSynced += 1
      fanIdByConversationId.set(conversation.id as string, fanId)

      // Cheap skip for repeat/background syncs (see syncAllConnectedMymCreators,
      // polled automatically while the Inbox is open): fetchConversations
      // already tells us each conversation's remote last-message time, so a
      // conversation with no new activity since our last sync doesn't need
      // its (expensive, one-request-per-message-history) fetchMessages call
      // at all. This is what makes polling every ~45s viable instead of
      // hammering MYM's API with a full per-conversation refetch every tick.
      const localLastMessageAt = conversation.last_message_at as string | null
      if (
        remoteConv.lastMessageAt &&
        localLastMessageAt &&
        new Date(remoteConv.lastMessageAt).getTime() <= new Date(localLastMessageAt).getTime()
      ) {
        processed += 1
        continue
      }

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
        if (!msgError) {
          messagesSynced += 1
          touchedConversationIds.add(conversation.id as string)
        }
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

  // Backfill: any fan processed this sync that still has zero fan_scores
  // rows never got analyzed at all (pre-dates the fix, or every message
  // was already synced before). Catch those up alongside the "genuinely
  // new message" set above, deduped via the Set.
  if (fanIdByConversationId.size > 0) {
    const allFanIds = [...new Set(fanIdByConversationId.values())]
    const { data: scoredFans } = await supabase.from('fan_scores').select('fan_id').in('fan_id', allFanIds)
    const scoredFanIds = new Set((scoredFans ?? []).map((s) => s.fan_id as string))
    for (const [convId, fanId] of fanIdByConversationId) {
      if (!scoredFanIds.has(fanId)) touchedConversationIds.add(convId)
    }
  }

  // Non-blocking — the sync's own response returns immediately, analysis
  // continues in the background (same after() pattern as inbox/actions.ts).
  // Note: a large first-time backfill can touch many conversations at once,
  // which means many sequential AI calls here — no budget cap yet, same
  // accepted gap already flagged for Copilot/Full AI in TECH_DEBT.md.
  if (touchedConversationIds.size > 0) {
    const ids = [...touchedConversationIds]
    after(async () => {
      for (const convId of ids) {
        try {
          await analyzeConversationWithAI(convId)
        } catch (err) {
          console.error(`[fan-intelligence] analysis failed for synced conversation ${convId}:`, err)
        }
      }
    })
  }

  revalidatePath('/inbox')
  return { conversationsSynced, messagesSynced }
}

// Polled automatically every ~45s while the Inbox is open (see
// InboxAutoSync, mounted in inbox/layout.tsx) — this is the actual fix for
// "messages don't refresh": MYM has no webhook/push API to notify us of new
// activity, so the only way a real fan's message ever reaches OmniFlow is a
// sync like this one running periodically. Sequential per creator (not
// Promise.all) — deliberately not hammering MYM with parallel logins for
// every connected creator at once.
export async function syncAllConnectedMymCreators() {
  const { supabase, agencyId } = await getAgencyAndUser()

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) return { synced: 0 }

  const { data: connections } = await supabase
    .from('platform_connections')
    .select('creator_id')
    .eq('agency_id', agencyId)
    .eq('platform_id', mymPlatform.id)
    .eq('status', 'connected')

  let synced = 0
  for (const conn of connections ?? []) {
    try {
      await syncMymCreator(conn.creator_id as string)
      synced += 1
    } catch (err) {
      // One creator's expired session (or a transient MYM error) shouldn't
      // stop the rest of the agency's connections from syncing — same
      // reasoning as the per-conversation try/catch above.
      console.error(`[mym-autosync] failed for creator ${conn.creator_id}:`, err)
    }
  }
  return { synced }
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
