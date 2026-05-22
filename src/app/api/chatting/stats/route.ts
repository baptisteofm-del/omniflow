import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
  if (!agency?.id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

  const agencyId = agency.id

  // Today range
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)

  // Messages today
  const { count: msgToday } = await supabase
    .from('ai_messages')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .gte('sent_at', todayStart.toISOString())

  // Pending messages
  const { count: pending } = await supabase
    .from('ai_messages')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .is('approved', null)
    .eq('direction', 'outbound')

  // Approved this week
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7)
  const { count: approved } = await supabase
    .from('ai_messages')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('approved', true)
    .gte('sent_at', weekStart.toISOString())

  const { count: rejected } = await supabase
    .from('ai_messages')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('approved', false)
    .gte('sent_at', weekStart.toISOString())

  // Revenue from chatting this month (transactions with category 'chatting_ai')
  const { data: chatRevenue } = await supabase
    .from('transactions')
    .select('amount')
    .eq('agency_id', agencyId)
    .eq('category', 'chatting_ai')
    .eq('type', 'revenue')
    .gte('date', monthStart.toISOString())

  const revenueMonth = (chatRevenue || []).reduce((s, t) => s + (t.amount || 0), 0)
  const commission = revenueMonth * 0.10

  // Active models (have a personality configured)
  const { count: activeModels } = await supabase
    .from('model_personalities')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)

  // Recent fan profiles
  const { data: recentFans } = await supabase
    .from('fan_interactions')
    .select('id, fan_name, total_spent, interaction_count, sentiment_score, last_interaction')
    .eq('agency_id', agencyId)
    .order('last_interaction', { ascending: false })
    .limit(8)

  // Recent AI messages (with fan name)
  const { data: recentMessages } = await supabase
    .from('ai_messages')
    .select('id, content, direction, ai_generated, approved, sent_at, fan_profile:fan_profiles(fan_name)')
    .eq('agency_id', agencyId)
    .order('sent_at', { ascending: false })
    .limit(10)

  const total = (approved || 0) + (rejected || 0)
  const approvalRate = total > 0 ? Math.round((approved || 0) / total * 100) : null

  return NextResponse.json({
    stats: {
      messages_today: msgToday || 0,
      pending_validation: pending || 0,
      approval_rate: approvalRate,
      revenue_month: revenueMonth,
      commission_month: commission,
      active_models: activeModels || 0,
    },
    recent_fans: recentFans || [],
    recent_messages: recentMessages || [],
  })
}
