'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

const LOOP_STEPS = ['Comprendre', 'Se souvenir', 'Décider', 'Vendre', 'Observer', 'Apprendre']

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-ambient pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-[color:var(--foreground-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--cyan)]" />
            Copilot &amp; Full AI pour agences de créatrices
          </div>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            L&apos;IA qui <span className="gradient-text">comprend</span>,{' '}
            <span className="gradient-text">se souvient</span> et{' '}
            <span className="gradient-text">vend</span> pour votre agence
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[color:var(--foreground-muted)]">
            OmniFlow transforme le chatting en système commercial intelligent : mémoire de chaque
            fan, scripts qui s&apos;adaptent, prix maîtrisés, et une IA que vous contrôlez à chaque étape.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="gradient-bg-signature glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Commencer avec OmniFlow
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:border-[color:var(--border-strong)]"
            >
              Voir comment ça marche
            </a>
          </div>
        </motion.div>

        {/* Core loop strip — MESSAGE → UNDERSTAND → REMEMBER → DECIDE → ACT → OBSERVE → LEARN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-2 text-xs text-[color:var(--foreground-muted)]"
        >
          {LOOP_STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="glass rounded-full px-3 py-1.5">{step}</span>
              {i < LOOP_STEPS.length - 1 && (
                <span aria-hidden="true" className="text-[color:var(--border-strong)]">
                  →
                </span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
