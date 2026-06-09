'use client'
import { Send, Clock, CheckCircle, MessageCircle, Zap } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen py-24 px-4 gradient-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Support en ligne
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Besoin d'aide ?
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Notre équipe est disponible sur Telegram pour répondre à toutes vos questions.
          </p>
        </div>

        {/* Telegram card — full width, premium */}
        <div className="glass rounded-3xl p-10 border border-blue-500/30 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
              <Zap size={11} />
              Réponse garantie en moins d'1h
            </div>

            <div className="flex items-start gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Send size={28} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Support Telegram</h2>
                <p className="text-gray-400 leading-relaxed">
                  Contactez directement notre équipe via Telegram. 
                  Nous traitons chaque demande personnellement et vous apportons 
                  une réponse claire et rapide.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass rounded-xl p-4 text-center border border-white/5">
                <Clock size={18} className="text-blue-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">{'< 1h'}</p>
                <p className="text-gray-500 text-xs mt-0.5">Temps de réponse</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-white/5">
                <MessageCircle size={18} className="text-cyan-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">24/7</p>
                <p className="text-gray-500 text-xs mt-0.5">Disponibilité</p>
              </div>
              <div className="glass rounded-xl p-4 text-center border border-white/5">
                <CheckCircle size={18} className="text-green-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">100%</p>
                <p className="text-gray-500 text-xs mt-0.5">Résolution</p>
              </div>
            </div>

            {/* CTA */}
            <a
              href="https://t.me/omniflowsupport"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-2xl font-semibold text-white text-base transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01]"
            >
              <Send size={18} />
              Ouvrir le support Telegram
            </a>

            <p className="text-center text-gray-600 text-xs mt-4">
              Vous serez redirigé vers notre canal de support dédié
            </p>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Une question courante ?{' '}
            <a href="/faq" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Consultez notre FAQ
            </a>
            {' '}ou utilisez le widget support en bas à droite.
          </p>
        </div>
      </div>
    </div>
  )
}
