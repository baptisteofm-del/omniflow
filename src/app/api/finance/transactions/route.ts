import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency?.id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const type = url.searchParams.get('type') // revenue | expense
    const category = url.searchParams.get('category')
    const modelId = url.searchParams.get('model_id')

    let query = supabase.from('transactions').select('*').eq('agency_id', agency.id).order('date', { ascending: false }).limit(200)
    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (modelId) query = query.eq('model_id', modelId)

    const { data: transactions, error } = await query
    if (error) throw error

    return NextResponse.json({ transactions: transactions || [], count: transactions?.length || 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency?.id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const body = await request.json()
    const { type, amount, category, description, model_id, date, payment_method, notes } = body

    if (!type || !amount || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields: type, amount, category, description' }, { status: 400 })
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        agency_id: agency.id,
        type,
        amount: parseFloat(amount),
        category,
        description,
        model_id: model_id || null,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        payment_method: payment_method || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, transaction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency?.id) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('agency_id', agency.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
