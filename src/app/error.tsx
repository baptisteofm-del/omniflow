'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Mail } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md text-center space-y-8">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/20 to-orange-600/20 flex items-center justify-center border border-red-500/30">
            <AlertCircle size={40} className="text-red-400" />
          </div>
        </div>

        {/* Text */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Une erreur est survenue</h1>
          <p className="text-gray-400">
            Quelque chose s'est mal passé. Essayez de rafraîchir la page ou contactez le support.
          </p>
          {error.message && (
            <p className="text-xs text-gray-500 mt-4 p-3 bg-white/5 rounded-lg break-words">
              {error.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            <RefreshCw size={18} />
            Réessayer
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200"
          >
            <Mail size={18} />
            Support
          </Link>
        </div>

        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="pt-8 border-t border-white/10">
            <p className="text-xs text-gray-600">
              Error ID: <code className="text-gray-500 font-mono">{error.digest}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
