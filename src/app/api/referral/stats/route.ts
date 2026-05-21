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
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    const agencyId = profile.agency_id

    // Get agency info to generate referral code
    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('id', agencyId)
      .single()

    const referralCode = agency?.id?.substring(0, 8).toUpperCase() || 'UNKNOWN'

    // Count total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_agency_id', agencyId)

    // Count active referrals (subscribed agencies)
    const { data: referrals } = await supabase
      .from('referrals')
      .select('referred_agency_id')
      .eq('referrer_agency_id', agencyId)

    let activeReferrals = 0
    let monthlyCommission = 0
    let totalCommission = 0

    if (referrals && referrals.length > 0) {
      // Check subscription status for each referred agency
      const { data: referredAgencies } = await supabase
        .from('agencies')
        .select('subscription_status, id')
        .in('id', referrals.map(r => r.referred_agency_id).filter(Boolean))

      if (referredAgencies) {
        activeReferrals = referredAgencies.filter(a => a.subscription_status === 'active').length

        // Calculate commission (10% per active referral)
        // This is simplified - in production you'd calculate from actual transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('agency_id', agencyId)

        if (transactions) {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

          transactions.forEach(tx => {
            const txDate = new Date(tx.created_at)
            const commission = (Number(tx.amount) || 0) * 0.1 * activeReferrals / Math.max(totalReferrals || 1, 1)
            totalCommission += commission
            if (txDate >= monthStart) {
              monthlyCommission += commission
            }
          })
        }
      }
    }

    return NextResponse.json({
      referralCode,
      totalReferrals: totalReferrals || 0,
      activeReferrals,
      monthlyCommission: Math.round(monthlyCommission * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
