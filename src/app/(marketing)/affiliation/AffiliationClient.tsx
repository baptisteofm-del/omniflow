'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, DollarSign, ArrowRight, Zap, Link2, CheckCircle2 } from 'lucide-react'

const plans = [
  { name: 'Starter', price: 99, commission: 9.90 },
  { name: 'Pro', price: 199, commission: 19.90 },
  { name: 'Agency', price: 349, commission: 34.90 },
]

const steps = [
  { icon: Link2, title: 'Créez votre compte', desc: 'Obtenez votre lien de parrainage unique dans votre dashboard → Parrainage' },
  { icon: Users, title: 'Partagez avec des agences', desc: 'Envoyez votre lien à des agences OF. Elles s\'inscrivent via votre lien.' },
  { icon: DollarSign, title: 'Touchez 10% à vie', desc: 'Chaque mois qu\'elles restent abonnées, vous recevez 10% de leur abonnement.' },
]

export function AffiliationClient() {
  const [referrals, setReferrals] = useState(10)
  const estimatedMonthly = Math.round(referrals * plans[1].commission)

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-6">
            <Zap size={14} />
            Programme d'affiliation
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Gagnez <span className="gradient-text">10% à vie</span><br />sur chaque agence référée
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Simple, transparent, lucratif. Commission récurrente tant que l'agence reste abonnée.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all">
            Rejoindre le programme <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <step.icon size={24} className="text-purple-400" />
                </div>
                <div className="text-purple-400 text-sm font-medium mb-2">Étape {i + 1}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculateur */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <TrendingUp size={32} className="text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Calculez vos revenus</h2>
            <p className="text-gray-400 mb-8">Basé sur le plan Pro à 199€/mois</p>
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Nombre d'agences référées : <strong className="text-white">{referrals}</strong></label>
              <input type="range" min={1} max={50} value={referrals} onChange={e => setReferrals(Number(e.target.value))}
                className="w-full accent-purple-500" />
            </div>
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="text-5xl font-bold gradient-text mb-2">{estimatedMonthly}€</div>
              <div className="text-gray-400">de commission mensuelle</div>
              <div className="text-sm text-gray-500 mt-1">soit {estimatedMonthly * 12}€/an</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tableau commissions */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Commissions par plan</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Plan</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Prix agence</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Votre commission/mois</th>
              </tr></thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.name} className="border-b border-white/5">
                    <td className="p-4 font-medium">{plan.name}</td>
                    <td className="p-4 text-gray-400">{plan.price}€/mois</td>
                    <td className="p-4 text-green-400 font-bold">{plan.commission}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Conditions du programme</h2>
            <ul className="space-y-3">
              {[
                'Commission versée mensuellement (virement ou crypto)',
                'Pas de minimum de retrait',
                'Commission à vie tant que l\'agence reste abonnée',
                'Lien de parrainage disponible dans votre dashboard',
                'Tableau de bord en temps réel de vos filleuls',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all">
              Démarrer maintenant <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
