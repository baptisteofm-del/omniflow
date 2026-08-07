'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brain, TrendingUp } from 'lucide-react'

const STAGE_DURATION = 2600

type Stage = 0 | 1 | 2 | 3 | 4 | 5

export function ProductDemo() {
  const [stage, setStage] = useState<Stage>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((s) => ((s + 1) % 6) as Stage)
    }, STAGE_DURATION)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="glass glow-sm relative overflow-hidden rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2 text-xs text-[color:var(--foreground-muted)]">
        <span className="h-2 w-2 rounded-full bg-[color:var(--cyan)]" />
        OmniFlow — conversation en direct
      </div>

      {/* Stage 0: incoming fan message */}
      <div className="mb-3 flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-[color:var(--surface-elevated)] px-4 py-2.5 text-sm">
          tu me montres plus ? 👀
        </div>
      </div>

      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {stage >= 1 && stage <= 1 && (
            <motion.div
              key="scores"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)]">
                <TrendingUp className="h-3.5 w-3.5 text-[color:var(--cyan)]" /> Intelligence Fan
              </p>
              <ScoreRow label="Intention d'achat" value="87/100" />
              <ScoreRow label="Relation" value="74/100" />
              <ScoreRow label="Potentiel d'achat" value="ÉLEVÉ" />
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs text-[color:var(--foreground-muted)]">
                <Brain className="h-3.5 w-3.5 text-[color:var(--violet)]" /> Mémoire du fan
              </p>
              {['A déjà acheté 2 fois', 'Aime le contenu suggestif', 'Accepte généralement des offres 30–50€'].map((f) => (
                <p key={f} className="rounded-lg bg-[color:var(--surface-elevated)] px-3 py-2 text-xs text-[color:var(--foreground-muted)]">
                  {f}
                </p>
              ))}
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="gradient-bg-signature rounded-xl px-4 py-3 text-sm font-medium text-white"
            >
              Décision OmniFlow → le fan est prêt pour une offre
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div key="offer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[color:var(--surface-elevated)] px-4 py-2.5 text-sm">
                  peut-être... mais tu vas devoir le mériter 😏
                </div>
              </div>
              <div className="glass flex items-center justify-between rounded-xl px-4 py-3">
                <span className="text-sm">Contenu exclusif</span>
                <span className="gradient-text text-sm font-semibold">39€</span>
              </div>
            </motion.div>
          )}

          {stage === 5 && (
            <motion.div
              key="purchased"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-4 py-4 text-center"
            >
              <span className="text-lg font-semibold text-[color:var(--success)]">ACHETÉ +39€</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[color:var(--surface-elevated)] px-3 py-2 text-xs">
      <span className="text-[color:var(--foreground-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
