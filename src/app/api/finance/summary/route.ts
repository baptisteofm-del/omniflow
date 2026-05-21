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
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get current month start and end
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Get all transactions for the month
    const { data: monthTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    if (txError) throw txError

    // Calculate summary
    const revenues = monthTransactions?.filter(t => t.type === 'revenue') || []
    const expenses = monthTransactions?.filter(t => t.type === 'expense') || []

    const totalRevenue = revenues.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpense = expenses.reduce((sum, t) => sum + (t.amount || 0), 0)
    const netProfit = totalRevenue - totalExpense

    // Group by model
    const byModel: { [key: string]: any } = {}
    monthTransactions?.forEach(tx => {
      if (!byModel[tx.model_id]) {
        byModel[tx.model_id] = {
          model_id: tx.model_id,
          revenue: 0,
          expense: 0,
        }
      }
      if (tx.type === 'revenue') {
        byModel[tx.model_id].revenue += tx.amount || 0
      } else {
        byModel[tx.model_id].expense += tx.amount || 0
      }
    })

    // Add model names
    const modelIds = Object.keys(byModel)
    let models: any[] = []
    if (modelIds.length > 0) {
      const { data: modelData } = await supabase
        .from('models')
        .select('id, name')
        .in('id', modelIds)

      models = modelData || []
    }

    const byModelWithNames = Object.values(byModel).map(m => {
      const modelInfo = models.find(model => model.id === m.model_id)
      return {
        ...m,
        name: modelInfo?.name || 'Unknown',
        profit: m.revenue - m.expense,
      }
    })

    // Find top performer
    const topPerformer = byModelWithNames.reduce((prev, current) => 
      (prev.revenue || 0) > (current.revenue || 0) ? prev : current, 
      byModelWithNames[0]
    )

    return NextResponse.json({
      month: now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      totalRevenue,
      totalExpense,
      netProfit,
      topPerformer: topPerformer || null,
      byModel: byModelWithNames.sort((a, b) => b.revenue - a.revenue),
      transactionCount: monthTransactions?.length || 0,
    })
  } catch (error) {
    console.error('Summary fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}
