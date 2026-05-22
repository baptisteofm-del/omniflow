'use client'
import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    text: 'On a supprimé 10 VAs en un mois. Le chatting IA gère tout, les revenus ont même augmenté.',
    author: 'Marco D.',
    company: 'EliteOFAgency',
    initials: 'MD',
    color: 'from-purple-500 to-purple-600',
    rating: 5,
  },
  {
    id: 2,
    text: 'La génération IA Kling c\'est une autre planète. Nos Reels font +40% d\'engagement depuis qu\'on l\'utilise.',
    author: 'Rayan M.',
    company: 'PremiumCreators',
    initials: 'RM',
    color: 'from-cyan-500 to-blue-600',
    rating: 5,
  },
  {
    id: 3,
    text: 'L\'analyse des fans mécontents nous a sauvé 3 gros abonnés ce mois. Outil indispensable.',
    author: 'Thomas R.',
    company: 'ScaleOF',
    initials: 'TR',
    color: 'from-pink-500 to-rose-600',
    rating: 5,
  },
  {
    id: 4,
    text: 'Setup en 20 min, premier post automatique dans l\'heure. Franchement je m\'attendais pas à ça.',
    author: 'Lucas P.',
    company: 'LuxeAgency',
    initials: 'LP',
    color: 'from-amber-500 to-orange-600',
    rating: 5,
  },
  {
    id: 5,
    text: 'J\'ai filé mon lien à quelques gérants que je connais. 5 agences parrainées, ça me fait 175€/mois sans rien faire.',
    author: 'Alexis K.',
    company: 'FlowAgency',
    initials: 'AK',
    color: 'from-green-500 to-emerald-600',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Ce que disent nos <span className="gradient-text">agences</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Des témoignages réels de gérants d'agences qui ont transformé leur workflow avec OmniFlow
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative group"
            >
              {/* Glass card */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300 backdrop-blur-xl" />

              <div className="relative p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-200 mb-6 leading-relaxed text-base">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {/* Avatar with initials */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                  </div>

                  <div>
                    <p className="font-semibold text-white text-sm">{testimonial.author}</p>
                    <p className="text-gray-500 text-xs">@{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
