import type { SupabaseClient } from '@supabase/supabase-js'
import { validatePrice, PricingViolationError, PricingNotConfiguredError } from '@/lib/pricing/validator'
import { isFullAiKilled } from '@/lib/ai/killSwitch'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// The Action Validator (spec 4.16/4.21): the deterministic, server-side gate
// every Full AI action must pass before it can execute. "Un LLM ne doit
// jamais avoir le dernier mot sur une contrainte déterministe" — this file
// never trusts the model's own confidence framing or its choice of media, it
// re-checks everything against the database. If a single check fails: DO NOT
// EXECUTE (spec 4.16) — the caller (src/lib/ai/fullAi.ts) always escalates
// to a human on a rejection here, never retries or silently downgrades.
//
// Confidence thresholds are fixed constants for this first pass, not yet an
// agency-configurable setting (spec 10.8 anticipates that) — see TECH_DEBT.
const CONFIDENCE_THRESHOLD = {
  send_message: 0.7,
  send_paid_offer: 0.85,
} as const

interface ValidationContext {
  agencyId: string
  creatorId: string
  confidence: number
}

interface ValidationResult {
  ok: boolean
  reason: string | null
}

export async function validateReply(supabase: AnySupabaseClient, ctx: ValidationContext): Promise<ValidationResult> {
  const kill = await isFullAiKilled(supabase, ctx.agencyId, ctx.creatorId, 'send_message')
  if (kill.killed) return { ok: false, reason: `Coupure IA active${kill.reason ? ` (${kill.reason})` : ''}` }

  if (ctx.confidence < CONFIDENCE_THRESHOLD.send_message) {
    return { ok: false, reason: `Confiance insuffisante (${ctx.confidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD.send_message})` }
  }

  return { ok: true, reason: null }
}

interface ValidatedMedia {
  id: string
  target_price: number
  minimum_price: number | null
  is_for_sale: boolean
  status: string
  creator_id: string
  standalone_allowed: boolean
}

export async function validateOffer(
  supabase: AnySupabaseClient,
  ctx: ValidationContext,
  mediaAssetId: string
): Promise<{ ok: boolean; reason: string | null; media: ValidatedMedia | null }> {
  const kill = await isFullAiKilled(supabase, ctx.agencyId, ctx.creatorId, 'send_paid_offer')
  if (kill.killed) return { ok: false, reason: `Coupure IA active${kill.reason ? ` (${kill.reason})` : ''}`, media: null }

  if (ctx.confidence < CONFIDENCE_THRESHOLD.send_paid_offer) {
    return {
      ok: false,
      reason: `Confiance insuffisante (${ctx.confidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD.send_paid_offer})`,
      media: null,
    }
  }

  // Re-fetch from the DB rather than trusting anything the model said about
  // this media beyond its id — the model was only ever shown a whitelist of
  // ids, never asked to state a price.
  const { data: media } = await supabase
    .from('media_assets')
    .select('id, target_price, minimum_price, is_for_sale, status, creator_id, standalone_allowed')
    .eq('id', mediaAssetId)
    .maybeSingle()

  if (!media || media.creator_id !== ctx.creatorId || media.status !== 'active' || !media.standalone_allowed) {
    return { ok: false, reason: 'Média invalide, indisponible, ou non utilisable hors script', media: null }
  }

  // Pricing Validator (spec 15.28), same hard gate used everywhere else a
  // price gets sent — Full AI always offers at the media's own target_price,
  // never a value the model wrote itself (no negotiation engine exists yet).
  try {
    validatePrice(media.target_price, media)
  } catch (err) {
    const reason = err instanceof PricingViolationError || err instanceof PricingNotConfiguredError ? err.message : 'Prix invalide'
    return { ok: false, reason, media: null }
  }

  return { ok: true, reason: null, media }
}
