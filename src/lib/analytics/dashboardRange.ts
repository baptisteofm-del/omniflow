import type { DateRange } from '@/lib/analytics/metrics'

export type DashboardRangeKey = 'today' | 'yesterday' | '3d' | '7d' | 'custom'

export const DASHBOARD_RANGE_LABELS: Record<DashboardRangeKey, string> = {
  today: "Aujourd'hui",
  yesterday: 'Hier',
  '3d': '3 derniers jours',
  '7d': '7 derniers jours',
  custom: 'Personnalisé',
}

export interface ResolvedDashboardRange {
  key: DashboardRangeKey
  range: DateRange
  customFrom?: string
  customTo?: string
}

// Mirrors src/lib/analytics/dateRange.ts's resolveRange() pattern but with
// the shorter, more granular presets the Dashboard's central chart needs
// (spec brief section 5) — Analytics keeps its own 7d/30d/90d/all set,
// deliberately not reused here since the two pages answer different
// questions (today's operations vs. period-over-period analysis).
export function resolveDashboardRange(key: string | undefined, fromParam?: string, toParam?: string): ResolvedDashboardRange {
  if (key === 'custom' && fromParam && toParam) {
    const from = new Date(fromParam)
    const to = new Date(toParam)
    to.setHours(23, 59, 59, 999)
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      return { key: 'custom', range: { from: from.toISOString(), to: to.toISOString() }, customFrom: fromParam, customTo: toParam }
    }
  }

  const rangeKey: DashboardRangeKey = key === 'today' || key === 'yesterday' || key === '3d' ? key : '7d'
  const now = new Date()

  if (rangeKey === 'today') {
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)
    return { key: rangeKey, range: { from: from.toISOString(), to: now.toISOString() } }
  }
  if (rangeKey === 'yesterday') {
    const from = new Date(now)
    from.setDate(from.getDate() - 1)
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setHours(23, 59, 59, 999)
    return { key: rangeKey, range: { from: from.toISOString(), to: to.toISOString() } }
  }
  const days = rangeKey === '3d' ? 3 : 7
  const from = new Date(now)
  from.setDate(from.getDate() - (days - 1))
  from.setHours(0, 0, 0, 0)
  return { key: rangeKey, range: { from: from.toISOString(), to: now.toISOString() } }
}
