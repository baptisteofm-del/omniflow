import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePromoCode } from '@/lib/promos'

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

    const { code, planId, amount } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const result = await validatePromoCode(
      code,
      userData.agency_id,
      planId,
      amount
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
