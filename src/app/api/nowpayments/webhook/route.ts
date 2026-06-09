/**
 * POST /api/nowpayments/webhook (IPN)
 * 
 * Reçoit les notifications de paiement NOWPayments.
 * Gère :
 * - Activation d'abonnement (subscription)
 * - Ajout de crédits (credits)
 * - Application des codes promo
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'
const RUN_UNITS = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-nowpayments-sig')

    // ── Vérification signature HMAC ───────────────────────────────────
    if (signature && IPN_SECRET) {
      const hmac = crypto.createHmac('sha512', IPN_SECRET)
      const parsed = JSON.parse(body)
      const sorted = JSON.stringify(parsed, Object.keys(parsed).sort())
      hmac.update(sorted)
      const computed = hmac.digest('hex')
      if (computed !== signature) {
        console.warn('[Webhook] Invalid NOWPayments signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)
    const { payment_status, order_id, price_amount, price_currency, payment_id } = data

    console.log(`[Webhook] NOWPayments: ${order_id} → ${payment_status}`)

    if (!['finished', 'confirmed'].includes(payment_status)) {
      if (['expired', 'failed'].includes(payment_status)) {
        console.warn(`[Webhook] Payment failed: ${order_id} — ${payment_status}`)
      }
      return NextResponse.json({ received: true })
    }

    // ── Parser l'order_id ─────────────────────────────────────────────
    // Format: omniflow_{type}_{...}_{userId}_{timestamp}[_promo:{code}]
    const parts = order_id?.split('_') || []
    const orderType = parts[1] // 'starter'/'pro'/'agency' OU 'credits'
    const isCreditsOrder = orderType === 'credits'

    // Extraire le code promo si présent
    let promoCode: string | null = null
    const promoMatch = order_id?.match(/_promo:([A-Z0-9]+)$/)
    if (promoMatch) promoCode = promoMatch[1]

    // Extraire userId
    const userIdPart = isCreditsOrder ? parts[3] : parts[3]
    const userId = userIdPart && userIdPart !== 'anon' ? userIdPart : null

    const supabase = await createAdminClient()

    // ── Trouver l'agence ──────────────────────────────────────────────
    let agencyId: string | null = null
    if (userId) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', userId)
        .single()
      agencyId = agency?.id || null
    }

    if (!agencyId) {
      // Fallback : chercher par order_id dans les transactions
      const { data: tx } = await supabase
        .from('credit_transactions')
        .select('agency_id')
        .eq('payment_id', payment_id)
        .single()
      agencyId = tx?.agency_id || null
    }

    if (!agencyId) {
      console.error(`[Webhook] Cannot find agency for order: ${order_id}`)
      return NextResponse.json({ received: true })
    }

    if (isCreditsOrder) {
      // ── ACHAT DE CRÉDITS ─────────────────────────────────────────────
      // Extraire le nombre de RUNs depuis l'order_id
      const runsMatch = order_id.match(/credits_(\d+)runs/)
      const runs = runsMatch ? parseInt(runsMatch[1]) : 1
      const creditsToAdd = runs * RUN_UNITS

      // Ajouter les crédits au solde
      const { data: existing } = await supabase
        .from('agency_credits')
        .select('balance, lifetime_purchased')
        .eq('agency_id', agencyId)
        .single()

      const currentBalance = existing?.balance || 0
      const newBalance = currentBalance + creditsToAdd

      await supabase
        .from('agency_credits')
        .upsert({
          agency_id: agencyId,
          balance: newBalance,
          lifetime_purchased: (existing?.lifetime_purchased || 0) + creditsToAdd,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'agency_id' })

      // Enregistrer la transaction
      await supabase.from('credit_transactions').insert({
        agency_id: agencyId,
        amount: creditsToAdd,
        balance_after: newBalance,
        type: 'purchase',
        description: `Achat ${runs} RUN${runs > 1 ? 's' : ''} (${creditsToAdd} crédits)`,
        feature: 'credits_purchase',
        payment_id: payment_id,
        promo_code: promoCode,
      })

      // Appliquer le code promo (bonus crédits si applicable)
      if (promoCode) {
        try {
          await fetch(`${APP_URL}/api/promos/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: promoCode,
              agencyId,
              appliedTo: 'credits',
              paymentId: payment_id,
            }),
          })
        } catch {}
      }

      console.log(`[Webhook] ✅ Credits added: +${creditsToAdd} → balance: ${newBalance} (agency: ${agencyId})`)
    } else {
      // ── ACTIVATION ABONNEMENT ────────────────────────────────────────
      const planId = orderType // starter, pro, agency
      const intervalPart = parts[2] // monthly, yearly

      if (!['starter', 'pro', 'agency'].includes(planId)) {
        console.error(`[Webhook] Unknown planId: ${planId}`)
        return NextResponse.json({ received: true })
      }

      const now = new Date()
      const periodEnd = intervalPart === 'yearly'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await supabase.from('agencies').update({
        plan_id: planId,
        subscription_status: 'active',
        subscription_id: payment_id,
        trial_ends_at: null,
        updated_at: now.toISOString(),
      }).eq('id', agencyId)

      // Enregistrer dans credit_transactions pour l'historique
      await supabase.from('credit_transactions').insert({
        agency_id: agencyId,
        amount: 0,
        balance_after: 0,
        type: 'purchase',
        description: `Abonnement ${planId} ${intervalPart} activé — ${price_amount}${price_currency?.toUpperCase()}`,
        feature: 'subscription',
        payment_id: payment_id,
        promo_code: promoCode,
      })

      // Appliquer le code promo
      if (promoCode) {
        try {
          await fetch(`${APP_URL}/api/promos/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: promoCode,
              agencyId,
              appliedTo: 'subscription',
              paymentId: payment_id,
            }),
          })
        } catch {}
      }

      console.log(`[Webhook] ✅ Subscription activated: ${planId} ${intervalPart} (agency: ${agencyId})`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
