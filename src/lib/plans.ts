import type { Plan } from '@/types'

export const AI_CHATTING_COMMISSION_PERCENT = 10

// ─── Coûts réels estimés ──────────────────────────────────────────────
// Claude Haiku : ~0.004€/msg (Chatting IA — Agency uniquement)
// Génération IA: ~0.15€/génération (coût infra)
// Veille Instagram : ~0.03€/run Apify
// ─────────────────────────────────────────────────────────────────────

// ── Système RUN uniforme ──────────────────────────────────────────────
// 1 RUN = 10 unités (générations IA OU trends OU contenus)
// Prix : 9€ / RUN
// Marge : ~3x sur les coûts réels
// ─────────────────────────────────────────────────────────────────────
export const RUN_UNITS = 10        // unités par RUN
export const RUN_PRICE_EUR = 9     // €/RUN

export const RUN_PACK = {
  id: 'run_pack',
  units: RUN_UNITS,
  price: RUN_PRICE_EUR,
  pricePerUnit: RUN_PRICE_EUR / RUN_UNITS,
  label: '10 générations',
  description: '10 générations IA ou 10 trends supplémentaires',
}

// Commission Omniflow (10% sur les ventes d'agences)
export const OMNIFLOW_COMMISSION_PERCENT = 10

// ───────────────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  // ── STARTER (99€/mois) ────────────────────────────────────────────────
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les agences qui démarrent',
    price: { monthly: 99, yearly: 79 },
    limits: {
      accounts: -1,
      models: 2,              // 2 modèles
      postSchedules: -1,
      teamMembers: 2,         // 2 membres
      telegramBots: 2,        // 2 bots Telegram
      aiGenerations: 0,       // Pas de génération IA
      trendRuns: 0,           // Veille Trends non inclus (plan Pro minimum)
      dailyTrendsCount: 0,    // Pas de veille quotidienne
      chattingMessages: 0,    // Pas de Chatting IA
      prospectionRuns: 0,
      contentWatches: -1,
    },
    features: [
      { name: 'Dashboard Financier', included: true },
      { name: 'Rapport Chatting', included: true },
      { name: 'Édition & Spoof', included: true },
      { name: 'Auto-Posting', included: true },
      { name: 'Banque de Médias', included: true },
      { name: 'Bot Telegram', included: true },
      { name: 'Veille Trends', included: false },
      { name: 'Génération IA', included: false },
      { name: 'Prospection de Modèles', included: false },
      { name: 'Chatting IA', included: false },
    ],
  },
  // ── PRO (199€/mois) ───────────────────────────────────────────────────
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les agences en croissance',
    price: { monthly: 199, yearly: 159 },
    limits: {
      accounts: -1,
      models: 5,              // 5 modèles
      postSchedules: -1,
      teamMembers: 3,         // 3 membres
      telegramBots: 5,        // 5 bots Telegram
      aiGenerations: 100,     // 100 générations IA/mois
      trendRuns: 30,          // 30 veilles/mois (1/jour)
      dailyTrendsCount: 10,   // 10 trends par veille quotidienne
      chattingMessages: 0,    // Pas de Chatting IA
      prospectionRuns: 0,
      contentWatches: -1,
    },
    features: [
      { name: 'Dashboard Financier', included: true },
      { name: 'Rapport Chatting', included: true },
      { name: 'Veille Trends', included: true },
      { name: 'Édition & Spoof', included: true },
      { name: 'Génération IA', included: true },
      { name: 'Auto-Posting', included: true },
      { name: 'Banque de Médias', included: true },
      { name: 'Bot Telegram', included: true },
      { name: 'Prospection de Modèles', included: false },
      { name: 'Chatting IA', included: false },
    ],
  },
  // ── AGENCY (349€/mois) ────────────────────────────────────────────────
  {
    id: 'agency',
    name: 'Agency',
    description: 'Pour les grandes agences',
    price: { monthly: 349, yearly: 279 },
    highlighted: true,
    limits: {
      accounts: -1,
      models: 10,             // 10 modèles
      postSchedules: -1,
      teamMembers: 5,         // 5 membres
      telegramBots: 5,        // 5 bots Telegram
      aiGenerations: 250,     // 250 générations IA/mois
      trendRuns: 30,          // 30 veilles/mois (1/jour)
      dailyTrendsCount: 20,   // 20 trends par veille quotidienne
      chattingMessages: -1,   // Illimité (Claude Haiku)
      prospectionRuns: 10,
      contentWatches: -1,
    },
    features: [
      { name: 'Dashboard Financier', included: true },
      { name: 'Rapport Chatting', included: true },
      { name: 'Veille Trends', included: true },
      { name: 'Édition & Spoof', included: true },
      { name: 'Génération IA', included: true },
      { name: 'Auto-Posting', included: true },
      { name: 'Banque de Médias', included: true },
      { name: 'Bot Telegram', included: true },
      { name: 'Prospection de Modèles', included: true },
      { name: 'Chatting IA', included: true },
    ],
  },
]

export const PLAN_FEATURES: Record<string, string[]> = {
  // Starter : fonctionnalités de base (sans Veille Trends, Génération IA, Prospection, Chatting IA)
  starter: ['editor', 'posting', 'finance', 'referral', 'media', 'telegram', 'chatting_reports'],
  // Pro : + Veille Trends + Génération IA
  pro:     ['veille', 'editor', 'posting', 'finance', 'referral', 'media', 'telegram', 'chatting_reports', 'ai_generation'],
  // Agency : accès complet
  agency:  ['veille', 'editor', 'posting', 'finance', 'referral', 'media', 'telegram', 'ai_generation', 'chatting_ai', 'chatting_reports', 'prospection'],
}

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function formatLimit(value: number): string {
  return value === -1 ? 'Illimité' : value.toLocaleString('fr-FR')
}

export function hasFeature(planId: string, feature: string): boolean {
  const features = PLAN_FEATURES[planId] || PLAN_FEATURES.starter
  return features.includes(feature)
}

export function getUpgradePlan(currentPlanId: string): Plan | null {
  const order = ['starter', 'pro', 'agency']
  const idx = order.indexOf(currentPlanId)
  if (idx === -1 || idx >= order.length - 1) return null
  return getPlanById(order[idx + 1]) || null
}

/**
 * Calcul du nombre de RUNs supplémentaires disponibles selon les crédits achetés
 */
export function getRunsFromCredits(extraCredits: number): number {
  return Math.floor(extraCredits / RUN_UNITS)
}

/**
 * Calcul du coût total pour un nombre de RUNs
 */
export function calculateRunsCost(runs: number): number {
  return runs * RUN_PRICE_EUR
}

/**
 * Calcul de la facture mensuelle totale
 */
export function calculateMonthlyBill(planId: string): number {
  const plan = getPlanById(planId)
  if (!plan) return 0
  return plan.price.monthly
}
