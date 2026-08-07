'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'OmniFlow remplace-t-il complètement mes chatters ?',
    a: "Copilot assiste l'équipe existante. Full AI permet d'automatiser davantage le chatting selon les règles de l'agence.",
  },
  {
    q: "Est-ce que l'IA parle réellement comme ma créatrice ?",
    a: 'Chaque créatrice dispose de son Creator DNA : ton, vocabulaire, personnalité, style conversationnel et approche commerciale.',
  },
  {
    q: 'OmniFlow se souvient-il de chaque fan ?',
    a: 'OmniFlow est conçu pour maintenir une mémoire propre à chaque fan avec les informations pertinentes de son historique, ses préférences et ses interactions.',
  },
  {
    q: 'Puis-je utiliser mes propres scripts ?',
    a: "Oui. L'agence peut construire ses scénarios, étapes, offres et branches.",
  },
  {
    q: "Que se passe-t-il lorsqu'un fan n'achète pas ?",
    a: 'Les scripts peuvent déclencher une logique de non-achat : attente, relance, objection, alternative ou autre stratégie définie par l\'agence.',
  },
  {
    q: "L'IA peut-elle négocier ?",
    a: "Oui, lorsque cette capacité est activée, uniquement dans les limites définies par l'agence.",
  },
  {
    q: 'Puis-je reprendre une conversation Full AI ?',
    a: 'Oui. Le contrôle humain et le takeover restent disponibles à tout moment.',
  },
  {
    q: 'Comment fonctionne la commission de 2,5 % ?',
    a: "Elle s'applique sur les ventes éligibles gérées par l'IA, conformément aux règles commerciales finales, et est toujours indiquée clairement dans votre facturation.",
  },
  {
    q: 'Avec quelles plateformes OmniFlow fonctionne-t-il ?',
    a: "Les plateformes cibles sont OnlyFans et MYM. La disponibilité dépend des méthodes d'intégration autorisées réellement implémentées.",
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight md:text-4xl">
        Questions fréquentes
      </h2>

      <div className="glass divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-medium"
                aria-expanded={isOpen}
              >
                {item.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[color:var(--foreground-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className="grid overflow-hidden px-6 text-sm text-[color:var(--foreground-muted)] transition-all duration-300"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', paddingBottom: isOpen ? '1.25rem' : 0 }}
              >
                <div className="overflow-hidden">{item.a}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
