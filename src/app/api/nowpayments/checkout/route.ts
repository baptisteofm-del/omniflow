/**
 * POST /api/nowpayments/checkout
 * 
 * Crée une invoice NOWPayments pour :
 * - Un abonnement (planId + interval)
 * - Un achat de crédits (runCount)
 * 
 * Supporte les codes promo.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'

// Prix réels des abonnements (corrigés)
const PLAN_PRICES: Record<string, Record<string, number>> = {
  starter: { monthly: 99,  yearly: 79  * 12 },
  pro:     { monthly: 199, yearly: 159 * 12 },
  agency:  { monthly: 349, yearly: 279 * 12 },
}

const RUN_PRICE = 9 // €/RUN
const RUN_UNITS = 10

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const {
      planId,
      interval = 'monthly',
      runCount,       // si achat de crédits
      promoCode,      // code promo optionnel
    } = await request.json()

    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json({ error: 'Payment provider not configured' }, { status: 500 })
    }

    let amount: number
    let orderType: string
    let orderId: string
    let description: string

    if (runCount) {
      // ── Achat de crédits (RUNs) ──────────────────────────────────
      const runs = Math.max(1, Math.min(100, parseInt(runCount)))
      amount = runs * RUN_PRICE
      orderType = 'credits'
      orderId = `omniflow_credits_${runs}runs_${user?.id || 'anon'}_${Date.now()}`
      description = `OmniFlow — ${runs} RUN${runs > 1 ? 's' : ''} (${runs * RUN_UNITS} générations)`
    } else if (planId) {
      // ── Abonnement ───────────────────────────────────────────────
      if (!PLAN_PRICES[planId]) {
        return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
      }
      amount = PLAN_PRICES[planId][interval as 'monthly' | 'yearly'] || PLAN_PRICES[planId].monthly
      orderType = 'subscription'
      orderId = `omniflow_${planId}_${interval}_${user?.id || 'anon'}_${Date.now()}`
      description = `OmniFlow ${planId} — ${interval === 'yearly' ? 'Annuel' : 'Mensuel'}`
    } else {
      return NextResponse.json({ error: 'planId ou runCount requis' }, { status: 400 })
    }

    // ── Appliquer le code promo ───────────────────────────────────────
    let discountAmount = 0
    let promoApplied = false

    if (promoCode && user) {
      try {
        const { data: agency } = await supabase
          .from('agencies')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (agency) {
          const validateRes = await fetch(`${APP_URL}/api/promos/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCode, agencyId: agency.id, planId, amount }),
          })
          const validated = await validateRes.json()
          if (validated.valid && validated.discount) {
            discountAmount = validated.discount.discountAmount || 0
            amount = Math.max(0.5, amount - discountAmount) // min 0.50€
            promoApplied = true
          }
        }
      } catch {
        // Code promo invalide → ignorer, paiement sans réduction
      }
    }

    // Encode le promo dans l'orderId pour le webhook
    if (promoApplied && promoCode) {
      orderId += `_promo:${promoCode.toUpperCase()}`
    }

    // ── Créer l'invoice NOWPayments ──────────────────────────────────
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: Math.round(amount * 100) / 100,
        price_currency: 'eur',
        order_id: orderId,
        order_description: description + (promoApplied ? ` (promo: ${promoCode})` : ''),
        ipn_callback_url: `${APP_URL}/api/nowpayments/webhook`,
        success_url: `${APP_URL}/dashboard?payment=success&type=${orderType}${planId ? `&plan=${planId}` : ''}`,
        cancel_url: `${APP_URL}/settings/billing?payment=cancelled`,
        is_fixed_rate: true,
        is_fee_paid_by_user: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('NOWPayments error:', err)
      return NextResponse.json({ error: 'Erreur création invoice' }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({
      invoiceUrl: data.invoice_url,
      invoiceId: data.id,
      amount: Math.round(amount * 100) / 100,
      originalAmount: runCount ? parseInt(runCount) * RUN_PRICE : PLAN_PRICES[planId]?.[interval] || 0,
      discountAmount,
      promoApplied,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
