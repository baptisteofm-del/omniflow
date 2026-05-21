import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Programme Affiliation — Gagnez 10% à vie | Omniflow',
  description:
    'Rejoignez le programme d\'affiliation Omniflow. 10% de commission récurrente à vie pour chaque agence référée. Gagnez jusqu\'au 249€ par vente.',
  keywords: [
    'affiliation omniflow',
    'programme affiliation',
    'commission affiliation',
    'devenir partenaire omniflow',
  ],
}

'use client'
import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

const plans = [
  { name: 'Plan Starter', price: 49, commission: 4.9 },
  { name: 'Plan Pro', price: 99, commission: 9.9 },
  { name: 'Plan Agency', price: 249, commission: 24.9 },
]

export default function AffiliationPage() {
  const [referrals, setReferrals] = useState(10)
  const estimatedMonthly = referrals * plans[1].commission

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-transparent">
      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-6">
            <Zap size={14} />
            Programme d'affiliation
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Gagnez 10% à <span className="gradient-text">vie</span>
          </h1>
          <p className="text-gray-400 text-xl">
            sur chaque agence que vous référez
          </p>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Comment ça marche</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Créez votre compte',
                description: 'Obtenez votre lien unique de parrainage',
              },
              {
                number: '2',
                title: 'Partagez avec des agences',
                description: 'Ils s\'inscrivent via votre lien',
              },
              {
                number: '3',
                title: 'Touchez votre commission',
                description: 'Chaque mois, à vie',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/4 right-0 w-8 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 translate-x-16" />
                )}
                <div className="glass rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue calculator section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Calculateur de revenus</h2>

          <div className="glass rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-4">
                  Nombre d'agences référées: <span className="font-bold text-cyan-400">{referrals}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={referrals}
                  onChange={(e) => setReferrals(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="bg-black/50 rounded-xl p-6 border border-purple-500/30">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Plan Pro (99€/mois)</span>
                    <span className="font-semibold text-cyan-400">{referrals}x</span>
                  </div>
                  <div className="border-t border-gray-700/50 pt-3 flex justify-between items-center">
                    <span className="font-bold text-white">Revenu mensuel estimé</span>
                    <span className="text-3xl font-bold gradient-text">
                      {estimatedMonthly.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-400 text-sm pt-2">
                    <span>Revenu annuel</span>
                    <span className="font-semibold">{(estimatedMonthly * 12).toFixed(0)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission table section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Tableau des commissions</h2>

          <div className="space-y-4">
            {plans.map((plan, index) => (
              <div key={index} className="glass rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.price}€/mois</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl gradient-text">{plan.commission}€</div>
                  <p className="text-gray-400 text-sm">par agence/mois</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Conditions du programme</h2>

          <div className="glass rounded-2xl p-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold text-lg flex-shrink-0">✓</span>
              <p className="text-gray-300">
                Paiement mensuel par virement ou crypto
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold text-lg flex-shrink-0">✓</span>
              <p className="text-gray-300">Pas de minimum de retrait</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold text-lg flex-shrink-0">✓</span>
              <p className="text-gray-300">
                Commission à vie tant que l'agence reste abonnée
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold text-lg flex-shrink-0">✓</span>
              <p className="text-gray-300">Lien de parrainage dans votre dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Rejoignez le programme</h2>
          <p className="text-gray-400 text-lg mb-8">
            Créez votre compte et obtenez votre lien d'affiliation dès maintenant
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all glow"
          >
            Rejoindre le programme
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  )
}
