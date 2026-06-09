import {
  Eye, Film, Sparkles, Calendar, Bot, BarChart3,
  MessageSquare, Brain, Users, TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: 'Veille Trends',
    description: 'Analysez les contenus performants sur Instagram. Notre système apprend de vos likes/dislikes pour vous suggérer les tendances les plus adaptées à votre audience.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: Film,
    title: 'Éditeur vidéo & Spoof',
    description: 'Éditez vos Reels Instagram, appliquez un spoof métadonnées pour réutiliser le contenu sur plusieurs comptes sans shadowban.',
    color: 'from-cyan-500 to-cyan-700',
  },
  {
    icon: Sparkles,
    title: 'Génération IA',
    description: 'Générez des vidéos IA en quelques secondes. Automatisez votre production de contenu et optimisez votre workflow créatif.',
    color: 'from-pink-500 to-rose-700',
  },
  {
    icon: Calendar,
    title: 'Autoposting',
    description: 'Publication automatisée sur plusieurs comptes via ADS Power et GitArk. Gagnez du temps, automatisez votre workflow.',
    color: 'from-orange-500 to-amber-700',
  },
  {
    icon: Bot,
    title: 'Bots Telegram',
    description: 'Publiez automatiquement dans les canaux Telegram de vos modèles. Gestion sans intervention humaine, 24h/24.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: BarChart3,
    title: 'Dashboard financier',
    description: 'Toutes vos recettes et dépenses centralisées. Suivi par modèle, par plateforme, par période. Vos finances d\'agence en un coup d\'œil — plus besoin de tableaux Excel.',
    color: 'from-green-500 to-emerald-700',
  },
  {
    icon: MessageSquare,
    title: 'Analyse fans & opportunités',
    description: 'Bien plus qu\'un rapport : notre IA identifie les fans mécontents avant qu\'ils partent, les opportunités de vente manquées, et les heures de pic de conversion. Données actionnables, pas juste des chiffres.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: Brain,
    title: 'Chatting IA',
    description: 'Automatisez vos conversations, augmentez vos ventes et maximisez l\'engagement. Un véritable outil de conversion pour vos comptes OnlyFans.',
    color: 'from-fuchsia-500 to-pink-700',
  },
  {
    icon: Users,
    title: 'Prospection de modèles',
    description: 'Notre agent IA scrape les réseaux, identifie des créatrices à fort potentiel, et initie le contact en votre nom. Un pipeline de recrutement automatique qui tourne en fond.',
    color: 'from-teal-500 to-cyan-700',
  },
]

const tagColors: Record<string, string> = {}

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-6">
            <TrendingUp size={14} />
            Toutes les fonctionnalités
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Tous vos outils réunis en <span className="gradient-text">1 seule plateforme</span>. Plus de VAs, plus de perte de temps. Juste des résultats.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <f.icon size={22} className="text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
