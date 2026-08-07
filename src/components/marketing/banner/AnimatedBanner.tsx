interface AnimatedBannerProps {
  items: string[]
  reverse?: boolean
  durationSeconds?: number
}

function Strip({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8 px-8">
          <span className="gradient-text whitespace-nowrap text-sm font-medium tracking-wide md:text-base">
            {item}
          </span>
          <span className="text-[color:var(--border-strong)]">→</span>
        </span>
      ))}
    </div>
  )
}

export function AnimatedBanner({ items, reverse = false, durationSeconds = 26 }: AnimatedBannerProps) {
  return (
    <div className="glass overflow-hidden border-x-0 py-4">
      <div
        className="flex w-max motion-reduce:!animate-none"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${durationSeconds}s linear infinite`,
          willChange: 'transform',
        }}
      >
        <Strip items={items} />
        <Strip items={items} />
      </div>
    </div>
  )
}
