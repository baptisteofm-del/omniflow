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

    // Get transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('agency_id', agency.id)
      .order('date', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({
      transactions: transactions || [],
      count: transactions?.length || 0,
    })
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { type, amount, category, description, model_id, date } = body

    if (!type || !amount || !category || !description || !model_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        agency_id: agency.id,
        type,
        amount: parseFloat(amount),
        category,
        description,
        model_id,
        date: date || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error('Transaction create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
