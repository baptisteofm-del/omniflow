'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const faqs = [
  { q: "Quels sont les prix des plans OmniFlow ?", a: "Nous proposons 3 plans : Starter à 99€/mois, Pro à 199€/mois, et Agency à 349€/mois. Tous incluent un essai gratuit de 7 jours. Vous pouvez aussi choisir une facturation annuelle pour économiser 20%." },
  { q: "Comment fonctionne l'essai gratuit ?", a: "L'essai dure 7 jours. Carte bancaire requise pour l'enregistrement, mais aucun prélèvement automatique n'aura lieu pendant la période d'essai. Après 7 jours, vous serez facturé pour le plan choisi. Vous pouvez annuler à tout moment sans engagement." },
  { q: "Puis-je m'abonner directement sans essai ?", a: "Oui, vous pouvez choisir de vous abonner directement sans passer par l'essai gratuit. Vous serez facturé immédiatement." },
  { q: "Qu'est-ce que la Veille Instagram ?", a: "La Veille Instagram analyse les contenus performants sur Instagram et vous suggère les tendances les plus adaptées à votre audience. Notre système apprend de vos likes/dislikes pour affiner les recommandations. Starter : 5 trends/jour, Pro : 10 trends/jour, Agency : 20 trends/jour." },
  { q: "Comment fonctionne la Génération vidéo IA ?", a: "OmniFlow utilise Kling pour générer des vidéos IA photo-réalistes en quelques secondes. Automatisez votre production de contenu sans effort. Starter inclut les crédits à la demande, Pro et Agency proposent des quotas inclus ou illimités." },
  { q: "Qu'est-ce que l'Autoposting ?", a: "L'Autoposting permet une publication automatisée sur plusieurs comptes via ADS Power et GitArk. Gagnez du temps en automatisant votre workflow sans intervention manuelle." },
  { q: "Qu'est-ce que le Chatting IA ?", a: "Le Chatting IA automatise vos conversations avec vos fans. Notre système augmente vos ventes et maximise l'engagement — c'est un véritable outil de conversion pour vos comptes OnlyFans. Disponible en Pro et Agency." },
  { q: "Qu'est-ce que la Prospection de modèles ?", a: "La Prospection de modèles est exclusivement disponible en plan Agency. Notre agent IA scrape les réseaux sociaux, identifie des créatrices à fort potentiel, et initie le contact en votre nom — un pipeline de recrutement automatique." },
  { q: "Qu'est-ce que le système de Crédits ?", a: "Dépassez votre quota mensuel avec des crédits supplémentaires. Chaque RUN ajoute 10 crédits pour 9€, utilisables pour générations IA ou nouvelles tendances Instagram. Les crédits sont valides 30 jours." },
  { q: "Tous les plans incluent des 'Utilisateurs illimités' ?", a: "Oui, tous les plans (Starter, Pro, Agency) offrent des utilisateurs illimités. Vous n'avez plus à vous soucier des limites de membres équipe ou de comptes associés." },
  { q: "Comment fonctionne le programme d'affiliation ?", a: "Partagez votre lien de parrainage unique avec d'autres agences OnlyFans. Vous gagnez 10% de commission récurrente à vie pour chaque agence qui s'inscrit via votre lien. Commission versée mensuellement." },
  { q: "Puis-je annuler mon abonnement ?", a: "Bien sûr, sans engagement. Vous pouvez annuler à tout moment depuis Paramètres → Abonnement. Aucun frais d'annulation, accès jusqu'à la fin de votre période de facturation actuelle." },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium pr-4">{q}</span>
        <ChevronDown size={18} className={cn('text-purple-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5">
          <div className="pt-4">{a}</div>
        </div>
      )}
    </div>
  )
}

export function FaqClient() {
  return (
    <div className="min-h-screen py-24 px-4 gradient-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Questions fréquentes</h1>
          <p className="text-gray-400 text-lg">Tout ce que vous devez savoir sur OmniFlow</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </div>
  )
}
