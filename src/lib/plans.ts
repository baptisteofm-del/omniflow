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
      aiGenerations: 0,  // NO AI generation for Starter
      contentWatches: -1,  // illimité
    },
    features: [
      { name: 'Veille de contenu', included: true },
      { name: 'Éditeur vidéo + Spoof', included: true },
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
      aiGenerations: 500,
      contentWatches: -1,
    },
    features: [
      { name: 'Veille de contenu', included: true },
      { name: 'Éditeur vidéo + Spoof', included: true },
      { name: 'Scheduling (10 000 posts/mois)', included: true },
      { name: 'Dashboard financier', included: true },
      { name: 'Parrainage 10%', included: true },
      { name: 'Génération IA Kling (500/mois)', included: true },
      { name: 'Chatting IA', included: false },
      { name: 'Rapports chatting', included: false },
      { name: 'Prospection modèles IA', included: false },
      { name: 'Support prioritaire', included: true },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Pour les grandes agences',
    price: { monthly: 199, yearly: 159 },
    limits: {
      accounts: -1,
      models: -1,
      postSchedules: -1,
      teamMembers: -1,
      telegramBots: -1,
      aiGenerations: -1,
      contentWatches: -1,
    },
    features: [
      { name: 'Veille de contenu', included: true },
      { name: 'Éditeur vidéo + Spoof', included: true },
      { name: 'Scheduling illimité', included: true },
      { name: 'Dashboard financier avancé', included: true },
      { name: 'Parrainage 10%', included: true },
      { name: 'Génération IA Kling illimitée', included: true },
      { name: 'Chatting IA', included: true },
      { name: 'Rapports chatting', included: true },
      { name: 'Prospection modèles IA', included: true },
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
