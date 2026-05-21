import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession, getSubscription } from '@/lib/paddle/client'
import { getPlanById } from '@/lib/plans'

// GET /api/settings/billing — Fetch current billing info, invoices, and usage
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

    // === Fetch Usage Data ===
    // Count models
    const { count: modelsCount } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)

    // Count scheduled posts
    const { count: postsCount } = await supabase
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)

    // Count AI generations (placeholder - depends on your schema)
    const { count: aiCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('spoofed', true)

    // Count team members (from profiles with same agency)
    const { count: membersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)

    // Count content watches
    const { count: watchesCount } = await supabase
      .from('trends')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)

    // Count Telegram bots (placeholder - depends on your integrations schema)
    let botsCount = 0
    try {
      const { count } = await supabase
        .from('models')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agency.id)
        .eq('platform', 'telegram')
      botsCount = count || 0
    } catch {
      botsCount = 0
    }

    // Count linked accounts
    const { count: accountsCount } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)

    const usage = {
      models: modelsCount || 0,
      postsScheduled: postsCount || 0,
      aiGenerations: aiCount || 0,
      teamMembers: membersCount || 0,
      contentWatches: watchesCount || 0,
      telegramBots: botsCount,
      accountsLinked: accountsCount || 0,
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
      usage,
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
    const { action, priceId, method } = await req.json()

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

      // Handle crypto payments (NOWPayments)
      if (method === 'crypto') {
        // This is a placeholder — in production, you'd call NOWPayments API
        // to create a payment request for the specified plan
        return NextResponse.json({
          checkoutUrl: `https://nowpayments.io/payment/?iid=${agency.id}`,
        })
      }

      // Create checkout session with Paddle (default method: card)
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
