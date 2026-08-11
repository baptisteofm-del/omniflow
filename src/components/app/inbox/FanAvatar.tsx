const PALETTE = ['#8b5cf6', '#22d3ee', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#f87171', '#a3e635']

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function FanAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: colorFor(name) }}
    >
      {initial}
    </div>
  )
}
