import { NextRequest, NextResponse } from 'next/server'

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'

const PLAN_PRICES: Record<string, Record<string, number>> = {
  starter: { monthly: 49, yearly: 39 * 12 },
  pro: { monthly: 99, yearly: 79 * 12 },
  agency: { monthly: 249, yearly: 199 * 12 },
}

export async function POST(request: NextRequest) {
  try {
    const { planId, interval = 'monthly' } = await request.json()

    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      )
    }

    const amount = PLAN_PRICES[planId][interval as 'monthly' | 'yearly']
    const orderId = `omniflow_${planId}_${interval}_${Date.now()}`

    // Créer l'invoice NOWPayments
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'eur',
        order_id: orderId,
        order_description: `OmniFlow ${planId} ${interval}`,
        ipn_callback_url: `${APP_URL}/api/nowpayments/webhook`,
        success_url: `${APP_URL}/dashboard?payment=success&plan=${planId}`,
        cancel_url: `${APP_URL}/pricing?payment=cancelled`,
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

    return NextResponse.json({
      invoiceUrl: invoice.invoice_url,
      invoiceId: invoice.id,
      orderId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
