'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative h-40 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              404
            </span>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-3xl" />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Page introuvable</h1>
          <p className="text-gray-400">
            Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            <Home size={18} />
            Accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>

        {/* Quick links */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-gray-500 mb-4">Parcourir :</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="text-sm text-purple-400 hover:text-purple-300">Accueil</Link>
            <span className="text-gray-700">•</span>
            <Link href="/contact" className="text-sm text-purple-400 hover:text-purple-300">Support</Link>
            <span className="text-gray-700">•</span>
            <Link href="/docs" className="text-sm text-purple-400 hover:text-purple-300">Documentation</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
