// Paddle — gestion des abonnements

const PADDLE_API_URL =
  process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'

const PADDLE_API_KEY = process.env.PADDLE_API_KEY!

async function paddleRequest(path: string, options?: RequestInit) {
  const res = await fetch(`${PADDLE_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) {
    throw new Error(`Paddle error: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

export async function createCheckoutSession({
  priceId,
  customerId,
  email,
  agencyId,
}: {
  priceId: string
  customerId?: string
  email: string
  agencyId: string
}) {
  return paddleRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: customerId ? { id: customerId } : { email },
      custom_data: { agency_id: agencyId },
      collection_mode: 'automatic',
    }),
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return paddleRequest(`/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ effective_from: 'next_billing_period' }),
  })
}

export async function getSubscription(subscriptionId: string) {
  return paddleRequest(`/subscriptions/${subscriptionId}`)
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  return paddleRequest(`/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      proration_billing_mode: 'prorated_immediately',
    }),
  })
}
