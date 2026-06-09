import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { configureAutoTopup } from '@/lib/credits'

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

    const { enabled, threshold, amount } = await request.json()

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be boolean' },
        { status: 400 }
      )
    }

    if (enabled && (!threshold || !amount || threshold < 1 || amount < 1)) {
      return NextResponse.json(
        { error: 'threshold and amount are required when enabled=true' },
        { status: 400 }
      )
    }

    const success = await configureAutoTopup(
      userData.agency_id,
      enabled,
      threshold,
      amount
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update auto topup configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enabled,
      threshold,
      amount,
    })
  } catch (error) {
    console.error('Error configuring auto topup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
