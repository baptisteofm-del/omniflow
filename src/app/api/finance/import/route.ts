/**
 * Batch import transactions from CSV
 * POST body: { transactions: Array<{type, amount, category, description, date?, model_id?}> }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('agency_id').eq('id', user.id).single()
  if (!profile?.agency_id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

  const { transactions } = await request.json()
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return NextResponse.json({ error: 'No transactions provided' }, { status: 400 })
  }

  const records = transactions.map((t: any) => ({
    agency_id: profile.agency_id,
    type: t.type === 'expense' ? 'expense' : 'revenue',
    amount: Math.abs(parseFloat(t.amount) || 0),
    category: t.category || 'other',
    description: t.description || '',
    model_id: t.model_id || null,
    date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
  })).filter((r) => r.amount > 0)

  const { data, error } = await supabase
    .from('transactions')
    .insert(records)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, imported: data?.length || 0 })
}
