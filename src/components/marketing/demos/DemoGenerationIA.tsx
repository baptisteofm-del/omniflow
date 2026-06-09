'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles, Wand2, RefreshCw } from 'lucide-react'

const genTypes = [
  { id: 'script', label: 'Script', icon: '🎬' },
  { id: 'caption', label: 'Caption', icon: '✍️' },
  { id: 'campaign', label: 'Campagne', icon: '🚀' },
  { id: 'idea', label: 'Idées', icon: '💡' },
]

const outputs: Record<string, string[]> = {
  script: [
    "Ouvre avec une tension : « Je n'aurais jamais dû poster ça... » Pause 2 secondes. Puis souris. Cut.\n\nMontre le contenu. Texte en overlay : « Bon, autant vous montrer ». Musique monte. Fin avec CTA doux : « Tu sais où me trouver 😉 »",
    "Commence avec ton visage, lumière naturelle. « Bonne nuit à tous... enfin pas à tous ». Clin d'œil. Fondu noir. Texte : « Certains ont accès à ma nuit complète ». Lien en bio.",
  ],
  caption: [
    "Ce soir c'est différent 🌙\n\nJ'avais envie de partager quelque chose d'un peu plus personnel avec vous... Le lien est en bio pour ceux qui veulent voir la suite 💋",
    "POV : tu réalises que mon contenu de ce mois est le meilleur que j'ai jamais créé 🔥\n\nJe vous ai réservé quelque chose de spécial. Vous méritez mieux que la version gratuite ✨",
  ],
  campaign: [
    "🗓 Campagne 7 jours — Stratégie engagement\n\nJ1 : Teasing mystère « Quelque chose arrive... »\nJ2 : Coulisses shooting\nJ3 : Preview exclusive abonnés\nJ4 : Q&A stories + redirect\nJ5 : Lancement contenu premium\nJ6 : Témoignages fans\nJ7 : Dernière chance + urgence",
    "🎯 Campagne Saint-Valentin\n\nSemaine 1 : Série de teasers romantiques\nSemaine 2 : Contenu exclusif themed\nSemaine 3 : Offre spéciale -20% abonnement\nMessage : « Pour toi, ce soir, quelque chose d'unique »",
  ],
  idea: [
    "💡 10 idées de contenus pour cette semaine :\n\n1. Routine matinale authentique\n2. Behind-the-scenes shooting\n3. Transformation tenue (before/after)\n4. Day in my life — version exclusive\n5. Q&A fans (stories)\n6. Teasing semaine prochaine\n7. Contenu nostalgie (#throwback)\n8. Collaboration virtuelle\n9. Réponse au commentaire populaire\n10. Message personnalisé top fans",
    "💡 Idées tendances Instagram cette semaine :\n\n1. POV cinématique (tendance +340%)\n2. Slow-motion lifestyle (tendance +180%)\n3. Texte animé overlay émotionnel\n4. Transition miroir\n5. GRWM ultra-intime\n6. Réaction à un commentaire viral\n7. Duo avec un son trend\n8. Montage journée en 15 secondes",
  ],
}

export function DemoGenerationIA() {
  const [activeType, setActiveType] = useState('script')
  const [outputIndex, setOutputIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generated, setGenerated] = useState(0)

  const generate = (type: string, idx: number) => {
    setIsGenerating(true)
    setDisplayedText('')
    setProgress(0)
    const text = outputs[type][idx % outputs[type].length]

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressInterval); return 100 }
        return p + 8
      })
    }, 60)

    setTimeout(() => {
      setIsGenerating(false)
      setGenerated(g => g + 1)
      let i = 0
      const typeInterval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(typeInterval)
      }, 18)
    }, 900)
  }

  useEffect(() => {
    generate(activeType, outputIndex)
  }, [activeType, outputIndex])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveType(t => {
        const types = Object.keys(outputs)
        const next = types[(types.indexOf(t) + 1) % types.length]
        setOutputIndex(0)
        return next
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ perspective: '1200px' }}>
      <motion.div animate={{ rotateX: [-3, -6, -3], rotateY: [3, 6, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}>
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#080810]"
          style={{ boxShadow: '0 0 60px rgba(139,92,246,0.2)' }}>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-gray-400 bg-slate-800/80 px-4 py-1 rounded-full border border-gray-700/50">
                OmniFlow — Génération IA
              </span>
            </div>
            <span className="text-xs text-purple-300">{generated} générés</span>
          </div>

          <div className="p-6 flex flex-col gap-5 min-h-[460px]">
            {/* Type tabs */}
            <div className="flex gap-2 flex-wrap">
              {genTypes.map(t => (
                <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                  onClick={() => { setActiveType(t.id); setOutputIndex(0) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeType === t.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/40 text-white'
                      : 'border-gray-700/40 text-gray-400 hover:border-purple-500/30'
                  }`}>
                  <span>{t.icon}</span>{t.label}
                </motion.button>
              ))}
            </div>

            {/* Generator */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {genTypes.find(t => t.id === activeType)?.label}
                  </span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setOutputIndex(i => i + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs text-purple-300 hover:bg-purple-500/10 transition-all">
                  <RefreshCw size={11} />
                  Regénérer
                </motion.button>
              </div>

              {/* Output box */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 rounded-xl border border-purple-500/20 bg-slate-900/60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5" />

                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-sm z-10">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Wand2 size={24} className="text-purple-400" />
                        </motion.div>
                        <div className="w-48 space-y-2">
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                          </div>
                          <p className="text-xs text-gray-400 text-center">Génération en cours...</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative z-0 p-4 h-full overflow-y-auto">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {displayedText}
                      {!isGenerating && (
                        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle" />
                      )}
                    </p>
                  </div>
                </div>
                <div className="h-[200px]" />
              </div>

              {/* Stats strip */}
              <div className="flex gap-3">
                {[
                  { label: 'Scripts', value: '2s', color: 'text-purple-400' },
                  { label: 'Captions', value: 'Ultra-nat.', color: 'text-cyan-400' },
                  { label: 'Idées', value: '10/run', color: 'text-pink-400' },
                  { label: 'Campagnes', value: '7 jours', color: 'text-amber-400' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 p-2 rounded-lg bg-slate-900/50 border border-gray-700/30 text-center">
                    <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-600">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
