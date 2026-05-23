import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    if (!agency?.id) return NextResponse.json({ error: 'No agency found' }, { status: 404 })

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month' // month | quarter | year

    const now = new Date()
    let periodStart: Date
    let prevStart: Date
    let prevEnd: Date

    if (period === 'year') {
      periodStart = new Date(now.getFullYear(), 0, 1)
      prevStart = new Date(now.getFullYear() - 1, 0, 1)
      prevEnd = new Date(now.getFullYear() - 1, 11, 31)
    } else if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3)
      periodStart = new Date(now.getFullYear(), q * 3, 1)
      prevStart = new Date(now.getFullYear(), (q - 1) * 3, 1)
      prevEnd = new Date(now.getFullYear(), q * 3, 0)
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    }

    // Fetch current period transactions
    const { data: txCurrent } = await supabase
      .from('transactions')
      .select('*')
      .eq('agency_id', agency.id)
      .gte('date', periodStart.toISOString())
      .lte('date', now.toISOString())
      .order('date', { ascending: false })

    // Fetch previous period transactions
    const { data: txPrev } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('agency_id', agency.id)
      .gte('date', prevStart.toISOString())
      .lte('date', prevEnd.toISOString())

    // Fetch last 12 months for trend
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)
    const { data: txAll } = await supabase
      .from('transactions')
      .select('type, amount, date, category')
      .eq('agency_id', agency.id)
      .gte('date', yearAgo.toISOString())

    const transactions = txCurrent || []
    const revenues = transactions.filter((t: any) => t.type === 'revenue')
    const expenses = transactions.filter((t: any) => t.type === 'expense')

    const totalRevenue = revenues.reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const totalExpense = expenses.reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const netProfit = totalRevenue - totalExpense
    const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0

    // Today's revenue
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayRevenue = revenues
      .filter((t: any) => t.date >= todayStart)
      .reduce((s: number, t: any) => s + (t.amount || 0), 0)

    // Previous period
    const prevRevenue = (txPrev || [])
      .filter((t: any) => t.type === 'revenue')
      .reduce((s: number, t: any) => s + (t.amount || 0), 0)
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : null

    // Revenue by platform
    const byPlatform: Record<string, number> = {}
    revenues.forEach((t: any) => {
      const cat = t.category || 'other'
      byPlatform[cat] = (byPlatform[cat] || 0) + (t.amount || 0)
    })

    // Expense by category
    const expenseByCategory: Record<string, number> = {}
    expenses.forEach((t: any) => {
      const cat = t.category || 'other'
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (t.amount || 0)
    })

    // Revenue by model
    const byModelMap: Record<string, { revenue: number; expense: number }> = {}
    transactions.forEach((t: any) => {
      if (!t.model_id) return
      if (!byModelMap[t.model_id]) byModelMap[t.model_id] = { revenue: 0, expense: 0 }
      if (t.type === 'revenue') byModelMap[t.model_id].revenue += t.amount || 0
      else byModelMap[t.model_id].expense += t.amount || 0
    })
    const modelIds = Object.keys(byModelMap)
    let byModel: any[] = []
    if (modelIds.length > 0) {
      const { data: modelData } = await supabase
        .from('models')
        .select('id, name')
        .in('id', modelIds)
      byModel = modelIds.map(id => {
        const info = (modelData || []).find((m: any) => m.id === id)
        const d = byModelMap[id]
        return { id, name: info?.name || 'Modèle', revenue: d.revenue, expense: d.expense, profit: d.revenue - d.expense }
      }).sort((a, b) => b.revenue - a.revenue)
    }

    // Monthly trend (last 12 months)
    const monthlyTrend: Array<{ month: string; revenue: number; expense: number; profit: number }> = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
      const mTx = (txAll || []).filter((t: any) => t.date >= mStart && t.date <= mEnd)
      const rev = mTx.filter((t: any) => t.type === 'revenue').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      const exp = mTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (t.amount || 0), 0)
      monthlyTrend.push({ month: label, revenue: rev, expense: exp, profit: rev - exp })
    }

    // Smart recommendations
    const recommendations: Array<{ type: string; message: string; action?: string; href?: string }> = []
    const chatterCost = expenseByCategory['chatters'] || 0
    if (chatterCost > totalRevenue * 0.15) {
      recommendations.push({
        type: 'warning',
        message: `Les salaires chatters représentent ${Math.round((chatterCost / totalRevenue) * 100)}% des revenus`,
        action: 'Activer le Chatting IA',
        href: '/chatting/ai',
      })
    }
    if (margin < 30 && totalRevenue > 0) {
      recommendations.push({
        type: 'alert',
        message: `Marge nette faible (${margin}%) — analysez vos dépenses`,
        action: 'Voir les dépenses',
      })
    }
    if (revenueGrowth !== null && revenueGrowth < 0) {
      recommendations.push({
        type: 'warning',
        message: `Revenus en baisse de ${Math.abs(revenueGrowth)}% vs mois précédent`,
        action: 'Voir les rapports',
        href: '/chatting',
      })
    }
    if (totalRevenue > 0 && Object.keys(byPlatform).length < 2) {
      recommendations.push({
        type: 'info',
        message: 'Diversifiez vos plateformes (OF + MYM) pour réduire les risques',
        action: 'Connecter MYM',
        href: '/settings/integrations',
      })
    }

    const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

    return NextResponse.json({
      period,
      periodLabel: periodStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      totalRevenue,
      totalExpense,
      netProfit,
      margin,
      todayRevenue,
      revenueGrowth,
      prevRevenue,
      byPlatform,
      expenseByCategory,
      byModel,
      monthlyTrend,
      recommendations,
      transactionCount: transactions.length,
      recentTransactions: transactions.slice(0, 20),
      formatted: {
        totalRevenue: fmt(totalRevenue),
        totalExpense: fmt(totalExpense),
        netProfit: fmt(netProfit),
        todayRevenue: fmt(todayRevenue),
      },
    })
  } catch (error) {
    console.error('Finance summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch finance summary' }, { status: 500 })
  }
}
