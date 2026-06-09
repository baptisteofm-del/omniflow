import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePromoCode } from '@/lib/promos'
import { RUN_PRICE_EUR, RUN_UNITS } from '@/lib/plans'

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'

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

    const { runCount, promoCode } = await request.json()

    if (!runCount || runCount < 1) {
      return NextResponse.json(
        { error: 'Invalid run count' },
        { status: 400 }
      )
    }

    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      )
    }

    let amount = runCount * RUN_PRICE_EUR
    let finalAmount = amount
    let creditsBonus = 0
    const orderId = `omniflow_credits_${runCount}runs_${Date.now()}`

    // Validate promo code if provided
    if (promoCode) {
      const validation = await validatePromoCode(
        promoCode,
        userData.agency_id,
        undefined,
        amount
      )

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      if (validation.discount) {
        finalAmount = validation.discount.finalAmount
        creditsBonus = validation.discount.creditsBonus
      }
    }

    // Create NOWPayments invoice
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: finalAmount,
        price_currency: 'eur',
        order_id: orderId,
        order_description: `OmniFlow Credits - ${runCount} RUNs (${runCount * RUN_UNITS} credits)`,
        ipn_callback_url: `${APP_URL}/api/nowpayments/webhook`,
        success_url: `${APP_URL}/dashboard?credits=success&runs=${runCount}`,
        cancel_url: `${APP_URL}/settings/billing?credits=cancelled`,
        is_fixed_rate: true,
        is_fee_paid_by_user: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('NOWPayments error:', err)
      return NextResponse.json(
        { error: 'Payment provider error' },
        { status: 500 }
      )
    }

    const invoice = await response.json()

    // Store order metadata for webhook
    await supabase.from('credit_orders').insert({
      agency_id: userData.agency_id,
      order_id: orderId,
      invoice_id: invoice.id,
      run_count: runCount,
      credit_count: runCount * RUN_UNITS,
      amount: amount,
      final_amount: finalAmount,
      promo_code: promoCode,
      credits_bonus: creditsBonus,
      status: 'pending',
    })

    return NextResponse.json({
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      orderId,
      amount: finalAmount,
      creditsBonus,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
