import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTransactionHistory } from '@/lib/credits'

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

    const limit = request.nextUrl.searchParams.get('limit')
      ? parseInt(request.nextUrl.searchParams.get('limit') as string)
      : 10

    const transactions = await getTransactionHistory(userData.agency_id, limit)

    return NextResponse.json({
      transactions,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
