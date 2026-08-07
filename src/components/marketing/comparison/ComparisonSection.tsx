const ROWS: [string, string][] = [
  ['Coût variable important lié aux chatters', 'Abonnement + 2,5 % sur les ventes éligibles gérées par l\'IA'],
  ['Qualité variable selon personnes et shifts', 'Intelligence et règles cohérentes'],
  ['Informations facilement oubliées', 'Mémoire longue durée'],
  ['Difficulté à suivre individuellement chaque fan', 'Analyse et scoring individualisés'],
  ['Décisions commerciales difficiles à mesurer', 'Analytics et performance mesurables'],
  ['Dépendance à la disponibilité humaine', 'Full AI selon configuration'],
]

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Plus performant. Plus constant. Beaucoup moins coûteux.
        </h2>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-2 border-b border-[color:var(--border)] px-6 py-4 text-sm font-medium text-[color:var(--foreground-muted)]">
          <span>Chatting traditionnel</span>
          <span className="gradient-text">OmniFlow</span>
        </div>
        {ROWS.map(([traditional, omniflow]) => (
          <div
            key={traditional}
            className="grid grid-cols-2 border-b border-[color:var(--border)] px-6 py-4 text-sm last:border-b-0"
          >
            <span className="pr-4 text-[color:var(--foreground-muted)]">{traditional}</span>
            <span>{omniflow}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
