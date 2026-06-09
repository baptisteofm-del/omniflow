import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCreditsData } from '@/lib/credits'

export async function GET(request: NextRequest) {
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

    // Get credits data
    const creditsData = await getCreditsData(userData.agency_id)

    return NextResponse.json({
      balance: creditsData?.balance || 0,
      autoTopup: {
        enabled: creditsData?.auto_topup_enabled || false,
        threshold: creditsData?.auto_topup_threshold || 10,
        amount: creditsData?.auto_topup_amount || 10,
      },
      lifetimePurchased: creditsData?.lifetime_purchased || 0,
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
