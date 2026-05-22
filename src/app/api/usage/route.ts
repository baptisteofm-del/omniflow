import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPlanById, PLANS } from '@/lib/plans'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, plan_id, name')
    .eq('owner_id', user.id)
    .single()

  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  const planId = agency.plan_id || 'starter'
  const plan = getPlanById(planId)!

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    { count: modelsCount },
    { count: postsCount },
    { count: aiGenCount },
    { count: telegramCount },
    { count: teamCount },
  ] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
    supabase.from('scheduled_posts').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).gte('created_at', monthStart.toISOString()),
    supabase.from('ai_generations').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id).gte('created_at', monthStart.toISOString()),
    supabase.from('telegram_bots').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
    supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('agency_id', agency.id),
  ])

  const usage = {
    models: { current: modelsCount || 0, limit: plan.limits.models },
    postSchedules: { current: postsCount || 0, limit: plan.limits.postSchedules },
    aiGenerations: { current: aiGenCount || 0, limit: plan.limits.aiGenerations },
    telegramBots: { current: telegramCount || 0, limit: plan.limits.telegramBots },
    teamMembers: { current: teamCount || 0, limit: plan.limits.teamMembers },
  }

  return NextResponse.json({
    plan: { id: planId, name: plan.name, price: plan.price },
    usage,
    agency: { id: agency.id, name: agency.name },
  })
}
