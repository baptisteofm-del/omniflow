import type { Plan } from '@/types'

export const AI_CHATTING_COMMISSION_PERCENT = 10

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les agences qui démarrent',
    price: { monthly: 49, yearly: 39 },
    limits: {
      accounts: 2,
      models: 2,
      postSchedules: 1000,
      teamMembers: 2,
      telegramBots: 2,
      aiGenerations: 0,       // Pas de génération IA (coût Kling ~0.25$/vidéo)
      trendRuns: 5,           // 5 générations trends/jour (seed data = gratuit)
      chattingMessages: 0,    // Pas de Chatting IA
      prospectionRuns: 0,     // Pas de recrutement IA
      contentWatches: -1,
    },
    features: [
      { name: 'Veille de contenu (5 gén/jour)', included: true },
      { name: 'Éditeur & Spoof illimité', included: true },
      { name: 'Scheduling (1 000 posts/mois)', included: true },
      { name: 'Dashboard financier', included: true },
      { name: 'Parrainage 10%', included: true },
      { name: 'Génération IA Kling', included: false },
      { name: 'Chatting IA', included: false },
      { name: 'Rapports chatting', included: false },
      { name: 'Prospection modèles IA', included: false },
      { name: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les agences en croissance',
    price: { monthly: 99, yearly: 79 },
    highlighted: true,
    limits: {
      accounts: 5,
      models: 5,
      postSchedules: 10000,
      teamMembers: 5,
      telegramBots: 5,
      aiGenerations: 30,      // 30 vidéos/mois Kling (coût ~7.50$) — RENTABLE sur 99€
      trendRuns: 20,          // 20 générations trends/jour
      chattingMessages: 0,    // Chatting IA non inclus en Pro
      prospectionRuns: 0,
      contentWatches: -1,
    },
    features: [
      { name: 'Veille de contenu (20 gén/jour)', included: true },
      { name: 'Éditeur & Spoof illimité', included: true },
      { name: 'Scheduling (10 000 posts/mois)', included: true },
      { name: 'Dashboard financier', included: true },
      { name: 'Parrainage 10%', included: true },
      { name: 'Génération IA Kling (30/mois)', included: true },
      { name: 'Rapports chatting', included: true },
      { name: 'Chatting IA', included: false },
      { name: 'Prospection modèles IA', included: false },
      { name: 'Support prioritaire', included: true },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Pour les grandes agences',
    price: { monthly: 249, yearly: 199 },
    limits: {
      accounts: -1,
      models: -1,
      postSchedules: -1,
      teamMembers: -1,
      telegramBots: -1,
      aiGenerations: 150,     // 150 vidéos/mois Kling (coût ~37$) — rentable sur 249€
      trendRuns: 50,          // 50 générations trends/jour
      chattingMessages: 50000, // ~50k messages IA/mois (coût ~10€ en Haiku)
      prospectionRuns: 20,    // 20 runs de scraping recrutement/mois
      contentWatches: -1,
    },
    features: [
      { name: 'Veille de contenu (50 gén/jour)', included: true },
      { name: 'Éditeur & Spoof illimité', included: true },
      { name: 'Scheduling illimité', included: true },
      { name: 'Dashboard financier avancé', included: true },
      { name: 'Parrainage 10%', included: true },
      { name: 'Génération IA Kling (150/mois)', included: true },
      { name: 'Chatting IA (50 000 msg/mois)', included: true },
      { name: 'Rapports chatting', included: true },
      { name: 'Prospection modèles IA (20 runs/mois)', included: true },
      { name: 'Support dédié 24/7', included: true },
    ],
  },
]

export const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['veille', 'editor', 'posting', 'finance', 'referral', 'media', 'telegram'],
  pro: ['veille', 'editor', 'posting', 'finance', 'referral', 'media', 'telegram', 'ai_generation', 'chatting_reports'],
  agency: ['veille', 'editor', 'posting', 'finance', 'referral', 'media', 'telegram', 'ai_generation', 'chatting_reports', 'chatting_ai', 'prospection'],
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
