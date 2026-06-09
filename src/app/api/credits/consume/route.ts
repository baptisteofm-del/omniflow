import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { consumeCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's agency
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const { amount, feature, description } = await request.json()

    if (!amount || amount < 1 || !feature || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await consumeCredits(
      userData.agency_id,
      amount,
      feature,
      description
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 402 }
      )
    }

    return NextResponse.json({
      success: true,
      balance: result.balance,
    })
  } catch (error) {
    console.error('Error consuming credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
