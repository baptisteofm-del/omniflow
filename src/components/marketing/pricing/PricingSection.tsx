import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    id: 'copilot',
    name: 'Copilot',
    price: '99',
    period: '/mois',
    tagline: "Gardez vos chatters, augmentez leur performance",
    features: [
      'Interface de chatting IA',
      'Fan Memory &amp; Fan Intelligence',
      'Recommandations de réponse, script, média, prix',
      'Analytics &amp; suivi de performance',
    ],
    cta: 'Commencer avec Copilot',
    highlight: false,
  },
  {
    id: 'full_ai',
    name: 'Full AI',
    price: '199',
    period: '/mois + 2,5%',
    tagline: 'Automatisation complète, dans vos règles',
    features: [
      'Tout Copilot, plus :',
      "Réponses et ventes automatiques dans les limites définies",
      'Prise de décision commerciale autonome',
      'Reprise humaine instantanée à tout moment',
    ],
    cta: 'Commencer avec Full AI',
    highlight: true,
    badge: 'RECOMMANDÉ',
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Tarifs simples</h2>
        <p className="mt-4 text-[color:var(--foreground-muted)]">
          Un abonnement fixe, et pour Full AI une commission de 2,5% uniquement sur les ventes
          effectivement gérées par l&apos;IA — bien en dessous du coût variable d&apos;un chatter classique.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-8 ${
              plan.highlight
                ? 'gradient-bg-signature glow'
                : 'glass'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                {plan.badge}
              </span>
            )}
            <h3 className={`text-xl font-semibold ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
            <p className={`mt-1 text-sm ${plan.highlight ? 'text-white/80' : 'text-[color:var(--foreground-muted)]'}`}>
              {plan.tagline}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className={`text-4xl font-semibold ${plan.highlight ? 'text-white' : ''}`}>{plan.price}€</span>
              <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-[color:var(--foreground-muted)]'}`}>
                {plan.period}
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-[color:var(--cyan)]'}`} />
                  <span className={plan.highlight ? 'text-white/90' : 'text-[color:var(--foreground-muted)]'}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.02] ${
                plan.highlight ? 'bg-white text-black' : 'gradient-bg-signature text-white'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs text-[color:var(--foreground-muted)]">
        Prix de lancement, modifiables avant commercialisation officielle. La commission de 2,5%
        s&apos;applique uniquement au périmètre de ventes géré par OmniFlow AI et est toujours indiquée
        clairement dans votre facturation.
      </p>
    </section>
  )
}
