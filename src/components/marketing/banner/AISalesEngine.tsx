import { Brain, Target, Sparkles, Workflow, ImagePlus, Handshake } from 'lucide-react'

const CAPABILITIES = [
  {
    icon: Brain,
    title: 'Une IA qui se souvient vraiment de chaque fan',
    description:
      "OmniFlow conserve les informations importantes : préférences, historique, achats, objections, habitudes et contexte relationnel. L'IA ne repart jamais de zéro à chaque conversation.",
  },
  {
    icon: Target,
    title: 'Chaque fan devient une opportunité commerciale comprise individuellement',
    description:
      'OmniFlow analyse notamment Purchase Intent, Spending Potential, Relationship et Churn Risk — pour savoir quand discuter, quand attendre, quand vendre et quoi proposer.',
  },
  {
    icon: Sparkles,
    title: 'La bonne offre, au bon fan, au bon moment',
    description:
      "OmniFlow ne balance pas des offres au hasard. Il analyse la conversation, l'intention, la relation, l'historique et le contexte avant de choisir la meilleure action commerciale.",
  },
  {
    icon: Workflow,
    title: 'Des scripts qui s\'adaptent à la réaction du fan',
    description:
      "L'agence construit ses scénarios. OmniFlow adapte ensuite le flow : achat → étape suivante, non-achat → relance, hésitation → gestion d'objection, négociation → logique dédiée.",
  },
  {
    icon: ImagePlus,
    title: 'Le bon contenu et le bon prix',
    description:
      'OmniFlow peut sélectionner le média adapté au contexte parmi les contenus autorisés et construire l\'offre correspondante, dans les limites fixées par l\'agence.',
  },
  {
    icon: Handshake,
    title: 'Négocie, relance et récupère des opportunités',
    description:
      "Selon les règles définies par l'agence, OmniFlow peut gérer certaines objections, négocier dans les limites autorisées, relancer, adapter l'offre ou escalader vers un humain.",
  },
]

const COMPLEMENTARY = [
  'Creator DNA',
  'Custom Content',
  'Smart Follow-ups',
  'A/B Testing',
  'Analytics',
  'Human Takeover',
  'Full AI 24/7',
]

export function AISalesEngine() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Pas un chatbot. Un véritable moteur de vente IA.
        </h2>
        <p className="mt-4 text-[color:var(--foreground-muted)]">
          OmniFlow ne se contente pas de répondre aux messages. Il comprend chaque fan, construit
          la relation, détecte les opportunités de vente et choisit la meilleure action pour
          maximiser la performance commerciale.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="glass rounded-2xl p-6">
            <div className="glow-sm mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
              <Icon className="h-5 w-5 text-[color:var(--cyan)]" strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-[color:var(--foreground-muted)]">{description}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-2xl px-6 py-5">
        {COMPLEMENTARY.map((item, i) => (
          <span key={item} className="flex items-center gap-3 text-sm text-[color:var(--foreground-muted)]">
            {item}
            {i < COMPLEMENTARY.length - 1 && <span aria-hidden="true">•</span>}
          </span>
        ))}
      </div>
    </section>
  )
}
