import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface SearchRequest {
  platform: 'instagram' | 'tiktok' | 'both'
  hashtags: string[]
  country: string
  language: string
  followersMin: number
  followersMax: number
  engagementMin: number
  keywords: string[]
  limit: number
}

interface ApifyProfile {
  username?: string
  id?: string
  name?: string
  bio?: string
  followers?: number | string
  following?: number | string
  postsCount?: number | string
  isVerified?: boolean
  profilePictureUrl?: string
  profileLink?: string
  avgEngagementRate?: number | string
  avgComments?: number | string
  avgLikes?: number | string
}

interface ProcessedProfile {
  id: string
  platform: 'instagram' | 'tiktok'
  username: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  engagementRate: number
  country: string
  language: string
  profileUrl: string
  score: number
  scoreDetails: {
    engagement: number
    regularity: number
    bio: number
    followers: number
  }
  tags: string[]
}

interface SearchResponse {
  profiles: ProcessedProfile[]
  total: number
  platform: string
  searchParams: SearchRequest
}

const COUNTRY_CODES: Record<string, string> = {
  'FR': 'France',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'CA': 'Canada',
  'BR': 'Brazil',
}

const APIFY_ACTORS = {
  instagram: 'apify/instagram-hashtag-scraper',
  tiktok: 'clockworks/free-tiktok-scraper',
}

async function callApifyActor(
  actorId: string,
  input: Record<string, any>,
  platform: 'instagram' | 'tiktok'
): Promise<ApifyProfile[]> {
  const apiKey = process.env.APIFY_API_KEY
  if (!apiKey) {
    throw new Error('APIFY_API_KEY not configured')
  }

  // Start the actor run
  const runResponse = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  )

  if (!runResponse.ok) {
    const errorText = await runResponse.text()
    throw new Error(`Failed to start Apify run: ${errorText}`)
  }

  const runData = await runResponse.json()
  const runId = runData.data.id

  // Poll for completion (max 5 minutes)
  let status = 'RUNNING'
  let attempts = 0
  const maxAttempts = 100 // ~5 minutes with 3s interval

  while (status === 'RUNNING' && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    attempts++

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    )

    if (!statusResponse.ok) {
      throw new Error('Failed to check Apify run status')
    }

    const statusData = await statusResponse.json()
    status = statusData.data.status
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify run failed with status: ${status}`)
  }

  // Fetch results from dataset
  const resultsResponse = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`
  )

  if (!resultsResponse.ok) {
    throw new Error('Failed to fetch Apify results')
  }

  const results = await resultsResponse.json()
  return Array.isArray(results) ? results : []
}

function calculateEngagementRate(profile: ApifyProfile): number {
  const followers = parseInt(String(profile.followers || 0), 10)
  if (followers === 0) return 0

  // Calculate based on available metrics
  const avgLikes = parseInt(String(profile.avgLikes || 0), 10)
  const avgComments = parseInt(String(profile.avgComments || 0), 10)
  const totalEngagement = avgLikes + avgComments

  return (totalEngagement / followers) * 100
}

function calculatePostRegularity(profile: ApifyProfile): number {
  // Score 0-100 based on post count estimate
  // Assuming regular posting = higher post count relative to follower ratio
  const posts = parseInt(String(profile.postsCount || 0), 10)
  const followers = parseInt(String(profile.followers || 1), 10)

  const postsPerKFollowers = (posts / (followers / 1000)) || 0

  // Normalize: 50+ posts per 1K followers = 100, scale down
  return Math.min(100, (postsPerKFollowers / 50) * 100)
}

function calculateBioScore(profile: ApifyProfile, keywords: string[], language: string): number {
  const bio = (profile.bio || '').toLowerCase()

  // Check for keywords match
  let keywordMatch = 0
  if (keywords.length > 0) {
    const matches = keywords.filter((kw) =>
      bio.includes(kw.toLowerCase())
    ).length
    keywordMatch = (matches / keywords.length) * 50
  } else {
    keywordMatch = 50 // Full score if no keywords specified
  }

  // Check for content/info in bio (presence of link indicators, emoji, etc.)
  const hasLink = bio.includes('http') || bio.includes('linktr') || bio.includes('linktree')
  const hasEmoji = /\p{Emoji}/u.test(bio)
  const isDetailed = bio.length > 30

  const completenessScore = (
    (hasLink ? 20 : 0) + (hasEmoji ? 15 : 0) + (isDetailed ? 15 : 0)
  )

  return Math.min(100, keywordMatch + completenessScore)
}

function calculateFollowersScore(followers: number, min: number = 1000, max: number = 30000): number {
  // Ideal range: 1K-30K followers
  // Below 1K: scaled down
  // Within 1K-30K: 100
  // Above 30K: scaled down

  if (followers < min) {
    return (followers / min) * 100
  } else if (followers <= max) {
    return 100
  } else {
    // Decay for followers above max
    const excess = followers - max
    const decayFactor = 1 - Math.min(0.9, excess / max)
    return Math.max(0, 100 * decayFactor)
  }
}

function scoreProfile(
  profile: ApifyProfile,
  keywords: string[],
  language: string
): { score: number; details: ProcessedProfile['scoreDetails'] } {
  const engagementRate = calculateEngagementRate(profile)
  const followers = parseInt(String(profile.followers || 0), 10)

  const engagement = Math.min(100, engagementRate * 10) * 0.4 // 40% weight
  const regularity = calculatePostRegularity(profile) * 0.2 // 20% weight
  const bio = calculateBioScore(profile, keywords, language) * 0.2 // 20% weight
  const followerScore = calculateFollowersScore(followers) * 0.2 // 20% weight

  const totalScore = Math.round(engagement + regularity + bio + followerScore)

  return {
    score: Math.min(100, totalScore),
    details: {
      engagement: Math.round(engagement),
      regularity: Math.round(regularity),
      bio: Math.round(bio),
      followers: Math.round(followerScore),
    },
  }
}

function processProfiles(
  profiles: ApifyProfile[],
  platform: 'instagram' | 'tiktok',
  country: string,
  language: string,
  request: SearchRequest
): ProcessedProfile[] {
  return profiles
    .filter((p) => {
      const followers = parseInt(String(p.followers || 0), 10)
      const engagement = calculateEngagementRate(p)

      // Apply filters
      if (followers < request.followersMin || followers > request.followersMax) {
        return false
      }
      if (engagement < request.engagementMin) {
        return false
      }
      return true
    })
    .map((p) => {
      const { score, details } = scoreProfile(p, request.keywords, language)

      return {
        id: String(p.id || p.username || Math.random()),
        platform,
        username: String(p.username || p.id || 'unknown'),
        displayName: String(p.name || p.username || ''),
        avatar: String(p.profilePictureUrl || ''),
        bio: String(p.bio || ''),
        followers: parseInt(String(p.followers || 0), 10),
        following: parseInt(String(p.following || 0), 10),
        posts: parseInt(String(p.postsCount || 0), 10),
        engagementRate: Math.round(calculateEngagementRate(p) * 100) / 100,
        country,
        language,
        profileUrl: String(p.profileLink || ''),
        score,
        scoreDetails: details,
        tags: request.hashtags,
      }
    })
    .sort((a, b) => b.score - a.score)
}

async function searchPlatform(
  platform: 'instagram' | 'tiktok',
  request: SearchRequest
): Promise<ProcessedProfile[]> {
  if (request.hashtags.length === 0) {
    throw new Error('At least one hashtag is required')
  }

  const actorId = APIFY_ACTORS[platform]
  const input =
    platform === 'instagram'
      ? {
          hashtags: request.hashtags,
          resultsLimit: request.limit || 50,
          includeUserFollowers: true,
        }
      : {
          hashtags: request.hashtags,
          resultsLimit: request.limit || 50,
        }

  const profiles = await callApifyActor(actorId, input, platform)

  return processProfiles(
    profiles,
    platform,
    request.country,
    request.language,
    request
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const body: SearchRequest = await request.json()

    // Validate request
    if (!body.platform || !['instagram', 'tiktok', 'both'].includes(body.platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    if (!body.hashtags || body.hashtags.length === 0) {
      return NextResponse.json(
        { error: 'At least one hashtag is required' },
        { status: 400 }
      )
    }

    const platforms = body.platform === 'both' ? ['instagram', 'tiktok'] : [body.platform]
    let allProfiles: ProcessedProfile[] = []

    // Search each platform
    for (const platform of platforms as ('instagram' | 'tiktok')[]) {
      try {
        const platformProfiles = await searchPlatform(platform, body)
        allProfiles = allProfiles.concat(platformProfiles)
      } catch (error) {
        console.error(`Error searching ${platform}:`, error)
        // Continue with other platforms
      }
    }

    // Sort by score
    allProfiles.sort((a, b) => b.score - a.score)

    // Limit results
    const limitedProfiles = allProfiles.slice(0, body.limit || 50)

    return NextResponse.json<SearchResponse>({
      profiles: limitedProfiles,
      total: limitedProfiles.length,
      platform: body.platform,
      searchParams: body,
    })
  } catch (error) {
    console.error('Error in prospection search:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
