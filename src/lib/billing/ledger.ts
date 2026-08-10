import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

export type TransactionType =
  | 'subscription'
  | 'message_purchase'
  | 'media_purchase'
  | 'tip'
  | 'custom_content'
  | 'live_session'
  | 'other'

// Commission Base (spec 22.5) — deliberately conservative pending legal/
// commercial validation (spec explicitly warns against an ambiguous
// definition). Direct content sales are eligible; the platform's own
// subscription fee is not (a different revenue stream than Chatting-driven
// sales). See TECH_DEBT.md.
const ELIGIBLE_TRANSACTION_TYPES: TransactionType[] = [
  'message_purchase',
  'media_purchase',
  'custom_content',
  'live_session',
  'tip',
]

const DEFAULT_COMMISSION_RATE = 0.025

// Monetary precision (spec 22.7: "éviter les floats imprécis"). Working in
// integer cents avoids compounding float error from multiplying two
// fractional numbers directly (e.g. 39 * 0.025 in raw JS floats can land a
// hair off .975 before rounding) — round the gross amount to cents FIRST,
// then apply the rate to that integer.
function computeCommissionCents(grossAmount: number, rate: number): number {
  const grossCents = Math.round(grossAmount * 100)
  return Math.round(grossCents * rate)
}

interface RecordTransactionInput {
  agencyId: string
  creatorId: string
  fanId: string
  conversationId?: string | null
  offerId?: string | null
  messageId?: string | null
  transactionType: TransactionType
  grossAmount: number
  currency?: string
}

// The single place a confirmed sale becomes a financial record (spec
// 28.53-28.59): one `transactions` row, one `transaction_attribution` row
// (conservative — 'unknown' unless traceable to a real script/Full AI
// decision), and one `commission_ledger` row with the rate snapshotted at
// creation time so a future pricing change never rewrites past periods
// (spec 22.4/28.58). Called from the one place a mock sale is confirmed
// today (simulatePurchase, src/lib/inbox/actions.ts).
export async function recordTransactionAndCommission(supabase: AnySupabaseClient, input: RecordTransactionInput) {
  const currency = input.currency ?? 'EUR'

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      agency_id: input.agencyId,
      creator_id: input.creatorId,
      fan_id: input.fanId,
      conversation_id: input.conversationId ?? null,
      offer_id: input.offerId ?? null,
      message_id: input.messageId ?? null,
      transaction_type: input.transactionType,
      gross_amount: input.grossAmount,
      currency,
    })
    .select('id')
    .single()
  if (transactionError || !transaction) throw new Error(transactionError?.message || 'Échec de l’enregistrement de la transaction')

  // Attribution: only traceable via a real offer whose source is a script
  // node or a Full AI decision — never guessed from conversation mode alone
  // (spec 44.12/28.56).
  let attributionType: 'full_ai' | 'script' | 'unknown' = 'unknown'
  let scriptRunId: string | null = null
  let aiDecisionId: string | null = null
  if (input.offerId) {
    const { data: offer } = await supabase
      .from('offers')
      .select('source_type, source_id, ai_decision_id')
      .eq('id', input.offerId)
      .maybeSingle()
    if (offer?.source_type === 'full_ai') {
      attributionType = 'full_ai'
      aiDecisionId = offer.ai_decision_id ?? null
    } else if (offer?.source_type === 'script_node') {
      attributionType = 'script'
      const { data: node } = await supabase.from('script_nodes').select('script_version_id').eq('id', offer.source_id).maybeSingle()
      if (node) {
        const { data: run } = await supabase
          .from('script_runs')
          .select('id')
          .eq('script_version_id', node.script_version_id)
          .eq('conversation_id', input.conversationId ?? '')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        scriptRunId = run?.id ?? null
      }
    }
  }

  await supabase.from('transaction_attribution').insert({
    agency_id: input.agencyId,
    transaction_id: transaction.id,
    attribution_type: attributionType,
    ai_decision_id: aiDecisionId,
    script_run_id: scriptRunId,
  })

  const rate = DEFAULT_COMMISSION_RATE
  const eligible = ELIGIBLE_TRANSACTION_TYPES.includes(input.transactionType)
  const eligibleAmount = eligible ? input.grossAmount : 0
  const commissionAmount = eligible ? computeCommissionCents(input.grossAmount, rate) / 100 : 0
  const billingPeriod = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  await supabase.from('commission_ledger').insert({
    agency_id: input.agencyId,
    transaction_id: transaction.id,
    commission_rate: rate,
    eligible_amount: eligibleAmount,
    commission_amount: commissionAmount,
    currency,
    billing_period: billingPeriod,
  })

  return { transactionId: transaction.id as string, commissionAmount }
}
