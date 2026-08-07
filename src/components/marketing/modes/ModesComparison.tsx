import { Check } from 'lucide-react'

const MODES = [
  {
    name: 'Copilot',
    tagline: 'Transformez chaque chatter en meilleur vendeur.',
    points: [
      'La meilleure réponse',
      'Le bon script',
      'Le bon média',
      'Le bon prix, dans les règles',
      'Le bon moment pour vendre',
    ],
    footer: 'Le chatter conserve la validation finale.',
  },
  {
    name: 'Full AI',
    tagline: 'Automatisez votre chatting de A à Z.',
    points: [
      'Comprend, répond et vend',
      'Négocie dans les limites autorisées',
      'Relance et suit les scripts',
      'Adapte ses décisions selon vos règles',
    ],
    footer: "L'humain peut reprendre la main à tout moment.",
    highlight: true,
  },
]

export function ModesComparison() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Vous choisissez jusqu&apos;où l&apos;IA travaille pour vous.
        </h2>
        <p className="mt-4 text-[color:var(--foreground-muted)]">
          Gardez votre équipe et démultipliez ses performances avec Copilot, ou automatisez votre
          chatting avec Full AI.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {MODES.map((mode) => (
          <div
            key={mode.name}
            className={`glass rounded-2xl p-8 ${mode.highlight ? 'border-[color:var(--border-strong)] glow-sm' : ''}`}
          >
            <h3 className="text-xl font-semibold">{mode.name}</h3>
            <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{mode.tagline}</p>
            <ul className="mt-6 space-y-3">
              {mode.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--cyan)]" />
                  <span className="text-[color:var(--foreground-muted)]">{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-[color:var(--border)] pt-4 text-xs text-[color:var(--foreground-muted)]">
              {mode.footer}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
