import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import type { PlanId, SubscriptionStatus } from '@/types'

// Paddle webhook signature verification
function verifyPaddleSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return hash === signature
}

// Map Paddle price IDs to OmniFlow plan IDs
function getPlanIdFromPaddlePrice(priceId: string): PlanId | null {
  // Build mapping from env vars
  const priceMapping: Record<string, PlanId> = {}

  // Starter
  if (process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY] = 'starter'
  }
  if (process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY] = 'starter'
  }

  // Pro
  if (process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY] = 'pro'
  }
  if (process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY] = 'pro'
  }

  // Agency
  if (process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY] = 'agency'
  }
  if (process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY) {
    priceMapping[process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY] = 'agency'
  }

  return priceMapping[priceId] || null
}

interface PaddleEvent {
  data: {
    id?: string
    subscription_id?: string
    customer_id?: string
    status?: string
    items?: Array<{ price: { id: string } }>
    custom_data?: { agency_id: string }
  }
  event_type?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('paddle-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Paddle signature' },
        { status: 401 }
      )
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET!
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify signature
    if (!verifyPaddleSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body) as PaddleEvent

    if (!event.event_type) {
      return NextResponse.json(
        { error: 'No event type' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()
    const agencyId = event.data?.custom_data?.agency_id

    if (!agencyId) {
      console.warn('No agency_id in webhook event:', event)
      return NextResponse.json({ received: true })
    }

    // Handle different Paddle events
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscriptionId = event.data?.subscription_id
        const planId = event.data?.items?.[0]?.price?.id
          ? getPlanIdFromPaddlePrice(event.data.items[0].price.id)
          : null
        const status = event.data?.status as SubscriptionStatus

        if (subscriptionId && planId && status) {
          await supabase
            .from('agencies')
            .update({
              subscription_id: subscriptionId,
              subscription_status: status,
              plan_id: planId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', agencyId)
        }
        break
      }

      case 'subscription.canceled': {
        const subscriptionId = event.data?.subscription_id

        if (subscriptionId) {
          await supabase
            .from('agencies')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', agencyId)
        }
        break
      }

      case 'subscription.payment_succeeded': {
        // Payment confirmed — could trigger email, metrics, etc.
        console.log(`Payment succeeded for subscription ${event.data?.subscription_id}`)
        break
      }

      case 'transaction.completed': {
        // One-time purchase or charge
        console.log(`Transaction completed: ${event.data?.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paddle webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
