'use client'
import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Zap, Shield } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

const stats = [
  { label: 'Agences actives', target: 50, suffix: '+' },
  { label: 'Modèles gérés', target: 500, suffix: '+' },
  { label: 'Posts automatisés/mois', target: 10000, suffix: '+' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-bg pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-8">
          <Zap size={14} className="text-purple-400" />
          <span>La plateforme #1 des agences OnlyFans</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Automatisez votre{' '}
          <span className="gradient-text">agence OnlyFans</span>
          <br />
          de A à Z
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-10 px-2">
          Moins de gestion d'équipe, plus de scalabilité. OmniFlow réduit vos coûts de VA, automatise le posting sur tous vos comptes, et vous donne enfin le temps de faire grandir votre agence.
        </p>

        {/* CTAs */}
        <div className="flex flex-col w-full sm:flex-row items-center justify-center gap-3 mb-12 px-4 sm:px-0">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-base sm:text-lg hover:opacity-90 transition-all glow"
          >
            Démarrer l'essai gratuit 7 jours
            <ArrowRight size={18} className="hidden sm:inline" />
          </Link>
          <a href="#demos" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 glass rounded-xl font-medium text-gray-300 hover:text-white transition-all">
            <Play size={16} className="text-purple-400" />
            Voir la démo
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-12 px-4">
          {stats.map((s) => (
            <AnimatedCounter key={s.label} target={s.target} suffix={s.suffix} label={s.label} />
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-green-400" />
            Essai 7j - Carte requise
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-purple-400" />
            Setup rapide
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" />
            Annulation à tout moment
          </div>
        </div>
      </div>
    </section>
  )
}
