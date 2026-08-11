export type FanFlowStage = 'new' | 'connaissance' | 'pret' | 'spender'

export const FAN_FLOW_LABELS: Record<FanFlowStage, string> = {
  new: 'New',
  connaissance: 'Connaissance',
  pret: 'Prêt',
  spender: 'Spender',
}

// Shared color mapping — used by both the Fan Flow bar (inbox/[id]) and the
// conversation list's status badge (inbox), so a stage always reads the
// same color everywhere.
export const FAN_FLOW_BG_CLASSES: Record<FanFlowStage, string> = {
  new: 'bg-white/15',
  connaissance: 'bg-[color:var(--cyan)]',
  pret: 'bg-[color:var(--violet)]',
  spender: 'bg-[color:var(--success)]',
}

export const FAN_FLOW_BADGE_CLASSES: Record<FanFlowStage, string> = {
  new: 'border-[color:var(--border-strong)] text-[color:var(--foreground-muted)]',
  connaissance: 'border-[color:var(--cyan)]/40 text-[color:var(--cyan)]',
  pret: 'border-[color:var(--violet)]/40 text-[color:var(--violet)]',
  spender: 'border-[color:var(--success)]/40 text-[color:var(--success)]',
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
