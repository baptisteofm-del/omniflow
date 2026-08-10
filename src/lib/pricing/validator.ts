// Pricing Validator (spec 15.28). Every price that ever gets sent to a fan
// must pass through here, server-side, before it's persisted or sent.
// "THE AI CAN NEGOTIATE. IT CAN NEVER INVENT ITS OWN LIMITS." (spec 15.1)
//
// Hierarchy today (spec 15.4: "the most restrictive valid limit wins") is
// just the media rule — agency/creator/script-level minimum overrides don't
// exist as settings yet (no general pricing config beyond a media's own
// minimum_price). Extend resolveMinimumPrice() as those are added; nothing
// calling validatePrice() needs to change.

export class PricingViolationError extends Error {
  constructor(price: number, minimum: number) {
    super(`Prix refusé : ${price}€ est sous le minimum autorisé (${minimum}€). Le prix minimum ne peut jamais être contourné.`)
    this.name = 'PricingViolationError'
  }
}

// Distinct from a violation: the media simply has no minimum price set yet
// (owner left it blank at upload — "l'IA décidera du prix minimum" per spec
// 15's future capability, not built yet) or isn't for sale at all.
export class PricingNotConfiguredError extends Error {
  constructor(reason: 'no_minimum' | 'not_for_sale') {
    super(
      reason === 'not_for_sale'
        ? "Ce média est marqué gratuit / hors vente — il ne peut pas être utilisé dans une offre payante."
        : "Ce média n'a pas encore de prix minimum défini — configurez-en un avant de l'utiliser dans une offre payante."
    )
    this.name = 'PricingNotConfiguredError'
  }
}

interface PriceableMedia {
  minimum_price: number | null
  is_for_sale?: boolean
}

export function resolveMinimumPrice(mediaAsset: PriceableMedia): number | null {
  return mediaAsset.minimum_price
}

// Throws on any invalid state. Never returns a "corrected" price silently —
// a caller must handle the rejection explicitly, never auto-substitute a
// value the agency didn't choose.
export function validatePrice(price: number, mediaAsset: PriceableMedia): void {
  if (mediaAsset.is_for_sale === false) {
    throw new PricingNotConfiguredError('not_for_sale')
  }
  const minimum = resolveMinimumPrice(mediaAsset)
  if (minimum === null || minimum === undefined) {
    throw new PricingNotConfiguredError('no_minimum')
  }
  if (!Number.isFinite(price) || price <= 0 || price < minimum) {
    throw new PricingViolationError(price, minimum)
  }
}
