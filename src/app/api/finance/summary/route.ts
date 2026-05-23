import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency?.id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const url = new URL(request.url)
    const fromParam = url.searchParams.get('from')
    const toParam   = url.searchParams.get('to')
    const platform  = url.searchParams.get('platform') // onlyfans | mym | all
    const modelId   = url.searchParams.get('model_id')

    const now = new Date()

    // Determine current period bounds
    const periodStart = fromParam ? new Date(fromParam) : new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd   = toParam   ? new Date(toParam)   : now

    // Previous period (same duration)
    const duration = periodEnd.getTime() - periodStart.getTime()
    const prevEnd   = new Date(periodStart.getTime() - 1)
    const prevStart = new Date(prevEnd.getTime() - duration)

    // Fetch current period
    let qCurrent = supabase.from('transactions').select('*').eq('agency_id', agency.id)
      .gte('date', periodStart.toISOString()).lte('date', periodEnd.toISOString())
    if (modelId) qCurrent = qCurrent.eq('model_id', modelId)

    // Fetch previous period
    let qPrev = supabase.from('transactions').select('amount, type').eq('agency_id', agency.id)
      .gte('date', prevStart.toISOString()).lte('date', prevEnd.toISOString())
    if (modelId) qPrev = qPrev.eq('model_id', modelId)

    // Fetch full year for trend (12 months always)
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)
    const { data: txAll } = await supabase.from('transactions').select('type, amount, date, category')
      .eq('agency_id', agency.id).gte('date', yearAgo.toISOString())

    const [{ data: txCurrentRaw }, { data: txPrevRaw }] = await Promise.all([qCurrent, qPrev])

    let transactions = txCurrentRaw || []

    // Platform filter (client-side since category stores platform for revenues)
    if (platform && platform !== 'all') {
      transactions = transactions.filter((t: any) =>
        t.type === 'expense' || (t.type === 'revenue' && t.category === platform)
      )
    }

    const revenues = transactions.filter((t: any) => t.type === 'revenue')
    const expenses = transactions.filter((t: any) => t.type === 'expense')

    const totalRevenue = revenues.reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const totalExpense = expenses.reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const netProfit    = totalRevenue - totalExpense
    const margin       = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

    // Days in period
    const days = Math.max(Math.round((periodEnd.getTime() - periodStart.getTime()) / 86400000), 1)
    const dailyAvg = totalRevenue / days

    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayRevenue = revenues.filter((t: any) => t.date >= todayStart)
      .reduce((s: number, t: any) => s + (t.amount || 0), 0)

    // Prev period comparison
    const prevRevenue = (txPrevRaw || []).filter((t: any) => t.type === 'revenue')
      .reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const prevExpense = (txPrevRaw || []).filter((t: any) => t.type === 'expense')
      .reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const revenueGrowth = prevRevenue > 0 ? +((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)) : null
    const expenseGrowth = prevExpense > 0 ? +((((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1)) : null

    // By platform
    const byPlatform: Record<string, number> = {}
    revenues.forEach((t: any) => { const c = t.category || 'other'; byPlatform[c] = (byPlatform[c] || 0) + (t.amount || 0) })

    // By category (expense)
    const expenseByCategory: Record<string, number> = {}
    expenses.forEach((t: any) => { const c = t.category || 'other'; expenseByCategory[c] = (expenseByCategory[c] || 0) + (t.amount || 0) })

    // By model
    const byModelMap: Record<string, { revenue: number; expense: number }> = {}
    transactions.forEach((t: any) => {
      if (!t.model_id) return
      if (!byModelMap[t.model_id]) byModelMap[t.model_id] = { revenue: 0, expense: 0 }
      if (t.type === 'revenue') byModelMap[t.model_id].revenue += t.amount || 0
      else byModelMap[t.model_id].expense += t.amount || 0
    })
    let byModel: any[] = []
    const modelIds = Object.keys(byModelMap)
    if (modelIds.length > 0) {
      const { data: modelData } = await supabase.from('models').select('id, name').in('id', modelIds)
      byModel = modelIds.map(id => {
        const info = (modelData || []).find((m: any) => m.id === id)
        const d = byModelMap[id]
        return { id, name: info?.name || 'Modèle', revenue: d.revenue, expense: d.expense, profit: d.revenue - d.expense, margin: d.revenue > 0 ? Math.round(((d.revenue - d.expense) / d.revenue) * 100) : 0 }
      }).sort((a, b) => b.revenue - a.revenue)
    }

    // Monthly trend (12 months)
    const monthlyTrend: any[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
      const mEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
      const mTx    = (txAll || []).filter((t: any) => t.date >= mStart && t.date <= mEnd)
      const rev = mTx.filter((t: any) => t.type === 'revenue').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      const exp = mTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      monthlyTrend.push({ month: label, revenue: rev, expense: exp, profit: rev - exp, margin: rev > 0 ? Math.round(((rev - exp) / rev) * 100) : 0 })
    }

    // Daily trend (last 30 days for granular view)
    const dailyTrend: any[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      const dEnd   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString()
      const dTx    = (txAll || []).filter((t: any) => t.date >= dStart && t.date <= dEnd)
      const rev = dTx.filter((t: any) => t.type === 'revenue').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      const exp = dTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      dailyTrend.push({ day: label, revenue: rev, expense: exp })
    }

    // Expense ratios
    const expenseRatio = totalRevenue > 0 ? Math.round((totalExpense / totalRevenue) * 100) : 0
    const topExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]

    // Smart recommendations
    const recommendations: any[] = []
    const chatterCost = expenseByCategory['chatters'] || 0
    if (chatterCost > totalRevenue * 0.12) recommendations.push({ type: 'warning', message: `Les salaires chatters représentent ${Math.round((chatterCost / Math.max(totalRevenue, 1)) * 100)}% du CA — le Chatting IA peut réduire ce coût`, href: '/chatting/ai' })
    if (margin < 30 && totalRevenue > 0) recommendations.push({ type: 'alert', message: `Marge nette faible (${margin}%) — analysez vos postes de dépenses`, href: '' })
    if (revenueGrowth !== null && revenueGrowth < -5) recommendations.push({ type: 'alert', message: `Revenus en baisse de ${Math.abs(revenueGrowth)}% vs période précédente`, href: '/chatting' })
    if (expenseRatio > 70 && totalRevenue > 0) recommendations.push({ type: 'warning', message: `Ratio dépenses/CA élevé : ${expenseRatio}% — objectif < 50%`, href: '' })
    if (totalRevenue > 0 && !byPlatform['mym'] && !byPlatform['onlyfans']) recommendations.push({ type: 'info', message: 'Connectez OnlyFans ou MYM pour synchroniser vos revenus automatiquement', href: '/settings/integrations' })

    const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

    return NextResponse.json({
      totalRevenue, totalExpense, netProfit, margin, dailyAvg, todayRevenue,
      prevRevenue, prevExpense, revenueGrowth, expenseGrowth, expenseRatio,
      topExpenseCategory: topExpenseCategory ? { name: topExpenseCategory[0], amount: topExpenseCategory[1] } : null,
      byPlatform, expenseByCategory, byModel,
      monthlyTrend, dailyTrend,
      recommendations,
      transactionCount: transactions.length,
      recentTransactions: transactions.slice(0, 50),
      formatted: { totalRevenue: fmt(totalRevenue), totalExpense: fmt(totalExpense), netProfit: fmt(netProfit), dailyAvg: fmt(dailyAvg) },
      period: { from: periodStart.toISOString(), to: periodEnd.toISOString(), days },
    })
  } catch (error) {
    console.error('Finance summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch finance summary' }, { status: 500 })
  }
}
