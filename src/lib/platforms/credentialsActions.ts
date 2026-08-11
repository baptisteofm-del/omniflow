'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto/encrypt'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import type { MYMCredentials } from '@/lib/platforms/mym'

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

async function getOrCreateMymConnection(supabase: Awaited<ReturnType<typeof createClient>>, agencyId: string, creatorId: string) {
  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) throw new Error('Plateforme MYM introuvable — appliquez 0019_mym_real_connector.sql')

  const { data: existing } = await supabase
    .from('platform_connections')
    .select('id')
    .eq('creator_id', creatorId)
    .eq('platform_id', mymPlatform.id)
    .maybeSingle()
  if (existing) return existing.id as string

  const { data: created, error } = await supabase
    .from('platform_connections')
    .insert({ agency_id: agencyId, creator_id: creatorId, platform_id: mymPlatform.id, status: 'disconnected' })
    .select('id')
    .single()
  if (error || !created) throw new Error(error?.message || 'Échec de création de la connexion MYM')
  return created.id as string
}

// Real credentials never round-trip to the client after this — they're
// encrypted (same AES-256-GCM helper the old product already depends on in
// production) and only ever decrypted server-side inside a Server Action.
export async function connectMymCreator(creatorId: string, formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const bearerToken = String(formData.get('bearer_token') || '').trim()
  if (!bearerToken) throw new Error('Token requis')

  const credentials: MYMCredentials = { bearerToken }

  const test = await mymAdapter.testConnection(credentials)

  const connectionId = await getOrCreateMymConnection(supabase, agencyId, creatorId)

  const { error: credError } = await supabase.from('platform_credentials').upsert(
    {
      agency_id: agencyId,
      platform_connection_id: connectionId,
      credentials_encrypted: encrypt(JSON.stringify(credentials)),
      last_verified_at: test.ok ? new Date().toISOString() : null,
      last_error: test.ok ? null : test.error,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'platform_connection_id' }
  )
  if (credError) throw new Error(credError.message)

  await supabase
    .from('platform_connections')
    .update({ status: test.ok ? 'connected' : 'error', updated_at: new Date().toISOString() })
    .eq('id', connectionId)

  revalidatePath('/settings/integrations')

  if (!test.ok) throw new Error(test.error || 'Connexion MYM échouée — vérifiez le token')
}

export async function disconnectMymCreator(creatorId: string) {
  const { supabase } = await getAgencyAndUser()

  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) return

  await supabase
    .from('platform_connections')
    .update({ status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('creator_id', creatorId)
    .eq('platform_id', mymPlatform.id)

  // Credentials row is left in place (so reconnecting doesn't require
  // re-entering the token) but the connection is marked disconnected —
  // nothing reads credentials for a disconnected connection.
  revalidatePath('/settings/integrations')
}

export async function getMymCredentialsForCreator(
  supabase: Awaited<ReturnType<typeof createClient>>,
  creatorId: string
): Promise<MYMCredentials | null> {
  const { data: mymPlatform } = await supabase.from('platforms').select('id').eq('code', 'MYM').single()
  if (!mymPlatform) return null

  const { data: connection } = await supabase
    .from('platform_connections')
    .select('id, status')
    .eq('creator_id', creatorId)
    .eq('platform_id', mymPlatform.id)
    .maybeSingle()
  if (!connection || connection.status !== 'connected') return null

  const { data: cred } = await supabase
    .from('platform_credentials')
    .select('credentials_encrypted')
    .eq('platform_connection_id', connection.id)
    .maybeSingle()
  if (!cred) return null

  try {
    return JSON.parse(decrypt(cred.credentials_encrypted)) as MYMCredentials
  } catch {
    return null
  }
}
