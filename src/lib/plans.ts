import type { Plan } from '@/types'

// Commission Omniflow sur les ventes générées par le Chatting IA
export const AI_CHATTING_COMMISSION_PERCENT = 10 // 10% des ventes IA

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les agences qui démarrent',
    price: {
      monthly: 49,
      yearly: 39,
    },
    limits: {
      accounts: 3,
      models: 3,
      postSchedules: 100,
      teamMembers: 2,
      telegramBots: 1,
      aiGenerations: 50,
      contentWatches: 5,
    },
    features: [
      { name: 'Veille de contenu', included: true },
      { name: 'Éditeur vidéo + Spoof', included: true },
      { name: 'Génération IA (Higgsfield)', included: false },
      { name: 'Scheduling multi-comptes', included: true },
      { name: 'Bot Telegram', included: true },
      { name: 'Dashboard financier', included: true },
      { name: 'Rapports chatting', included: false },
      { name: 'Chatting IA (+ 10% sur ventes)', included: false },
      { name: 'Prospection modèles', included: false },
      { name: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les agences en croissance',
    price: {
      monthly: 99,
      yearly: 79,
    },
    highlighted: true,
    limits: {
      accounts: 10,
      models: 10,
      postSchedules: 500,
      teamMembers: 5,
      telegramBots: 5,
      aiGenerations: 200,
      contentWatches: 20,
    },
    features: [
      { name: 'Veille de contenu', included: true },
      { name: 'Éditeur vidéo + Spoof', included: true },
      { name: 'Génération IA (Higgsfield)', included: true },
      { name: 'Scheduling multi-comptes', included: true },
      { name: 'Bots Telegram', included: true },
      { name: 'Dashboard financier', included: true },
      { name: 'Rapports chatting', included: true },
      { name: 'Chatting IA (+ 10% sur ventes)', included: false },
      { name: 'Prospection modèles', included: false },
      { name: 'Support prioritaire', included: true },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Pour les grandes agences',
    price: {
      monthly: 249,
      yearly: 199,
    },
    limits: {
      accounts: -1,     // illimité
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
      { name: 'Génération IA (Higgsfield)', included: true },
      { name: 'Scheduling multi-comptes illimité', included: true },
      { name: 'Bots Telegram illimités', included: true },
      { name: 'Dashboard financier avancé', included: true },
      { name: 'Rapports chatting', included: true },
      { name: 'Chatting IA (+ 10% sur ventes)', included: true },
      { name: 'Prospection modèles', included: true },
      { name: 'Support dédié 24/7', included: true },
    ],
  },
]

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function formatLimit(value: number): string {
  return value === -1 ? 'Illimité' : value.toString()
}
