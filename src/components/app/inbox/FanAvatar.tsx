const PALETTE = ['#8b5cf6', '#22d3ee', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#f87171', '#a3e635']

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

// Real photo when a synced platform provides one (MYM's API returns
// avatar_url per fan — see fans.avatar_url, 0022_fan_avatar_subscriber.sql).
// Falls back to a deterministic colored initial for Mock/photo-less fans.
// `online` renders a small corner dot — derived from last_seen_at recency,
// not a live connection (see 0023_fan_presence.sql), so keep it subtle.
export function FanAvatar({
  name,
  avatarUrl,
  online,
  size = 40,
}: {
  name: string
  avatarUrl?: string | null
  online?: boolean
  size?: number
}) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  const dotSize = Math.max(8, Math.round(size * 0.28))

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: colorFor(name) }}
        >
          {initial}
        </div>
      )}
      {online && (
        <span
          className="absolute rounded-full border-2 border-[color:var(--background)] bg-[color:var(--success)]"
          style={{ width: dotSize, height: dotSize, right: -1, bottom: -1 }}
        />
      )}
    </div>
  )
}
