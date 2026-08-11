// Single source for number/date formatting used across Analytics and the
// Dashboard — avoids two pages silently drifting on how a euro amount or a
// percentage gets rounded/displayed.

export function formatEuro(n: number) {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

export function formatPercent(n: number | null) {
  if (n === null) return '—'
  return `${Math.round(n * 100)}%`
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}
