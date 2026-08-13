import { FAN_FLOW_LABELS, FAN_FLOW_BG_CLASSES, type FanFlowStage } from '@/lib/fans/fanFlow'

const STAGES: FanFlowStage[] = ['new', 'connaissance', 'pret', 'spender']

const STAGE_DESCRIPTIONS: Record<FanFlowStage, string> = {
  new: "Pas encore de signal d'engagement ou d'achat.",
  connaissance: "Échange activement avec la créatrice, pas encore d'intention d'achat forte détectée.",
  pret: "Intention d'achat élevée détectée par l'IA — moment propice pour une offre.",
  spender: 'A déjà dépensé — acheteur à fidéliser.',
}

export function FanFlowBar({ stage, totalSpent }: { stage: FanFlowStage; totalSpent: number }) {
  const currentIndex = STAGES.indexOf(stage)

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {STAGES.map((s, i) => (
          <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            {i <= currentIndex && <div className={`h-full w-full ${FAN_FLOW_BG_CLASSES[stage]}`} />}
          </div>
        ))}
      </div>
      <div className="mb-3 flex text-[9px] uppercase tracking-wide text-[color:var(--foreground-muted)]">
        {/* min-w-0 is load-bearing here — a flex item's default min-width is
            "auto" (its content's intrinsic width), so without it a long
            label like "CONNAISSANCE" refuses to shrink and pushes the row
            past the panel's edge (the "hors du cadre" bug). */}
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={`min-w-0 flex-1 truncate ${i > 0 ? 'text-center' : ''} ${i === STAGES.length - 1 ? 'text-right' : ''} ${
              s === stage ? 'font-semibold text-[color:var(--foreground)]' : ''
            }`}
          >
            {FAN_FLOW_LABELS[s]}
          </span>
        ))}
      </div>
      <div className="rounded-xl border border-[color:var(--border)] p-3">
        <p className="mb-1 text-xs font-semibold text-[color:var(--foreground)]">{FAN_FLOW_LABELS[stage]}</p>
        <p className="text-xs text-[color:var(--foreground-muted)]">{STAGE_DESCRIPTIONS[stage]}</p>
        {totalSpent > 0 && (
          <span className="mt-2 inline-block rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 text-[10px] text-[color:var(--success)]">
            {totalSpent}€ dépensé
          </span>
        )}
      </div>
    </div>
  )
}
