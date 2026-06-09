import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, referral_code')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Générer le code de parrainage s'il n'existe pas
    let referralCode = agency.referral_code
    if (!referralCode) {
      // Générer un code unique à partir de l'ID + timestamp
      referralCode = agency.id.substring(0, 6).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()
      // Tenter de persister le code (ne pas bloquer si la colonne n'existe pas)
      try {
        await supabase
          .from('agencies')
          .update({ referral_code: referralCode })
          .eq('id', agency.id)
      } catch (e) {
        // La colonne referral_code peut ne pas exister encore — utiliser le code en mémoire
        console.warn('Could not persist referral_code (column may not exist yet):', e)
      }
    }

    const agencyId = agency.id
    const referralLink = `https://omniflowapp.ai/register?ref=${referralCode}`

    // Count referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_agency_id', agencyId)

    const { data: referrals } = await supabase
      .from('referrals')
      .select('referred_agency_id, commission_percent')
      .eq('referrer_agency_id', agencyId)

    let activeReferrals = 0
    let monthlyCommission = 0
    let totalCommission = 0

    if (referrals && referrals.length > 0) {
      const referredIds = referrals.map(r => r.referred_agency_id).filter(Boolean)

      const { data: referredAgencies } = await supabase
        .from('agencies')
        .select('id, subscription_status')
        .in('id', referredIds)

      if (referredAgencies) {
        activeReferrals = referredAgencies.filter(a => a.subscription_status === 'active').length

        // Commission from Paddle/Stripe webhooks or billing transactions
        const { data: commissionTx } = await supabase
          .from('referral_commissions')
          .select('amount, created_at')
          .eq('referrer_agency_id', agencyId)

        if (commissionTx) {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          commissionTx.forEach(tx => {
            totalCommission += Number(tx.amount) || 0
            if (new Date(tx.created_at) >= monthStart) monthlyCommission += Number(tx.amount) || 0
          })
        } else {
          // Fallback estimation: 10% of referred agencies' plan value × active count
          const planValues: Record<string, number> = { starter: 49, pro: 99, agency: 199 }
          const { data: activePlans } = await supabase
            .from('agencies').select('plan_id').in('id', referredIds).eq('subscription_status', 'active')
          if (activePlans) {
            const monthly = activePlans.reduce((s, a) => s + (planValues[a.plan_id] || 49) * 0.10, 0)
            monthlyCommission = monthly
            totalCommission = monthly // We don't have history, estimate
          }
        }
      }
    }

    return NextResponse.json({
      referralCode,
      referralLink,
      totalReferrals: totalReferrals || 0,
      activeReferrals,
      monthlyCommission: Math.round(monthlyCommission * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
    })
  } catch (error) {
    console.error('Referral stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
