'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ProductDemo } from './ProductDemo'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-ambient pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-2 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Multipliez vos <span className="gradient-text">revenus</span> avec notre{' '}
            <span className="gradient-text">Chatting IA</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-[color:var(--foreground-muted)]">
            Une IA commerciale ultra-performante qui comprend chaque fan, détecte les meilleures
            opportunités de vente et automatise votre chatting — pour augmenter vos revenus tout
            en réduisant drastiquement vos coûts.
          </p>

          <div className="mt-10">
            <Link
              href="/register"
              className="gradient-bg-signature glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Commencer à augmenter mes revenus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <ProductDemo />
        </motion.div>
      </div>
    </section>
  )
}
