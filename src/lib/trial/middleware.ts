/**
 * Trial guard utilities — use in server components and API routes
 */
import { createClient } from '@/lib/supabase/server'

export interface TrialStatus {
  isActive: boolean
  isTrial: boolean
  isExpired: boolean
  daysRemaining: number
  endsAt: string | null
  planId: string
  subscriptionStatus: string
}

export async function getTrialStatus(agencyId?: string): Promise<TrialStatus | null> {
  const supabase = await createClient()

  let query = supabase.from('agencies').select('plan_id, subscription_status, trial_ends_at')

  if (agencyId) {
    query = query.eq('id', agencyId)
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    query = query.eq('owner_id', user.id)
  }

  const { data: agency } = await query.single()
  if (!agency) return null

  const now = new Date()
  const trialEndsAt = agency.trial_ends_at ? new Date(agency.trial_ends_at) : null
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const isTrial = agency.subscription_status === 'trialing'
  const isExpired = isTrial && (!trialEndsAt || trialEndsAt < now)

  return {
    isActive: !isExpired && (agency.subscription_status === 'active' || (isTrial && !isExpired)),
    isTrial,
    isExpired,
    daysRemaining,
    endsAt: agency.trial_ends_at || null,
    planId: agency.plan_id || 'trial',
    subscriptionStatus: agency.subscription_status || 'trialing',
  }
}
