'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions/check'

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

// Full AI Activation (spec 24.73, condensed): an agency must explicitly turn
// this on per creator before any conversation for that creator can even be
// switched to full_ai mode (checked again in setConversationAiMode).
export async function setCreatorFullAiEnabled(creatorId: string, enabled: boolean) {
  const { supabase, agencyId } = await getAgencyAndUser()
  await requirePermission(supabase, agencyId, 'ai_settings.manage')

  const { error } = await supabase
    .from('creator_commercial_settings')
    .update({ full_ai_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('creator_id', creatorId)
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

// Owner request: the per-conversation mode dropdown forced a manual pick
// for every fan — this is the one place it's chosen instead, once, per
// creator. Every new conversation of hers starts here (see the
// before_conversation_insert_set_ai_mode trigger, 0026); an existing
// conversation is never touched by changing this.
export async function setCreatorDefaultAiMode(creatorId: string, mode: 'human_takeover' | 'copilot' | 'full_ai') {
  const { supabase, agencyId } = await getAgencyAndUser()
  await requirePermission(supabase, agencyId, 'ai_settings.manage')

  if (!['human_takeover', 'copilot', 'full_ai'].includes(mode)) throw new Error('Mode invalide')

  if (mode === 'full_ai') {
    const { data: settings } = await supabase
      .from('creator_commercial_settings')
      .select('full_ai_enabled')
      .eq('creator_id', creatorId)
      .maybeSingle()
    if (!settings?.full_ai_enabled) throw new Error("Activez d'abord Full AI pour cette créatrice ci-dessous.")
  }

  const { error } = await supabase
    .from('creator_commercial_settings')
    .update({ default_ai_mode: mode, updated_at: new Date().toISOString() })
    .eq('creator_id', creatorId)
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

export async function createKillSwitch(formData: FormData) {
  const { supabase, agencyId, appUser } = await getAgencyAndUser()
  await requirePermission(supabase, agencyId, 'ai_settings.manage')

  const scope = String(formData.get('scope') || '')
  const creatorId = String(formData.get('creator_id') || '') || null
  const actionType = String(formData.get('action_type') || '') || null
  const reason = String(formData.get('reason') || '').trim() || null

  if (!['agency', 'creator', 'action_type'].includes(scope)) throw new Error('Portée invalide')
  if (scope === 'creator' && !creatorId) throw new Error('Créatrice requise pour cette portée')
  if (scope === 'action_type' && !actionType) throw new Error("Type d'action requis pour cette portée")

  const { error } = await supabase.from('ai_kill_switches').insert({
    agency_id: agencyId,
    scope,
    creator_id: scope === 'creator' ? creatorId : null,
    action_type: scope === 'action_type' ? actionType : null,
    reason,
    created_by: appUser.id,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

export async function deleteKillSwitch(id: string) {
  const { supabase, agencyId } = await getAgencyAndUser()
  await requirePermission(supabase, agencyId, 'ai_settings.manage')

  const { error } = await supabase.from('ai_kill_switches').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}
