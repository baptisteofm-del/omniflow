/**
 * Trends Fetcher — Instagram uniquement
 * 
 * Source unique : Instagram via Apify
 * Fallback : données seed réelles si API indisponible
 * 
 * Système de feedback (like/dislike) intégré côté DB
 */

import axios from 'axios'
import { SEED_TRENDS } from './seed-data'

export interface Trend {
  id: string
  platform: 'instagram'
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  authorUsername?: string
  authorUrl?: string
  contentType: 'video' | 'photo' | 'reel' | 'carousel'
  engagement: number
  likes: number
  postDate?: string
  category: string
  tags: string[]
  capturedAt: Date
  // Feedback utilisateur
  userFeedback?: 'like' | 'dislike' | null
}

// ─── Helpers ──────────────────────────────────────────────────────────

function detectContentType(id: string, url: string): 'video' | 'photo' | 'reel' | 'carousel' {
  if (url.includes('/reel/') || id.includes('reel')) return 'reel'
  if (url.includes('e15') || id.includes('video')) return 'video'
  if (id.includes('carousel') || url.includes('carousel')) return 'carousel'
  return 'photo'
}

function estimateLikes(engagement: number): number {
  // Instagram: engagement ≈ views, likes ~6%
  return Math.round(engagement * 0.06)
}

function determineCategoryFromCaption(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('workout')) return 'fitness'
  if (lower.includes('makeup') || lower.includes('skincare') || lower.includes('beauty')) return 'beauty'
  if (lower.includes('fashion') || lower.includes('haul') || lower.includes('outfit') || lower.includes('style')) return 'fashion'
  if (lower.includes('travel') || lower.includes('vacation') || lower.includes('luxury')) return 'travel'
  if (lower.includes('dance') || lower.includes('dancing')) return 'dance'
  if (lower.includes('wellness') || lower.includes('yoga') || lower.includes('meditation')) return 'wellness'
  if (lower.includes('motivation') || lower.includes('mindset') || lower.includes('success')) return 'motivation'
  if (lower.includes('model') || lower.includes('photoshoot') || lower.includes('glamour')) return 'glamour'
  return 'lifestyle'
}

function extractHashtags(text: string): string[] {
  return (text.match(/#[\w]+/g) || []).map(tag => tag.substring(1))
}

// ─── Apify ────────────────────────────────────────────────────────────

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const APIFY_BASE_URL = 'https://api.apify.com/v2'

// Hashtags Instagram par niche (créatrices de contenu)
const INSTAGRAM_HASHTAGS = [
  'fitnessgirl',
  'beautytutorial',
  'luxurylifestyle',
  'glamourmodel',
  'fashionmodel',
  'makeuptutorial',
  'bodygoals',
  'workoutmotivation',
  'skincareRoutine',
  'modellife',
]

/**
 * Récupère des trends Instagram via Apify Instagram Hashtag Scraper
 * @param limit Nombre de trends à récupérer
 */
async function fetchInstagramTrendsFromApify(limit: number): Promise<Trend[]> {
  if (!APIFY_API_TOKEN) {
    console.warn('[Trends] APIFY_API_TOKEN manquant — mode fallback')
    return []
  }

  try {
    console.log(`[Trends] Fetching ${limit} Instagram trends via Apify...`)

    // Sélectionner des hashtags aléatoires pour diversifier
    const selectedHashtags = INSTAGRAM_HASHTAGS
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const response = await axios.post(
      `${APIFY_BASE_URL}/acts/apify~instagram-hashtag-scraper/runs`,
      {
        hashtags: selectedHashtags,
        resultsLimit: Math.ceil(limit * 1.5), // buffer pour filtrage
        onlyReels: false,
      },
      {
        headers: { Authorization: `Bearer ${APIFY_API_TOKEN}` },
        timeout: 30000,
      }
    )

    const runId = response.data?.data?.id
    if (!runId) throw new Error('Run ID manquant dans la réponse Apify')

    // Attendre la completion du run
    let runData = response.data.data
    let attempts = 0
    const maxAttempts = 30

    while (!['SUCCEEDED', 'FAILED', 'ABORTED'].includes(runData.status) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const statusRes = await axios.get(`${APIFY_BASE_URL}/runs/${runId}`, {
        headers: { Authorization: `Bearer ${APIFY_API_TOKEN}` },
      })
      runData = statusRes.data.data
      attempts++
    }

    if (runData.status !== 'SUCCEEDED') {
      throw new Error(`Apify run terminé avec le statut : ${runData.status}`)
    }

    const resultsRes = await axios.get(`${APIFY_BASE_URL}/runs/${runId}/dataset/items`, {
      headers: { Authorization: `Bearer ${APIFY_API_TOKEN}` },
    })

    const items = resultsRes.data || []

    return items
      .filter((item: any) => item.ownerUsername && (item.likeCount || item.viewCount))
      .slice(0, limit)
      .map((item: any, index: number) => {
        const engagementVal = (item.viewCount || item.likeCount || 0) + (item.commentCount || 0)
        const postUrl = item.postUrl || `https://instagram.com/p/${item.shortCode || item.id}`
        return {
          id: `ig-apify-${Date.now()}-${index}`,
          platform: 'instagram' as const,
          title: (item.caption || '').substring(0, 120) || `Post Instagram @${item.ownerUsername}`,
          description: item.caption,
          url: postUrl,
          thumbnailUrl: item.displayUrl || item.thumbnail,
          authorUsername: item.ownerUsername,
          authorUrl: `https://instagram.com/${item.ownerUsername}`,
          contentType: item.isVideo ? 'reel' : detectContentType(`ig-${index}`, postUrl),
          engagement: engagementVal,
          likes: item.likeCount || estimateLikes(engagementVal),
          postDate: item.timestamp,
          category: determineCategoryFromCaption(item.caption || ''),
          tags: extractHashtags(item.caption || ''),
          capturedAt: new Date(),
        }
      })
  } catch (error) {
    console.error('[Trends] Apify Instagram fetch failed:', error)
    return []
  }
}

// ─── Données de fallback (seed Instagram uniquement) ──────────────────

function getSeedInstagramTrends(): Trend[] {
  return SEED_TRENDS
    .filter(t => t.platform === 'instagram')
    .map(t => ({
      id: t.id,
      platform: 'instagram' as const,
      title: t.title,
      description: undefined,
      url: t.url,
      thumbnailUrl: t.thumbnailUrl,
      authorUsername: t.authorUsername.replace('@', ''),
      authorUrl: t.authorUrl,
      contentType: detectContentType(t.id, t.url),
      engagement: t.engagement,
      likes: estimateLikes(t.engagement),
      postDate: t.capturedAt,
      category: t.category,
      tags: t.tags,
      capturedAt: new Date(t.capturedAt),
    }))
    .sort((a, b) => b.engagement - a.engagement)
}

/**
 * Export des trends de fallback (seed Instagram)
 * Utilisé quand l'API est indisponible et en mode démo
 */
export const MOCK_TRENDS_FLAT: Trend[] = getSeedInstagramTrends()

// ─── Export principal ─────────────────────────────────────────────────

/**
 * Récupère des trends Instagram
 * Essaie Apify en premier, fallback sur seed data
 * 
 * @param limit Nombre de trends souhaité
 */
export async function fetchInstagramTrends(limit: number = 10): Promise<Trend[]> {
  console.log(`[Trends] Fetching ${limit} Instagram trends...`)

  try {
    const apifyTrends = await fetchInstagramTrendsFromApify(limit)

    if (apifyTrends.length > 0) {
      console.log(`[Trends] ✅ ${apifyTrends.length} trends Instagram récupérés via Apify`)
      return apifyTrends.slice(0, limit)
    }

    // Fallback sur les données seed
    console.log('[Trends] ⚠️ Apify indisponible — fallback sur seed data')
    const seed = getSeedInstagramTrends()
    // Shuffle pour diversifier à chaque appel
    const shuffled = seed.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit)
  } catch (error) {
    console.error('[Trends] Erreur critique:', error)
    return getSeedInstagramTrends().slice(0, limit)
  }
}

/**
 * @deprecated Utilisez fetchInstagramTrends() — source unique Instagram
 */
export async function fetchAllTrends(): Promise<Trend[]> {
  return fetchInstagramTrends(20)
}

// ─── Filtres ──────────────────────────────────────────────────────────

export function filterTrends(
  trends: Trend[],
  filters: {
    category?: string
    contentType?: string
    limit?: number
  }
): Trend[] {
  let filtered = [...trends]
  if (filters.category) filtered = filtered.filter(t => t.category === filters.category)
  if (filters.contentType) filtered = filtered.filter(t => t.contentType === filters.contentType)
  if (filters.limit) filtered = filtered.slice(0, filters.limit)
  return filtered
}

/**
 * Génère un prompt IA à partir d'un trend Instagram
 */
export function generatePromptFromTrend(trend: Trend): string {
  const categoryPrompts: Record<string, string> = {
    fitness:    '— créer un contenu fitness professionnel montrant une routine d\'entraînement efficace ou une transformation physique motivante',
    beauty:     '— créer un contenu beauté/maquillage ou routine skincare soigné',
    lifestyle:  '— créer un contenu lifestyle aspirationnel montrant un moment luxueux ou inspirant',
    fashion:    '— créer un contenu mode mettant en valeur le style, les tenues ou des marques luxe',
    wellness:   '— créer un contenu bien-être apaisant (yoga, méditation)',
    travel:     '— créer un contenu voyage luxe ou découverte de destination',
    dance:      '— créer un contenu danse ou mouvement engageant',
    glamour:    '— créer un contenu glamour professionnel, séance photo ou modèle',
    motivation: '— créer un contenu motivationnel avec un message fort et percutant',
  }

  const base = `Inspiré de ce trend Instagram ${trend.contentType} par @${trend.authorUsername} : "${trend.title}"`
  const specific = categoryPrompts[trend.category] || '— créer du contenu tendance engageant'
  return `${base}${specific}. Qualité professionnelle, esthétique tendance, fort potentiel d\'engagement Instagram.`
}
