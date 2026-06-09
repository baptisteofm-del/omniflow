/**
 * Server-side limit enforcement
 * Call checkLimit() in API routes before creating resources.
 * 
 * Coûts estimés par fonctionnalité:
 * - Chatting IA (Claude Haiku uniquement): ~0.004€/msg
 * - Générations vidéo Kling: ~0.20€/génération
 * - Trend run (veille/scraping): ~0.03€/run
 */
import { createClient } from '@/lib/supabase/server'
import { getPlanById } from '@/lib/plans'

export type LimitKey =
  | 'models'
  | 'postSchedules'
  | 'telegramBots'
  | 'aiGenerations'
  | 'teamMembers'
  | 'chattingMessages'
  | 'trendRuns'
  | 'prospectionRuns'
  | 'dailyTrendsCount'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  planId: string
  upgradeRequired?: string
  isTrial?: boolean
}

export async function checkLimit(agencyId: string, key: LimitKey): Promise<LimitCheckResult> {
  const supabase = await createClient()

  const { data: agency } = await supabase
    .from('agencies')
    .select('plan_id, subscription_status, trial_ends_at')
    .eq('id', agencyId)
    .single()

  const planId = agency?.plan_id || 'trial'
  const isTrial = agency?.subscription_status === 'trialing' || planId === 'trial'

  // Essai expiré → bloquer tout
  if (isTrial && agency?.trial_ends_at) {
    const trialEnd = new Date(agency.trial_ends_at)
    if (trialEnd < new Date()) {
      return { allowed: false, current: 0, limit: 0, planId, upgradeRequired: 'starter', isTrial: true }
    }
  }

  const plan = getPlanById(planId)
  const limit = (plan?.limits as any)?.[key] ?? 0

  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, planId, isTrial }
  }

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  // Pour le trial : on compte depuis la création (pas par mois)
  const periodStart = isTrial
    ? new Date(0).toISOString()
    : monthStart.toISOString()

  let current = 0

  if (key === 'models') {
    const { count } = await supabase.from('models').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId)
    current = count || 0
  } else if (key === 'postSchedules') {
    const { count } = await supabase.from('scheduled_posts').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', periodStart)
    current = count || 0
  } else if (key === 'telegramBots') {
    const { count } = await supabase.from('telegram_bots').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId)
    current = count || 0
  } else if (key === 'aiGenerations') {
    const { count } = await supabase.from('ai_generations').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', periodStart)
    current = count || 0
  } else if (key === 'teamMembers') {
    const { count } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId)
    current = count || 0
  } else if (key === 'chattingMessages') {
    const { count } = await supabase.from('ai_messages').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('ai_generated', true).gte('created_at', periodStart)
    current = count || 0
  } else if (key === 'trendRuns') {
    // Compte les RUNs manuels du mois (pas par jour)
    const { count } = await supabase.from('trend_runs').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', monthStart.toISOString())
    current = count || 0
  } else if (key === 'prospectionRuns') {
    const { count } = await supabase.from('prospection_runs').select('*', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', monthStart.toISOString())
    current = count || 0
  }

  const allowed = current < limit
  const upgradeOrder = ['trial', 'starter', 'pro', 'agency']
  const currentIdx = upgradeOrder.indexOf(planId)
  const upgradeRequired = !allowed && currentIdx < upgradeOrder.length - 1
    ? upgradeOrder[currentIdx + 1]
    : undefined

  return { allowed, current, limit, planId, upgradeRequired, isTrial }
}

export function limitReachedResponse(result: LimitCheckResult, feature: string) {
  const planLabels: Record<string, string> = { trial: 'Essai', starter: 'Starter', pro: 'Pro', agency: 'Agency' }
  const upgradeName = planLabels[result.upgradeRequired || ''] || result.upgradeRequired

  return {
    error: 'limit_reached',
    feature,
    current: result.current,
    limit: result.limit,
    plan: result.planId,
    upgrade_to: result.upgradeRequired,
    isTrial: result.isTrial,
    message: result.isTrial && result.limit === 0
      ? `Votre essai a expiré. Souscrivez à un abonnement pour continuer.`
      : `Limite atteinte (${result.current}/${result.limit}). ${upgradeName ? `Passez au plan ${upgradeName} pour continuer.` : ''}`,
  }
}
