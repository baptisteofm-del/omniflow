import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyPromoCode } from '@/lib/promos'

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
      .select('agency_id, email')
      .eq('id', user.id)
      .single()

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const { code, appliedTo, paymentId } = await request.json()

    if (!code || !appliedTo) {
      return NextResponse.json(
        { error: 'code and appliedTo are required' },
        { status: 400 }
      )
    }

    if (!['subscription', 'credits'].includes(appliedTo)) {
      return NextResponse.json(
        { error: 'appliedTo must be "subscription" or "credits"' },
        { status: 400 }
      )
    }

    const result = await applyPromoCode(
      code,
      userData.agency_id,
      userData.email,
      appliedTo,
      paymentId
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      discount: result.discount,
    })
  } catch (error) {
    console.error('Error applying promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
