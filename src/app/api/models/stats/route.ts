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

    // Get all models for this agency
    const { data: models } = await supabase
      .from('models')
      .select('id')
      .eq('agency_id', agency.id)

    const modelIds = models?.map(m => m.id) || []
    const stats: Record<string, { revenue_month: number; posts_count: number }> = {}

    if (modelIds.length > 0) {
      // Get revenue for this month
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: transactions } = await supabase
        .from('transactions')
        .select('model_id, amount')
        .eq('agency_id', agency.id)
        .eq('type', 'income')
        .gte('date', monthStart.split('T')[0])

      // Get posts this month
      const { data: posts } = await supabase
        .from('scheduled_posts')
        .select('model_id')
        .eq('agency_id', agency.id)
        .gte('created_at', monthStart)

      // Initialize all models with 0
      modelIds.forEach(id => {
        stats[id] = { revenue_month: 0, posts_count: 0 }
      })

      // Aggregate revenue by model
      if (transactions) {
        transactions.forEach(tx => {
          if (stats[tx.model_id]) {
            stats[tx.model_id].revenue_month += tx.amount || 0
          }
        })
      }

      // Count posts by model
      if (posts) {
        posts.forEach(post => {
          if (stats[post.model_id]) {
            stats[post.model_id].posts_count += 1
          }
        })
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Model stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch model stats' },
      { status: 500 }
    )
  }
}
