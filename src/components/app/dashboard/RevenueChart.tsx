'use client'

import { useMemo, useState } from 'react'
import type { RevenuePoint } from '@/lib/analytics/metrics'
import { formatEuro } from '@/lib/format'

const WIDTH = 800
const HEIGHT = 220
const PAD_LEFT = 44
const PAD_RIGHT = 12
const PAD_TOP = 16
const PAD_BOTTOM = 28

// Single-series trend chart (dataviz skill: "trend over time" → line/area,
// sequential/1-hue color job — a legend box would be redundant since the
// chart title already names the one series plotted). Uses OmniFlow's own
// brand hue rather than the generic categorical palette, per the owner's
// "utiliser intelligemment les couleurs OmniFlow" direction.
export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { path, areaPath, xForIndex, yForValue, niceMax, yTicks } = useMemo(() => {
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
    const maxRevenue = Math.max(...points.map((p) => p.revenue), 0)
    // Round the axis ceiling to a clean number (dataviz: "Y-axis ticks:
    // round to clean numbers") instead of the raw max.
    const magnitude = maxRevenue > 0 ? Math.pow(10, Math.floor(Math.log10(maxRevenue))) : 1
    const niceMax = maxRevenue > 0 ? Math.ceil((maxRevenue * 1.15) / magnitude) * magnitude : 10

    const xForIndex = (i: number) => PAD_LEFT + (points.length > 1 ? (i / (points.length - 1)) * plotWidth : plotWidth / 2)
    const yForValue = (v: number) => PAD_TOP + plotHeight - (niceMax > 0 ? (v / niceMax) * plotHeight : 0)

    const linePoints = points.map((p, i) => `${xForIndex(i)},${yForValue(p.revenue)}`)
    const path = linePoints.length > 0 ? `M${linePoints.join(' L')}` : ''
    const areaPath =
      linePoints.length > 0
        ? `M${xForIndex(0)},${yForValue(0)} L${linePoints.join(' L')} L${xForIndex(points.length - 1)},${yForValue(0)} Z`
        : ''

    const yTicks = [0, 0.5, 1].map((f) => Math.round(niceMax * f))

    return { path, areaPath, xForIndex, yForValue, niceMax, yTicks }
  }, [points])

  const hovered = hoverIndex !== null ? points[hoverIndex] : null
  const total = points.reduce((sum, p) => sum + p.revenue, 0)

  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    if (points.length <= 1) {
      setHoverIndex(0)
      return
    }
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
    const ratio = Math.min(1, Math.max(0, (relX - PAD_LEFT) / plotWidth))
    setHoverIndex(Math.round(ratio * (points.length - 1)))
  }

  if (points.length === 0 || total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-xs text-[color:var(--foreground-muted)]">
        Aucune vente sur cette période.
      </div>
    )
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ height: HEIGHT }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines — hairline, recessive, one step off the surface */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yForValue(tick)}
              y2={yForValue(tick)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={yForValue(tick) + 3} textAnchor="end" fontSize={9} fill="var(--foreground-muted)">
              {tick >= 1000 ? `${Math.round(tick / 100) / 10}k€` : `${tick}€`}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#revenueFill)" />
        <path d={path} fill="none" stroke="var(--violet)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* End marker — >=8px, filled, 2px surface ring */}
        {points.length > 0 && (
          <circle
            cx={xForIndex(points.length - 1)}
            cy={yForValue(points[points.length - 1].revenue)}
            r={5}
            fill="var(--violet)"
            stroke="var(--background)"
            strokeWidth={2}
          />
        )}

        {/* Crosshair + hover marker */}
        {hovered && hoverIndex !== null && (
          <g>
            <line
              x1={xForIndex(hoverIndex)}
              x2={xForIndex(hoverIndex)}
              y1={PAD_TOP}
              y2={HEIGHT - PAD_BOTTOM}
              stroke="var(--foreground-muted)"
              strokeOpacity={0.35}
              strokeWidth={1}
            />
            <circle
              cx={xForIndex(hoverIndex)}
              cy={yForValue(hovered.revenue)}
              r={5}
              fill="var(--violet)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          </g>
        )}

        {/* X-axis labels — sparse, never one per bucket past a handful of points */}
        {points
          .filter((_, i) => points.length <= 8 || i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
          .map((p) => {
            const i = points.indexOf(p)
            return (
              <text key={p.bucketStart} x={xForIndex(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="var(--foreground-muted)">
                {p.label}
              </text>
            )
          })}

        {/* Hover hit target — bigger than the mark, per interaction spec */}
        <rect
          x={PAD_LEFT}
          y={0}
          width={WIDTH - PAD_LEFT - PAD_RIGHT}
          height={HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="glass pointer-events-none absolute top-2 rounded-xl px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${Math.min(85, Math.max(2, (xForIndex(hoverIndex!) / WIDTH) * 100))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[10px] text-[color:var(--foreground-muted)]">{hovered.label}</p>
          <p className="font-semibold">{formatEuro(hovered.revenue)}</p>
        </div>
      )}
    </div>
  )
}
