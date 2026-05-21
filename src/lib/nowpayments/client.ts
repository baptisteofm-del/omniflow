// NOWPayments — paiements crypto

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1'
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY!

async function npRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${NOWPAYMENTS_API_URL}${path}`, {
    ...options,
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) {
    throw new Error(`NOWPayments error: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

export async function createCryptoInvoice({
  amount,
  currency,
  agencyId,
  planId,
  orderId,
}: {
  amount: number
  currency: 'usd' | 'eur'
  agencyId: string
  planId: string
  orderId: string
}) {
  return npRequest('/invoice', {
    method: 'POST',
    body: JSON.stringify({
      price_amount: amount,
      price_currency: currency,
      pay_currency: 'usdttrc20', // USDT TRC20 par défaut
      order_id: orderId,
      order_description: `Omniflow ${planId} subscription`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/nowpayments/webhook`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
      custom_fields: {
        agency_id: agencyId,
        plan_id: planId,
      },
    }),
  })
}

export async function getPaymentStatus(paymentId: string) {
  return npRequest(`/payment/${paymentId}`)
}

export function verifyCryptoWebhook(payload: string, signature: string): boolean {
  const crypto = require('crypto')
  const secret = process.env.NOWPAYMENTS_IPN_SECRET!
  const hmac = crypto.createHmac('sha512', secret).update(payload).digest('hex')
  return hmac === signature
}
