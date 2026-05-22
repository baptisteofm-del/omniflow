import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-nowpayments-sig')

    // Vérifier la signature HMAC si disponible
    if (signature && IPN_SECRET) {
      const hmac = crypto.createHmac('sha512', IPN_SECRET)
      const parsed = JSON.parse(body)
      const sorted = JSON.stringify(parsed, Object.keys(parsed).sort())
      hmac.update(sorted)
      const computed = hmac.digest('hex')
      if (computed !== signature) {
        console.warn('Invalid signature for NOWPayments webhook')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)
    const { payment_status, order_id, price_amount, price_currency } = data

    // Parser le order_id : omniflow_{planId}_{interval}_{timestamp}
    const parts = order_id?.split('_') || []
    const planId = parts[1]
    const interval = parts[2]

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const supabase = await createAdminClient()

      console.log(
        `✅ Payment confirmed: ${planId} ${interval} — ${price_amount} ${price_currency}`
      )

      // TODO: trouver l'agence par order_id et mettre à jour son plan
      // await supabase.from('agencies').update({ plan_id: planId }).eq(...)
    } else if (payment_status === 'expired' || payment_status === 'failed') {
      console.warn(
        `❌ Payment failed: ${order_id} - Status: ${payment_status}`
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
