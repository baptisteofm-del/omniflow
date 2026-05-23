import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlanById } from '@/lib/plans'

export const dynamic = 'force-dynamic'

// Retourne l'utilisation trends du jour + quota du plan
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
    const dailyLimit = plan?.limits?.trendRuns ?? 5

    // Compte les générations trends d'aujourd'hui
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // On compte les trends créés aujourd'hui (si la table existe)
    let usedToday = 0
    try {
      const { count } = await supabase
        .from('trends')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', agency.id)
        .gte('captured_at', todayStart.toISOString())

      usedToday = count || 0
    } catch {
      // Table doesn't exist yet → no usage
      usedToday = 0
    }

    const remaining = Math.max(dailyLimit - usedToday, 0)
    const canGenerate = remaining > 0

    return NextResponse.json({
      planId: agency.plan_id || 'starter',
      dailyLimit,
      usedToday,
      remaining,
      canGenerate,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}
