'use client'
import { useState } from 'react'
import { Send, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSent(true)
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-24 px-4 gradient-bg">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Besoin d'aide ?
          </h1>
          <p className="text-gray-400 text-lg">
            Notre équipe répond à tous les messages sous 1h
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telegram — Mis en avant */}
          <div className="glass rounded-2xl p-8 border border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                ⚡ Le plus rapide
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-5">
              <Send size={26} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Support Telegram</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Parlez directement à notre équipe sur Telegram. Réponse garantie en moins d'1h pendant les heures ouvrées.
            </p>
            <a
              href="https://t.me/omniflowapp_bot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl font-medium text-blue-300 transition-all"
            >
              <Send size={16} />
              Ouvrir le support Telegram
            </a>
          </div>

          {/* Formulaire */}
          <div className="glass rounded-2xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-5">
              <MessageCircle size={26} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Envoyer un message</h2>
            <p className="text-gray-400 text-sm mb-6">
              Préférez-vous écrire ? On vous répond sous 24h.
            </p>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={40} className="text-green-400 mb-3" />
                <p className="font-medium text-white">Message envoyé ✅</p>
                <p className="text-sm text-gray-400 mt-1">On revient vers vous rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Votre nom / agence"
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 text-sm"
                />
                <input
                  required
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="Sujet"
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 text-sm"
                />
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="Votre message..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Nous répondons à tous les messages sous 24h — souvent bien moins 🚀
        </p>
      </div>
    </div>
  )
}
