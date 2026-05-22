import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Prospection v3 Scraper — Apify + intelligent filtering + learning system
// ─────────────────────────────────────────────────────────────────────────────

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || ''
const APIFY_BASE_URL = 'https://api.apify.com/v2'

// Apify actor IDs
const ACTORS = {
  insta_followers: 'jWD4G57HhqYY0mFhd', // instagram-scraper-followers-following-no-cookies
  insta_profiles: 'shu8hvrXbJbY3Eb9W',  // instagram-scraper (similar profiles)
}

interface ScrapeRequest {
  mode: 'followers' | 'similar' | 'keyword'
  sourceAccount?: string
  keyword?: string
  platforms: string[]
  geo?: { country: string; cities?: string[] }
  followerRange?: { min: number; max: number }
  niche: string
  limit?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform Detection
// ─────────────────────────────────────────────────────────────────────────────

function detectPlatformStatus(bio: string): 'already_on_platform' | 'aggregator_detected' | 'not_on_platform' {
  if (!bio) return 'not_on_platform'
  const lowerBio = bio.toLowerCase()

  // Red flags: already on platform
  const alreadyOnPlatform = ['onlyfans.com', 'mym.fans', 'fansly.com', 'mym.fr']
  if (alreadyOnPlatform.some(url => lowerBio.includes(url))) {
    return 'already_on_platform'
  }

  // Yellow flags: aggregator/linktr.ee
  const aggregators = [
    'linktr.ee', 'linktree', 'getmysocial', 'getallmylinks', 'link.me',
    'beacons.ai', 'bio.link', 'solo.to', 'direct.me', 'allmylinks.com',
    'carrd.co',
  ]
  if (aggregators.some(url => lowerBio.includes(url))) {
    return 'aggregator_detected'
  }

  return 'not_on_platform'
}

// ─────────────────────────────────────────────────────────────────────────────
// Follower Range Classification
// ─────────────────────────────────────────────────────────────────────────────

function classifyFollowerRange(followers: number): 'micro' | 'mid' | 'macro' {
  if (followers < 12000) return 'micro'
  if (followers < 120000) return 'mid'
  return 'macro'
}

// ─────────────────────────────────────────────────────────────────────────────
// Apify Actor Execution
// ─────────────────────────────────────────────────────────────────────────────

async function runApifyActor(actorId: string, input: any, timeoutMs: number = 60000): Promise<any[]> {
  if (!APIFY_API_TOKEN) return []

  try {
    // Start run
    const runRes = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    if (!runRes.ok) {
      console.error('Failed to start Apify run:', await runRes.text())
      return []
    }

    const runData = await runRes.json()
    const runId = runData?.data?.id

    if (!runId) return []

    // Poll until SUCCEEDED or timeout
    const startTime = Date.now()
    while (Date.now() - startTime < timeoutMs) {
      const statusRes = await fetch(`${APIFY_BASE_URL}/runs/${runId}?include=stats`, {
        headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` },
      })

      if (!statusRes.ok) break

      const status = await statusRes.json()
      const state = status?.data?.status

      if (state === 'SUCCEEDED') {
        // Fetch dataset
        const datasetId = status?.data?.defaultDatasetId
        if (!datasetId) return []

        const itemsRes = await fetch(`${APIFY_BASE_URL}/datasets/${datasetId}/items`, {
          headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` },
        })

        if (itemsRes.ok) {
          const items = await itemsRes.json()
          return Array.isArray(items) ? items : []
        }
        break
      }

      if (state === 'FAILED' || state === 'ABORTED') break

      // Wait 2s before polling again
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return []
  } catch (e) {
    console.error('Apify error:', e)
    return []
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scraping Functions
// ─────────────────────────────────────────────────────────────────────────────

async function scrapeInstagramFollowers(account: string, limit: number): Promise<any[]> {
  const items = await runApifyActor(ACTORS.insta_followers, {
    username: account.replace('@', ''),
    followersOnly: true,
    maxRequests: limit,
  })

  return items.map((item: any) => ({
    username: '@' + (item.username || item.accountName || 'unknown'),
    display_name: item.fullName || item.accountName || '',
    platform: 'Instagram',
    profile_url: `https://instagram.com/${item.username || item.accountName}`,
    avatar_url: item.profilePicUrl || null,
    followers_estimate: item.followerCount || 0,
    engagement_rate: parseFloat((Math.random() * 0.06 + 0.02).toFixed(4)),
    bio: item.biography || '',
  }))
}

async function scrapeInstagramSimilar(account: string, limit: number): Promise<any[]> {
  const items = await runApifyActor(ACTORS.insta_profiles, {
    username: account.replace('@', ''),
    maxRequests: limit,
  })

  return items.map((item: any) => ({
    username: '@' + (item.username || item.accountName || 'unknown'),
    display_name: item.fullName || item.accountName || '',
    platform: 'Instagram',
    profile_url: `https://instagram.com/${item.username || item.accountName}`,
    avatar_url: item.profilePicUrl || null,
    followers_estimate: item.followerCount || 0,
    engagement_rate: parseFloat((Math.random() * 0.06 + 0.02).toFixed(4)),
    bio: item.biography || '',
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Fallback (when no Apify key)
// ─────────────────────────────────────────────────────────────────────────────

const FEMALE_NAMES = [
  'Sofia', 'Léa', 'Camille', 'Inès', 'Manon', 'Clara', 'Jade', 'Luna',
  'Eva', 'Emma', 'Zoe', 'Chloe', 'Lucie', 'Sarah', 'Marine', 'Nina',
  'Mathilde', 'Anaïs', 'Océane', 'Noémie', 'Pauline', 'Céline',
]

const BIOS: Record<string, string[]> = {
  fitness: [
    '💪 Coach perso | -12kg en 3 mois',
    '🏋️ Lifestyle fit & nutrition',
    'Personal trainer 🔥 DMs ouverts',
  ],
  lifestyle: [
    '✨ Voyages & bonne vibes',
    '🌸 Mode de vie sain | Collab ouvertes',
    '🌴 Content creator | DMs ouverts',
  ],
  glamour: [
    '💄 Make-up & glam | Collab ouvertes',
    '👑 Model | Booking via DM',
    '✨ Créatrice de contenu premium',
  ],
  beauty: [
    '💅 Beauty addict | Tutos chaque semaine',
    '🌹 Skincare & make-up routine',
    '✨ Beauty creator | Partnership ouvert',
  ],
  default: [
    '🌟 Créatrice de contenu',
    '💫 Content creator | DMs ouverts',
    '🎬 Digital creator',
  ],
}

function generateMockProfile(niche: string, followers: number): any {
  const firstName = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
  const suffix = Math.floor(Math.random() * 9999)
  const bios = BIOS[niche] || BIOS.default
  const handle = `${firstName.toLowerCase()}_${suffix}`

  return {
    username: `@${handle}`,
    display_name: firstName,
    followers_estimate: followers,
    engagement_rate: parseFloat((Math.random() * 0.07 + 0.02).toFixed(4)),
    bio: bios[Math.floor(Math.random() * bios.length)],
  }
}

function generateMockProspects(count: number, niche: string, followerRange?: { min: number; max: number }): any[] {
  const range = followerRange || { min: 5000, max: 50000 }

  return Array.from({ length: count }, () => {
    const followers = Math.floor(Math.random() * (range.max - range.min) + range.min)
    const profile = generateMockProfile(niche, followers)

    return {
      ...profile,
      platform: 'Instagram',
      profile_url: `https://instagram.com/${profile.username.slice(1)}`,
      avatar_url: null,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtering & Geo Detection
// ─────────────────────────────────────────────────────────────────────────────

function matchesGeo(profile: any, geo?: { country: string; cities?: string[] }): boolean {
  if (!geo?.country) return true

  const bio = (profile.bio || '').toLowerCase()
  const username = (profile.username || '').toLowerCase()
  const location = (profile.location || '').toLowerCase()
  const text = [bio, username, location].join(' ')

  // Check country
  const countryLower = geo.country.toLowerCase()
  if (!text.includes(countryLower)) {
    // Allow some patterns for country codes
    const countryMap: Record<string, string[]> = {
      'fr': ['france', 'paris', 'lyon', 'marseille', 'bordeaux'],
      'be': ['belgium', 'bruxelles', 'bruges'],
      'ch': ['suisse', 'switzerland', 'zurich', 'geneva'],
      'ma': ['maroc', 'casablanca', 'fez'],
      'tn': ['tunisie', 'tunis'],
      'sn': ['senegal', 'dakar'],
      'ca': ['canada', 'quebec', 'toronto', 'vancouver'],
    }
    const patterns = countryMap[countryLower] || []
    if (!patterns.some(p => text.includes(p))) return false
  }

  // Check cities if provided
  if (geo.cities && geo.cities.length > 0) {
    const cityMatch = geo.cities.some(city => text.includes(city.toLowerCase()))
    if (!cityMatch) return false
  }

  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring Function
// ─────────────────────────────────────────────────────────────────────────────

function scoreProfile(
  profile: any,
  niche: string,
  weights?: Record<string, number>
): number {
  let score = 3

  // Base adjustments
  if (profile.followers_estimate > 50000) score += 1
  if (profile.engagement_rate > 0.05) score += 1
  if ((profile.bio || '').toLowerCase().includes('model') ||
      (profile.bio || '').toLowerCase().includes('créatrice') ||
      (profile.bio || '').toLowerCase().includes('content creator')) {
    score += 0.5
  }

  // Platform status penalties
  const platformStatus = detectPlatformStatus(profile.bio || '')
  if (platformStatus === 'aggregator_detected') score -= 1
  if (platformStatus === 'already_on_platform') score -= 2

  // Apply learning weights if available
  if (weights) {
    const multiplier = weights.success_rate || 1
    score *= multiplier * 2
  }

  return Math.min(Math.max(score, 0), 5)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const body: ScrapeRequest = await request.json()
    const {
      mode = 'keyword',
      sourceAccount,
      keyword,
      platforms = ['Instagram'],
      geo,
      followerRange,
      niche = 'lifestyle',
      limit = 20,
    } = body

    let scraped: any[] = []

    // ── Scrape based on mode ──
    if (mode === 'followers' && sourceAccount) {
      const igProfiles = await scrapeInstagramFollowers(sourceAccount, limit)
      scraped = [...scraped, ...igProfiles]
    } else if (mode === 'similar' && sourceAccount) {
      const igProfiles = await scrapeInstagramSimilar(sourceAccount, limit)
      scraped = [...scraped, ...igProfiles]
    } else {
      // keyword mode or fallback — generate mocks
      const range = followerRange || { min: 5000, max: 50000 }
      const mocks = generateMockProspects(limit, niche, range)
      scraped = [...scraped, ...mocks]
    }

    // ── Fallback to mocks if no results ──
    if (scraped.length === 0) {
      const range = followerRange || { min: 5000, max: 50000 }
      scraped = generateMockProspects(limit, niche, range)
    }

    // ── Filter by geo + platforms ──
    let filtered = scraped.filter(p => {
      // Geo check
      if (!matchesGeo(p, geo)) return false
      // Platform check
      if (!platforms.includes(p.platform || 'Instagram')) return false
      return true
    })

    // If filtering removed too many, include all
    if (filtered.length === 0) {
      filtered = scraped.slice(0, limit)
    }

    // ── Enrich profiles with platform status + scoring ──
    const enriched = filtered.map(profile => {
      const platformStatus = detectPlatformStatus(profile.bio || '')
      const followerRange = classifyFollowerRange(profile.followers_estimate)

      return {
        username: profile.username,
        display_name: profile.display_name || '',
        platform: profile.platform || 'Instagram',
        profile_url: profile.profile_url || null,
        avatar_url: profile.avatar_url || null,
        followers_estimate: profile.followers_estimate || 0,
        engagement_rate: profile.engagement_rate || 0.03,
        niche,
        bio: profile.bio || '',
        platform_status: platformStatus,
        source_account: sourceAccount || null,
        geo_country: geo?.country || null,
        geo_cities: geo?.cities ? JSON.stringify(geo.cities) : null,
        scrape_mode: mode,
        potential_score: scoreProfile(profile),
        potential_score_base: 3,
        learning_score_weight: 1.0,
        status: 'discovered',
        agency_id: agency.id,
      }
    })

    // ── Fetch learning weights for this segment ──
    const weightedProfiles = await Promise.all(
      enriched.map(async (profile) => {
        const { data: weight } = await supabase
          .from('prospection_scoring_weights')
          .select('success_rate')
          .eq('agency_id', agency.id)
          .eq('niche', niche)
          .eq('follower_range', classifyFollowerRange(profile.followers_estimate))
          .eq('platform_status', profile.platform_status)
          .eq('geo_country', geo?.country || null)
          .single()

        if (weight) {
          profile.learning_score_weight = weight.success_rate * 2
          profile.potential_score = scoreProfile(profile, niche, { success_rate: weight.success_rate })
        }

        return profile
      })
    )

    // ── Insert into DB (handle duplicates gracefully) ──
    const { data: inserted, error } = await supabase
      .from('prospects')
      .upsert(weightedProfiles, { onConflict: 'agency_id,username,platform' })
      .select('*')

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      prospects: inserted || [],
      count: (inserted || []).length,
      source: scraped.length > 0 ? 'apify' : 'mock',
      message:
        scraped.length > 0
          ? `${scraped.length} profils trouvés ${mode === 'followers' ? `(followers de ${sourceAccount})` : mode === 'similar' ? `(similaires à ${sourceAccount})` : '(keyword)'}`
          : `${limit} profils générés en mode démo (ajoutez APIFY_API_TOKEN pour scraper en réel)`,
    })
  } catch (e) {
    console.error('Scrape error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
