import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    const agencyId = agency.id

    // Get all referrals for this agency
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('referred_agency_id, created_at, commission_percent')
      .eq('referrer_agency_id', agencyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referrals:', error)
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
    }

    if (!referrals || referrals.length === 0) {
      return NextResponse.json({ referrals: [] })
    }

    // Get details for referred agencies
    const referredIds = referrals
      .map(r => r.referred_agency_id)
      .filter(Boolean)

    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, name, plan_id, subscription_status, created_at')
      .in('id', referredIds)

    // Get transactions for commission calculation
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, agency_id')
      .in('agency_id', referredIds)

    // Combine data
    const result = referrals
      .map(ref => {
        const agency = agencies?.find(a => a.id === ref.referred_agency_id)
        if (!agency) return null

        const agencyTransactions = transactions?.filter(t => t.agency_id === ref.referred_agency_id) || []
        const totalRevenue = agencyTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        const commission = Math.round(totalRevenue * (ref.commission_percent / 100) * 100) / 100

        return {
          id: agency.id,
          name: agency.name,
          plan: agency.plan_id,
          status: agency.subscription_status === 'active' ? 'Actif' : 'Inactif',
          joinedAt: new Date(agency.created_at).toLocaleDateString('fr-FR'),
          commission,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.commission || 0) - (a?.commission || 0))

    return NextResponse.json({ referrals: result })
  } catch (error) {
    console.error('Error in referrals endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
