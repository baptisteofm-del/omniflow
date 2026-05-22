import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get fan interactions and sentiment
    const { data: fans } = await supabase
      .from('fan_interactions')
      .select('*')
      .eq('agency_id', agency.id)
      .order('last_interaction', { ascending: false })
      .limit(100)

    // Identify unhappy fans (sentiment < 0.3)
    const unhappyFans = (fans || [])
      .filter(f => f.sentiment_score < 0.3)
      .sort((a, b) => a.sentiment_score - b.sentiment_score)
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        name: f.fan_name || 'Unknown',
        risk_level: f.sentiment_score < 0.1 ? 'red' : 'orange',
        reason: f.last_message || 'No recent message',
        last_interaction: f.last_interaction,
      }))

    // Identify missed opportunities (no purchase in 7+ days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const missedOpportunities = (fans || [])
      .filter(f => {
        const lastPurchase = new Date(f.last_purchase || 0)
        return lastPurchase < sevenDaysAgo && f.last_interaction
      })
      .sort((a, b) => 
        new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime()
      )
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        name: f.fan_name || 'Unknown',
        days_since_purchase: Math.floor(
          (new Date().getTime() - new Date(f.last_purchase).getTime()) / (1000 * 60 * 60 * 24)
        ),
        estimated_potential: f.estimated_ltv || 150,
        last_interaction: f.last_interaction,
      }))

    // Top performers (highest revenue)
    const { data: topFans } = await supabase
      .from('fan_interactions')
      .select('*')
      .eq('agency_id', agency.id)
      .order('total_spent', { ascending: false })
      .limit(5)

    const topPerformers = (topFans || [])
      .map(f => ({
        id: f.id,
        name: f.fan_name || 'Unknown',
        total_spent: f.total_spent || 0,
        interaction_count: f.interaction_count || 0,
        segment: f.total_spent > 500 ? 'VIP' : f.total_spent > 100 ? 'Regular' : 'New',
      }))

    // Time-based insights (simple: most active hours)
    const insights = {
      unhappy_fans: unhappyFans,
      missed_opportunities: missedOpportunities,
      top_performers: topPerformers,
      peak_hours: '20:00 - 22:00', // Placeholder - analyze from data
      best_response_rate: 'Soir (20h-22h)',
      engagement_trend: 'En hausse 📈',
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Insights generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
