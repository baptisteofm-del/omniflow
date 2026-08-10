export type RangeKey = '7d' | '30d' | '90d' | 'all'

export const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
  all: 'Depuis le début',
}

export function resolveRange(key: string | undefined): { key: RangeKey; from: string; to: string } {
  const rangeKey: RangeKey = key === '7d' || key === '90d' || key === 'all' ? key : '30d'
  const to = new Date()
  const from = new Date(to)
  if (rangeKey === '7d') from.setDate(from.getDate() - 7)
  else if (rangeKey === '30d') from.setDate(from.getDate() - 30)
  else if (rangeKey === '90d') from.setDate(from.getDate() - 90)
  else from.setFullYear(from.getFullYear() - 10) // 'all': far enough back to include everything

  return { key: rangeKey, from: from.toISOString(), to: to.toISOString() }
}
