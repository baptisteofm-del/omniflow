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

  return { supabase, agencyId: membership.agency_id as string }
}

// Mock billing provider (spec 22.61: "billing test mode... no real payment
// needed to test flows") — changes the plan/entitlement state immediately,
// exactly like a real provider's webhook would after a successful checkout,
// but without actually charging anything. Real Stripe wiring can replace
// the mock call site later without touching the entitlement model itself.
export async function changePlan(planId: 'copilot' | 'full_ai') {
  const { supabase, agencyId } = await getAgencyAndUser()
  await requirePermission(supabase, agencyId, 'billing.manage')
  if (!['copilot', 'full_ai'].includes(planId)) throw new Error('Offre invalide')

  const { error } = await supabase
    .from('agencies')
    .update({ plan_id: planId, status: 'active', updated_at: new Date().toISOString() })
    .eq('id', agencyId)
  if (error) throw new Error(error.message)

  revalidatePath('/settings/billing')
  revalidatePath('/home')
}
