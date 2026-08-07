import { Brain, MessagesSquare, Workflow, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Fan Memory',
    description:
      "Chaque fan est mémorisé durablement : préférences, historique d'achat, relation. OmniFlow ne repart jamais de zéro.",
  },
  {
    icon: MessagesSquare,
    title: 'Moteur de décision commerciale',
    description:
      "L'IA ne se contente pas de répondre : elle comprend le moment, choisit la stratégie et sait quand ne pas vendre.",
  },
  {
    icon: Workflow,
    title: 'Scripts &amp; branchement',
    description:
      "Des scénarios de vente structurés qui s'adaptent : acheté → étape suivante, pas acheté → relance intelligente.",
  },
  {
    icon: ShieldCheck,
    title: 'Prix &amp; règles sous contrôle',
    description:
      "Prix minimum, négociation autorisée ou non : l'IA ne peut jamais dépasser les limites que vous définissez.",
  },
]

export function ProductValue() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Plus qu&apos;un chatbot IA
        </h2>
        <p className="mt-4 text-[color:var(--foreground-muted)]">
          La force d&apos;OmniFlow vient de la combinaison de plusieurs systèmes, pas d&apos;un simple
          modèle de langage branché sur une interface de chat.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="glass rounded-2xl p-6">
            <div className="gradient-bg-signature mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
