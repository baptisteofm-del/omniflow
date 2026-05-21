import { ArrowRight, Lightbulb, Zap, Focus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'À propos | Omniflow',
  description: 'Omniflow — La plateforme de référence pour les agences OnlyFans',
}

export default function AboutPage() {
  const beliefs = [
    {
      icon: Lightbulb,
      title: "L'automatisation libère la créativité",
      description:
        'Moins de tâches répétitives = plus de temps pour ce qui compte vraiment',
    },
    {
      icon: Zap,
      title: 'Les données font la différence',
      description: 'Comprendre ses fans, c\'est les fidéliser. Chaque insight compte.',
    },
    {
      icon: Focus,
      title: 'Simple > Complexe',
      description:
        'Un outil que vous utilisez vraiment vaut mieux que 10 que vous ignorez',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-transparent">
      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8">
            On a créé Omniflow parce qu'on en avait <span className="gradient-text">marre</span>
          </h1>

          <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Omniflow est né d'une frustration simple : gérer une agence OnlyFans en 2024 demande
              encore trop d'humain pour des tâches que des machines devraient faire. Publier du
              contenu, animer des Telegram, analyser les fans, recruter des modèles — tout ça se
              faisait à la main, avec des VAs, des erreurs, et du temps perdu.
            </p>
            <p className="text-white font-semibold">On a décidé de changer ça.</p>
          </div>
        </div>
      </section>

      {/* Mission section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Notre mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Donner aux agences les outils des grandes entreprises tech. Automatisation intelligente,
              sans sacrifier la qualité ni le contrôle.
            </p>
          </div>
        </div>
      </section>

      {/* Beliefs section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ce qu'on croit</h2>
            <p className="text-gray-400 text-lg">Les principes qui guident chaque décision chez Omniflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {beliefs.map((belief, index) => {
              const Icon = belief.icon
              return (
                <div
                  key={index}
                  className="glass rounded-2xl p-8 hover:border-purple-500/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{belief.title}</h3>
                  <p className="text-gray-400">{belief.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">L'équipe</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Omniflow est construit par des gens qui comprennent le business OF de l'intérieur. On
              gère des agences, on connaît les problèmes — et on les résout.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">✓ Fondateurs actifs</span>
              <span>•</span>
              <span className="flex items-center gap-1">✓ Support direct</span>
              <span>•</span>
              <span className="flex items-center gap-1">✓ Updates rapides</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre agence ?</h2>
          <p className="text-gray-400 text-lg mb-8">
            7 jours d'essai gratuit. Aucun engagement. Annulation en 1 clic.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all glow"
          >
            Démarrer votre essai
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  )
}
