export type FanFlowStage = 'new' | 'connaissance' | 'pret' | 'spender'

export const FAN_FLOW_LABELS: Record<FanFlowStage, string> = {
  new: 'New',
  connaissance: 'Connaissance',
  pret: 'Prêt',
  spender: 'Spender',
}

// Derived from real signals we already have (purchases, message activity,
// AI purchase-intent score) — never a separate value to fabricate/maintain.
export function computeFanFlowStage({
  totalSpent,
  messageCount,
  purchaseIntent,
}: {
  totalSpent: number
  messageCount: number
  purchaseIntent: number | null
}): FanFlowStage {
  if (totalSpent > 0) return 'spender'
  if (purchaseIntent !== null && purchaseIntent >= 60) return 'pret'
  if (messageCount > 0) return 'connaissance'
  return 'new'
}
