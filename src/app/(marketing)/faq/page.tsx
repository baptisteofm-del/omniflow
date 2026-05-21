import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes | Omniflow',
  description:
    'Toutes les réponses sur Omniflow : intégrations AdsPower/GeeLark, chatting IA, génération vidéo, tarifs, annulation.',
  keywords: [
    'omniflow faq',
    'questions omniflow',
    'adspower omniflow',
    'geelark omniflow',
    'pricing omniflow',
  ],
}

'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    question: 'Omniflow fonctionne avec quels outils anti-detect ?',
    answer:
      'Omniflow s\'intègre nativement avec AdsPower et GeeLark. Chaque agence connecte ses propres profils.',
  },
  {
    question: 'Faut-il des compétences techniques ?',
    answer:
      'Non. Si vous savez utiliser Instagram, vous saurez utiliser Omniflow. Setup en quelques minutes.',
  },
  {
    question: 'Combien de comptes puis-je gérer ?',
    answer:
      'Dépend de votre plan. Starter : 3 modèles, Pro : 10 modèles, Agency : illimité.',
  },
  {
    question: 'Le contenu IA est-il détecté comme artificiel ?',
    answer:
      'Non. Kling AI génère des vidéos photo-réalistes indiscernables du contenu naturel.',
  },
  {
    question: 'Comment fonctionne le spoof vidéo ?',
    answer:
      'Omniflow ré-encode vos vidéos en modifiant les métadonnées et le hash du fichier, rendant chaque vidéo unique aux yeux des algorithmes.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer: 'Oui, sans engagement, en un clic depuis vos paramètres.',
  },
  {
    question: "L'essai gratuit nécessite-t-il une carte bancaire ?",
    answer:
      'Non, l\'essai 7 jours est 100% gratuit. Vous renseignez vos informations de paiement uniquement à la fin de la période d\'essai si vous souhaitez continuer.',
  },
  {
    question: 'Le chatting IA parle vraiment comme un humain ?',
    answer:
      'Notre IA est entraînée sur le style de communication propre à chaque modèle. Les fans ne font pas la différence.',
  },
  {
    question: 'Est-ce légal ?',
    answer:
      'Omniflow est un outil d\'automatisation légal. L\'utilisateur est responsable du respect des CGU des plateformes sur lesquelles il publie.',
  },
  {
    question: 'Y a-t-il un programme d\'affiliation ?',
    answer:
      'Oui, 10% de commission récurrente à vie pour chaque agence référée. Voir notre page Affiliation.',
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-left">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown size={20} className="text-purple-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50"
          >
            <div className="px-6 py-4 text-gray-400">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-transparent">
      {/* Hero section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Questions <span className="gradient-text">fréquentes</span>
          </h1>
          <p className="text-gray-400 text-xl">
            Tout ce que vous devez savoir sur Omniflow
          </p>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Vous avez d'autres questions ?</h2>
          <p className="text-gray-400 text-lg mb-8">
            Contactez notre équipe support — nous répondons en moins de 2 heures.
          </p>
          <a
            href="mailto:support@omniflowapp.ai"
            className="inline-flex items-center gap-2 px-8 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            📧 support@omniflowapp.ai
          </a>
        </div>
      </section>
    </main>
  )
}
