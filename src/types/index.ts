// ================================
// OMNIFLOW — Types globaux
// ================================

// --- Plans & Abonnements ---
export type PlanId = 'starter' | 'pro' | 'agency'
export type BillingInterval = 'monthly' | 'yearly'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'

export interface Plan {
  id: PlanId
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: PlanFeature[]
  limits: PlanLimits
  highlighted?: boolean
}

export interface PlanFeature {
  name: string
  included: boolean
  tooltip?: string
}

export interface PlanLimits {
  accounts: number          // Nombre de comptes gérés
  models: number            // Nombre de modèles
  postSchedules: number     // Posts schedulés/mois
  teamMembers: number       // Membres d'équipe
  telegramBots: number      // Bots Telegram
  aiGenerations: number     // Générations IA/mois
  contentWatches: number    // Alertes veille contenu
  trendRuns?: number        // Veilles Instagram/mois (1/jour)
  dailyTrendsCount?: number // Nombre de trends par veille quotidienne
  chattingMessages?: number // Messages Chatting IA/mois (Claude Haiku — Agency only)
  prospectionRuns?: number  // Runs prospection/mois
}

// --- Utilisateur & Agence ---
export interface Agency {
  id: string
  name: string
  ownerId: string
  planId: PlanId
  subscriptionId?: string
  subscriptionStatus?: SubscriptionStatus
  trialEndsAt?: string
  createdAt: string
  settings: AgencySettings
}

export interface AgencySettings {
  timezone: string
  currency: string
  notifications: {
    email: boolean
    telegram: boolean
  }
}

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  agencyId: string
  role: 'owner' | 'admin' | 'member'
  createdAt: string
}

// --- Modèles ---
export interface Model {
  id: string
  agencyId: string
  name: string
  platform: 'onlyfans' | 'instagram' | 'tiktok' | 'twitter'
  status: 'active' | 'inactive' | 'monitoring'
  stats?: ModelStats
  telegramChannelId?: string
  createdAt: string
}

export interface ModelStats {
  followers: number
  revenue: number
  engagement: number
  lastUpdated: string
}

// --- Contenu ---
export interface ContentItem {
  id: string
  agencyId: string
  modelId?: string
  type: 'video' | 'image' | 'reel'
  sourceUrl: string
  processedUrl?: string
  spoofed: boolean
  platform: SocialPlatform
  status: 'pending' | 'processing' | 'ready' | 'posted' | 'error'
  createdAt: string
}

export type SocialPlatform = 'onlyfans' | 'instagram' | 'tiktok' | 'twitter' | 'telegram'

// --- Veille Contenu ---
export interface TrendItem {
  id: string
  platform: SocialPlatform
  title: string
  url: string
  engagement: number
  category: string
  capturedAt: string
  tags: string[]
}

// --- Posts Schedulés ---
export interface ScheduledPost {
  id: string
  agencyId: string
  modelId: string
  contentId: string
  platform: SocialPlatform
  scheduledAt: string
  status: 'pending' | 'posted' | 'failed'
  caption?: string
  createdAt: string
}

// --- Finance ---
export interface Transaction {
  id: string
  agencyId: string
  type: 'revenue' | 'expense'
  amount: number
  currency: string
  category: string
  description: string
  date: string
  platform?: string
  modelId?: string
}

export interface FinanceSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  byModel: { modelId: string; modelName: string; revenue: number }[]
  byPlatform: { platform: string; revenue: number }[]
  period: string
}

// --- Chatting ---
export interface ChattingReport {
  id: string
  agencyId: string
  modelId: string
  date: string
  messages: number
  revenue: number
  conversionRate: number
  topOperator?: string
}

// --- API Responses ---
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// --- Navigation ---
export interface NavItem {
  label: string
  href: string
  icon?: string
  badge?: number
  children?: NavItem[]
  requiredPlan?: PlanId[]
}
