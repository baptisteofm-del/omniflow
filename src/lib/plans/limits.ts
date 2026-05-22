/**
 * Server-side limit enforcement
 * Call checkLimit() in API routes before creating resources.
 */
import { createClient } from '@/lib/supabase/server'
import { getPlanById } from '@/lib/plans'

export type LimitKey = 'models' | 'postSchedules' | 'telegramBots' | 'aiGenerations' | 'teamMembers'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  planId: string
  upgradeRequired?: string  // plan id needed to unlock
}

export async function checkLimit(agencyId: string, key: LimitKey): Promise<LimitCheckResult> {
  const supabase = await createClient()

  // Get agency plan
  const { data: agency } = await supabase
    .from('agencies')
    .select('plan_id')
    .eq('id', agencyId)
    .single()

  const planId = agency?.plan_id || 'starter'
  const plan = getPlanById(planId)
  const limit = plan?.limits[key as keyof typeof plan.limits] ?? 0

  // -1 = unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, planId }
  }

  // Count current usage
  let current = 0
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  if (key === 'models') {
    const { count } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
    current = count || 0
  } else if (key === 'postSchedules') {
    const { count } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .gte('created_at', monthStart.toISOString())
    current = count || 0
  } else if (key === 'telegramBots') {
    const { count } = await supabase
      .from('telegram_bots')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
    current = count || 0
  } else if (key === 'aiGenerations') {
    const { count } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .gte('created_at', monthStart.toISOString())
    current = count || 0
  } else if (key === 'teamMembers') {
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
    current = count || 0
  }

  const allowed = current < limit
  const upgradeRequired = !allowed
    ? (planId === 'starter' ? 'pro' : planId === 'pro' ? 'agency' : undefined)
    : undefined

  return { allowed, current, limit, planId, upgradeRequired }
}

export function limitReachedResponse(result: LimitCheckResult, feature: string) {
  // Use in API routes: return limitReachedResponse(...)
  return {
    error: 'limit_reached',
    feature,
    current: result.current,
    limit: result.limit,
    plan: result.planId,
    upgrade_to: result.upgradeRequired,
    message: `Limite atteinte (${result.current}/${result.limit}). Passez au plan ${result.upgradeRequired === 'pro' ? 'Pro' : 'Agency'} pour continuer.`,
  }
}
