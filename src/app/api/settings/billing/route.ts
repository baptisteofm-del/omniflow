import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, getSubscription } from '@/lib/paddle/client'
import { getPlanById } from '@/lib/plans'

// GET /api/settings/billing — Fetch current billing info & invoices
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get agency (assuming one-to-one user -> agency for now)
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Fetch subscription details if exists
    let subscriptionData = null
    if (agency.subscription_id) {
      try {
        subscriptionData = await getSubscription(agency.subscription_id)
      } catch (err) {
        console.error('Error fetching subscription:', err)
      }
    }

    // Get plan details
    const plan = getPlanById(agency.plan_id)

    // Calculate trial days remaining
    let trialDaysRemaining = null
    if (agency.trial_ends_at) {
      const trialEnd = new Date(agency.trial_ends_at)
      const today = new Date()
      const daysRemaining = Math.ceil(
        (trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      trialDaysRemaining = Math.max(0, daysRemaining)
    }

    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        planId: agency.plan_id,
        subscriptionId: agency.subscription_id,
        subscriptionStatus: agency.subscription_status,
        trialEndsAt: agency.trial_ends_at,
        trialDaysRemaining,
      },
      plan,
      subscription: subscriptionData,
      // Placeholder for invoices — fetch from Paddle API if available
      invoices: [],
    })
  } catch (error) {
    console.error('Billing GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing info' },
      { status: 500 }
    )
  }
}

// POST /api/settings/billing — Initiate checkout or plan change
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { action, priceId } = await req.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    if (action === 'checkout') {
      if (!priceId) {
        return NextResponse.json(
          { error: 'priceId required' },
          { status: 400 }
        )
      }

      // Create checkout session with Paddle
      const checkoutSession = await createCheckoutSession({
        priceId,
        customerId: agency.paddle_customer_id,
        email: user.email || '',
        agencyId: agency.id,
      })

      return NextResponse.json({
        checkoutUrl: checkoutSession.data.checkout.url,
      })
    }

    if (action === 'cancel-subscription') {
      if (!agency.subscription_id) {
        return NextResponse.json(
          { error: 'No active subscription' },
          { status: 400 }
        )
      }

      // Cancel subscription (handled by webhook on Paddle side)
      // Here we just mark it for cancellation
      await supabase
        .from('agencies')
        .update({
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agency.id)

      return NextResponse.json({
        success: true,
        message: 'Subscription cancellation initiated',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Billing POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process billing request' },
      { status: 500 }
    )
  }
}
