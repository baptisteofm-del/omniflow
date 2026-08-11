const PALETTE = ['#8b5cf6', '#22d3ee', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#f87171', '#a3e635']

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

// Real photo when a synced platform provides one (MYM's API returns
// avatar_url per fan — see fans.avatar_url, 0022_fan_avatar_subscriber.sql).
// Falls back to a deterministic colored initial for Mock/photo-less fans.
export function FanAvatar({ name, avatarUrl, size = 40 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const initial = (name.trim()[0] || '?').toUpperCase()

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: colorFor(name) }}
    >
      {initial}
    </div>
  )
}
