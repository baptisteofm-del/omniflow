'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto/encrypt'
import { mymAdapter } from '@/lib/platforms/mymAdapter'
import { loginAndGetToken, type MYMCredentials } from '@/lib/platforms/mym'

// What's actually stored: email/password, not a raw session token. MYM
// session tokens expire; storing the login instead lets every sync/send
// re-derive a fresh token via loginAndGetToken() rather than the connection
// silently going stale until someone re-extracts a token from DevTools.
// Trade-off (see TECH_DEBT.md): storing a password is more sensitive than
// storing a session token — it's still AES-256-GCM encrypted at rest with
// the same key, but a leak has a wider blast radius (the creator may reuse
// that password elsewhere) than a leaked, platform/session-scoped token.
interface MymStoredCredentials {
  email: string
  password: string
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

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  if (!email || !password) throw new Error('Email et mot de passe requis')

  const connectionId = await getOrCreateMymConnection(supabase, agencyId, creatorId)

  let testOk = true
  let testError: string | undefined
  try {
    const bearerToken = await loginAndGetToken(email, password)
    const test = await mymAdapter.testConnection({ bearerToken })
    testOk = test.ok
    testError = test.error
  } catch (err) {
    testOk = false
    testError = err instanceof Error ? err.message : 'Connexion MYM échouée'
  }

  const stored: MymStoredCredentials = { email, password }

  const { error: credError } = await supabase.from('platform_credentials').upsert(
    {
      agency_id: agencyId,
      platform_connection_id: connectionId,
      credentials_encrypted: encrypt(JSON.stringify(stored)),
      last_verified_at: testOk ? new Date().toISOString() : null,
      last_error: testOk ? null : testError,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'platform_connection_id' }
  )
  if (credError) throw new Error(credError.message)

  await supabase
    .from('platform_connections')
    .update({ status: testOk ? 'connected' : 'error', updated_at: new Date().toISOString() })
    .eq('id', connectionId)

  revalidatePath('/settings/integrations')

  if (!testOk) throw new Error(testError || 'Connexion MYM échouée — vérifiez email/mot de passe')
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

// Re-derives a fresh Bearer token on every call (rather than caching one)
// so a sync/send never fails on a silently-expired stored token — the
// trade-off is one extra login request per call, acceptable at this
// manual-trigger, low-frequency usage level.
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
    const stored = JSON.parse(decrypt(cred.credentials_encrypted)) as MymStoredCredentials
    const bearerToken = await loginAndGetToken(stored.email, stored.password)
    return { bearerToken }
  } catch {
    return null
  }
}
