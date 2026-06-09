import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanById } from '@/lib/plans'

export const dynamic = 'force-dynamic'

/**
 * GET /api/usage/trends
 * 
 * Retourne le quota de veille du plan + utilisation du jour.
 * - dailyLimit : nombre de RUNs manuels autorisés par mois
 * - dailyTrendsCount : nombre de trends par veille automatique (5/10/20 selon plan)
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, plan_id')
      .eq('owner_id', user.id)
      .single()
    if (!agency) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const plan = getPlanById(agency.plan_id || 'starter')
    const dailyLimit        = plan?.limits?.trendRuns ?? 30       // RUNs manuels/mois
    const dailyTrendsCount  = plan?.limits?.dailyTrendsCount ?? 5 // trends par veille auto

    // Compte les RUNs manuels du mois
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    let usedThisMonth = 0
    try {
      const { count } = await supabase
        .from('trend_runs')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', agency.id)
        .gte('created_at', monthStart.toISOString())

      usedThisMonth = count || 0
    } catch {
      usedThisMonth = 0
    }

    const remaining   = Math.max(dailyLimit - usedThisMonth, 0)
    const canGenerate = remaining > 0

    return NextResponse.json({
      planId: agency.plan_id || 'starter',
      dailyLimit,
      dailyTrendsCount,
      usedToday: usedThisMonth,
      remaining,
      canGenerate,
      resetAt: new Date(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)).toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}
