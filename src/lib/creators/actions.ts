'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCreator(formData: FormData) {
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

  const agencyId = membership.agency_id as string

  const displayName = String(formData.get('display_name') || '').trim()
  const defaultLanguage = String(formData.get('default_language') || 'fr')
  if (!displayName) throw new Error('Le nom de la créatrice est requis')

  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .insert({
      agency_id: agencyId,
      display_name: displayName,
      default_language: defaultLanguage,
      status: 'ready',
    })
    .select('id')
    .single()
  if (creatorError || !creator) throw new Error(creatorError?.message || 'Échec de la création de la créatrice')

  const numeric = (key: string, fallback: number) => {
    const raw = formData.get(key)
    const n = raw != null ? Number(raw) : NaN
    return Number.isFinite(n) ? n : fallback
  }

  const { error: dnaError } = await supabase.from('creator_ai_profiles').insert({
    agency_id: agencyId,
    creator_id: creator.id,
    status: 'published',
    published_at: new Date().toISOString(),
    warmth: numeric('warmth', 50),
    flirt_intensity: numeric('flirt_intensity', 50),
    directness: numeric('directness', 50),
    sales_aggressiveness: numeric('sales_aggressiveness', 50),
    message_length: String(formData.get('message_length') || 'medium'),
    emoji_style: String(formData.get('emoji_style') || 'medium'),
  })
  if (dnaError) throw new Error(dnaError.message)

  const { error: commercialError } = await supabase.from('creator_commercial_settings').insert({
    agency_id: agencyId,
    creator_id: creator.id,
    negotiation_enabled: formData.get('negotiation_enabled') === 'on',
    max_discount_percent: numeric('max_discount_percent', 0),
    custom_content_enabled: formData.get('custom_content_enabled') === 'on',
    live_session_enabled: formData.get('live_session_enabled') === 'on',
  })
  if (commercialError) throw new Error(commercialError.message)

  redirect('/creators')
}
