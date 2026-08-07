import { Check } from 'lucide-react'

const MODES = [
  {
    name: 'Copilot',
    tagline: 'Humain + intelligence OmniFlow',
    points: [
      "L'IA analyse, recommande et rédige",
      'Le chatter garde le contrôle de l\'envoi',
      'Suggestions de scripts, médias et prix',
      'Mesure de la performance de chaque suggestion',
    ],
  },
  {
    name: 'Full AI',
    tagline: 'Automatisation + intelligence OmniFlow',
    points: [
      'Répond, négocie et vend dans les limites que vous fixez',
      'Reprise humaine possible à tout instant',
      'Validateur de règles avant chaque action',
      'Kill switch global, par agence ou par créatrice',
    ],
    highlight: true,
  },
]

export function ModesComparison() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Deux modes, un seul niveau d&apos;exigence
        </h2>
        <p className="mt-4 text-[color:var(--foreground-muted)]">
          Vous choisissez le niveau d&apos;autonomie. OmniFlow apporte l&apos;intelligence, votre agence
          définit les règles.
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
          </div>
        ))}
      </div>
    </section>
  )
}
