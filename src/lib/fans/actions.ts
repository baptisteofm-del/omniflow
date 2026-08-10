'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

const MEMORY_CATEGORIES = [
  'profile',
  'relationship',
  'preference',
  'commercial',
  'conversation',
  'temporal',
  'boundary',
] as const

export async function addFanMemory(conversationId: string, formData: FormData) {
  const { supabase, appUser, agencyId } = await getAgencyAndUser()

  const fanId = String(formData.get('fan_id') || '')
  const category = String(formData.get('category') || '')
  const label = String(formData.get('label') || '').trim()
  const value = String(formData.get('value') || '').trim()
  const importanceRaw = String(formData.get('importance') || '0.5')

  if (!fanId) throw new Error('Fan manquant')
  if (!MEMORY_CATEGORIES.includes(category as (typeof MEMORY_CATEGORIES)[number])) {
    throw new Error('Catégorie de mémoire invalide')
  }
  if (!label || !value) throw new Error('Label et valeur requis')

  const importance = Math.min(1, Math.max(0, Number(importanceRaw) || 0.5))

  const { error } = await supabase.from('fan_memories').insert({
    agency_id: agencyId,
    fan_id: fanId,
    category,
    label,
    value,
    importance,
    source: 'human',
    created_by: appUser.id,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
}

export async function deleteFanMemory(conversationId: string, memoryId: string) {
  const { supabase } = await getAgencyAndUser()

  const { error } = await supabase.from('fan_memories').update({ status: 'deleted' }).eq('id', memoryId)
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
}

export async function confirmFanMemory(conversationId: string, memoryId: string) {
  const { supabase } = await getAgencyAndUser()

  const { error } = await supabase
    .from('fan_memories')
    .update({ last_confirmed_at: new Date().toISOString() })
    .eq('id', memoryId)
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
}

export async function upsertFanScores(conversationId: string, formData: FormData) {
  const { supabase, appUser, agencyId } = await getAgencyAndUser()

  const fanId = String(formData.get('fan_id') || '')
  if (!fanId) throw new Error('Fan manquant')

  const clamp = (v: FormDataEntryValue | null) => Math.min(100, Math.max(0, Number(v) || 0))

  const { data: existing } = await supabase.from('fan_scores').select('version').eq('fan_id', fanId).maybeSingle()

  const { error } = await supabase.from('fan_scores').upsert(
    {
      agency_id: agencyId,
      fan_id: fanId,
      purchase_intent: clamp(formData.get('purchase_intent')),
      relationship_score: clamp(formData.get('relationship_score')),
      spending_potential: clamp(formData.get('spending_potential')),
      engagement_score: clamp(formData.get('engagement_score')),
      churn_risk: clamp(formData.get('churn_risk')),
      reasons: String(formData.get('reasons') || '').trim() || null,
      computed_by: 'human',
      version: (existing?.version || 0) + 1,
      updated_by: appUser.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'fan_id' }
  )
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
}
