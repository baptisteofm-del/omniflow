'use client'
import { useState } from 'react'
import { Send, MessageCircle, Mail } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Besoin d'aide ?</h1>
          <p className="text-xl text-gray-400">Nous sommes là pour vous aider. Choisissez votre méthode préférée.</p>
        </div>

        {/* Contact options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Telegram support */}
          <a
            href="https://t.me/omniflowsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="group glass p-8 rounded-xl border border-purple-500/20 hover:border-cyan-500/50 transition-all hover:scale-105 cursor-pointer"
          >
            <div className="mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={28} className="text-white" />
              </div>
              <div className="absolute top-6 right-6 bg-cyan-500/20 border border-cyan-500/50 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-cyan-300">Le plus rapide</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Support Telegram</h3>
            <p className="text-gray-400 text-sm mb-4">Réponse en moins d'1h</p>
            <div className="text-cyan-400 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Rejoindre le support <span>→</span>
            </div>
          </a>

          {/* Email support */}
          <a
            href="mailto:contact@omniflowapp.ai"
            className="group glass p-8 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer"
          >
            <div className="mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email</h3>
            <p className="text-gray-400 text-sm mb-4">contact@omniflowapp.ai</p>
            <div className="text-purple-400 font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Envoyer un email <span>→</span>
            </div>
          </a>

          {/* Form support */}
          <div className="glass p-8 rounded-xl border border-purple-500/20">
            <div className="mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                <Send size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Envoyer un message</h3>
            <p className="text-gray-400 text-sm mb-4">Via le formulaire ci-dessous</p>
            <div className="text-orange-400 font-semibold text-sm">Formulaire</div>
          </div>
        </div>

        {/* Contact form */}
        <div className="glass p-8 md:p-12 rounded-xl border border-purple-500/20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>

          {submitted && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-400 font-semibold text-sm">✓ Message envoyé avec succès ! Nous vous répondrons très bientôt.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Sujet
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Sujet de votre message"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                placeholder="Décrivez votre question ou problème..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              <Send size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-purple-500/20">
            <p className="text-gray-400 text-sm text-center">
              Nous répondons à tous les messages sous 24h. Pour des questions urgentes, utilisez notre support Telegram.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
