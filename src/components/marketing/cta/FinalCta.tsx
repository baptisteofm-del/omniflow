import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
        Prêt à transformer votre chatting en moteur de revenus ?
      </h2>
      <div className="mt-8">
        <Link
          href="/register"
          className="gradient-bg-signature glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Commencer à augmenter mes revenus
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
