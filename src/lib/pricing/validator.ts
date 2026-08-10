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

export function resolveMinimumPrice(mediaAsset: { minimum_price: number }): number {
  return mediaAsset.minimum_price
}

// Throws PricingViolationError if the price is invalid. Never returns a
// "corrected" price silently — a caller must handle the rejection
// explicitly, never auto-substitute a value the agency didn't choose.
export function validatePrice(price: number, mediaAsset: { minimum_price: number }): void {
  if (!Number.isFinite(price) || price <= 0) {
    throw new PricingViolationError(price, resolveMinimumPrice(mediaAsset))
  }
  const minimum = resolveMinimumPrice(mediaAsset)
  if (price < minimum) {
    throw new PricingViolationError(price, minimum)
  }
}
