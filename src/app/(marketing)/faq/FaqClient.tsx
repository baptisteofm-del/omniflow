'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const faqs = [
  { q: "OmniFlow fonctionne avec quels outils anti-detect ?", a: "OmniFlow s'intègre nativement avec AdsPower et GeeLark. Chaque agence connecte ses propres profils depuis la page Paramètres → Intégrations." },
  { q: "Faut-il des compétences techniques ?", a: "Non. Si vous savez utiliser Instagram, vous saurez utiliser OmniFlow. Setup en quelques minutes, aucune ligne de code requise." },
  { q: "Combien de comptes puis-je gérer ?", a: "Ça dépend de votre plan. Starter : 3 modèles, Pro : 10 modèles, Agency : illimité. Chaque modèle peut avoir plusieurs profils AdsPower/GeeLark associés." },
  { q: "Le contenu IA est-il détecté comme artificiel ?", a: "Non. Kling AI génère des vidéos photo-réalistes indiscernables du contenu naturel. Les plateformes ne font pas la différence." },
  { q: "Comment fonctionne le spoof vidéo ?", a: "OmniFlow ré-encode vos vidéos en modifiant les métadonnées et le hash du fichier, rendant chaque vidéo unique aux yeux des algorithmes. Zéro shadowban." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans engagement, en un clic depuis Paramètres → Abonnement. Aucun frais d'annulation." },
  { q: "L'essai gratuit nécessite-t-il une carte bancaire ?", a: "Non, l'essai 7 jours est 100% gratuit. Vous renseignez vos informations de paiement uniquement à la fin si vous souhaitez continuer." },
  { q: "Le chatting IA parle vraiment comme un humain ?", a: "Notre IA est entraînée sur le style de communication propre à chaque modèle. Les fans ne font pas la différence — et les statistiques de conversion le prouvent." },
  { q: "Est-ce légal ?", a: "OmniFlow est un outil d'automatisation légal. L'utilisateur est responsable du respect des CGU des plateformes sur lesquelles il publie. Nous ne stockons aucun contenu protégé." },
  { q: "Y a-t-il un programme d'affiliation ?", a: "Oui, 10% de commission récurrente à vie pour chaque agence référée. Gérez tout depuis votre dashboard → Parrainage." },
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
