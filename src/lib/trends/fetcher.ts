/**
 * Trends Fetcher
 * Récupère les tendances depuis les sources publiques
 * (TikTok, Instagram, Twitter/X, Reddit)
 * 
 * En cas d'indisponibilité des APIs, génère des données mockées réalistes.
 */

export interface Trend {
  id: string
  platform: 'tiktok' | 'instagram' | 'twitter' | 'reddit'
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  engagement: number // vues, likes, etc.
  category: string
  tags: string[]
  capturedAt: Date
}

// Catégories pertinentes pour OnlyFans
const CATEGORIES = [
  'lifestyle',
  'fitness',
  'glamour',
  'fashion',
  'beauty',
  'wellness',
  'motivation',
  'travel',
  'music',
  'dance',
]

// Tags populaires par plateforme
const TRENDING_TAGS: Record<string, string[]> = {
  tiktok: ['FYP', 'ForYou', 'Viral', 'TikTokMademeBuyIt', 'Trending', 'ForiYouPage'],
  instagram: ['Reels', 'Trending', 'ForYou', 'Explore', 'Viral', 'InstagramReels'],
  twitter: ['Trending', 'Viral', 'Now', 'Hot', 'Breaking'],
  reddit: ['Trending', 'Popular', 'HotPost', 'TopPost'],
}

// Mock data — tendances réalistes pour démo
const MOCK_TRENDS: Record<string, Omit<Trend, 'id'>[]> = {
  tiktok: [
    {
      platform: 'tiktok',
      title: 'Summer Glow-Up Challenge: 30 Days to Confidence',
      description: 'Transformation challenge showcasing daily skincare & fitness routines',
      url: 'https://www.tiktok.com/@trending/video/123456789',
      engagement: 2500000,
      category: 'fitness',
      tags: ['challenge', 'transformation', 'skincare', 'fitness'],
      capturedAt: new Date(),
    },
    {
      platform: 'tiktok',
      title: 'GRWM: Get Ready With Me - Luxury Edition',
      description: 'High-end makeup and styling from bedroom to night out',
      url: 'https://www.tiktok.com/@trending/video/987654321',
      engagement: 1800000,
      category: 'beauty',
      tags: ['grwm', 'makeup', 'luxury', 'styling'],
      capturedAt: new Date(),
    },
    {
      platform: 'tiktok',
      title: 'Morning Routine That Changed My Life',
      description: 'Wellness routine combining yoga, meditation, and breakfast',
      url: 'https://www.tiktok.com/@trending/video/456789123',
      engagement: 3200000,
      category: 'wellness',
      tags: ['routine', 'wellness', 'motivation', 'morning'],
      capturedAt: new Date(),
    },
    {
      platform: 'tiktok',
      title: 'Fit Check: Designer Everything',
      description: 'Fashion haul and styling tips for premium brands',
      url: 'https://www.tiktok.com/@trending/video/321654987',
      engagement: 1500000,
      category: 'fashion',
      tags: ['fashion', 'haul', 'designer', 'fitcheck'],
      capturedAt: new Date(),
    },
    {
      platform: 'tiktok',
      title: 'POV: You Just Got a Personal Trainer',
      description: 'Quick at-home workouts for busy lifestyles',
      url: 'https://www.tiktok.com/@trending/video/789123456',
      engagement: 2100000,
      category: 'fitness',
      tags: ['workout', 'pov', 'fitness', 'athome'],
      capturedAt: new Date(),
    },
  ],
  instagram: [
    {
      platform: 'instagram',
      title: 'Beach Body Goals: Summer Fitness Journey',
      description: 'Beachfront workouts and summer body transformations',
      url: 'https://www.instagram.com/p/ABC123DEF/',
      engagement: 890000,
      category: 'fitness',
      tags: ['summerbody', 'fitness', 'beach', 'transformation'],
      capturedAt: new Date(),
    },
    {
      platform: 'instagram',
      title: 'Glowing Skin Secrets: The Korean Beauty Trend',
      description: 'K-beauty routine and product recommendations',
      url: 'https://www.instagram.com/p/XYZ789UVW/',
      engagement: 1200000,
      category: 'beauty',
      tags: ['kbeauty', 'skincare', 'glow', 'routine'],
      capturedAt: new Date(),
    },
    {
      platform: 'instagram',
      title: 'Luxury Lifestyle: A Day in the Life',
      description: 'Behind-the-scenes of high-end lifestyle content',
      url: 'https://www.instagram.com/p/QRS456TUV/',
      engagement: 650000,
      category: 'lifestyle',
      tags: ['luxury', 'lifestyle', 'dayinthelife', 'behindthescenes'],
      capturedAt: new Date(),
    },
    {
      platform: 'instagram',
      title: 'Sustainable Fashion: Style with Purpose',
      description: 'Eco-friendly fashion choices and styling tips',
      url: 'https://www.instagram.com/p/JKL789MNO/',
      engagement: 540000,
      category: 'fashion',
      tags: ['sustainable', 'fashion', 'eco', 'style'],
      capturedAt: new Date(),
    },
    {
      platform: 'instagram',
      title: 'Wellness Reset: Mental Health & Self-Care',
      description: 'Mental wellness practices and self-care routines',
      url: 'https://www.instagram.com/p/PQR234STU/',
      engagement: 780000,
      category: 'wellness',
      tags: ['wellness', 'mentalhealth', 'selfcare', 'reset'],
      capturedAt: new Date(),
    },
  ],
  twitter: [
    {
      platform: 'twitter',
      title: 'The Fitness Industry is Changing Forever',
      description: 'Discussion about AI-powered personal training trends',
      url: 'https://twitter.com/i/web/status/123456789',
      engagement: 450000,
      category: 'fitness',
      tags: ['fitness', 'ai', 'trends', 'industry'],
      capturedAt: new Date(),
    },
    {
      platform: 'twitter',
      title: 'Beauty Standards Are Evolving Beautifully',
      description: 'Thread about inclusive beauty and body positivity',
      url: 'https://twitter.com/i/web/status/987654321',
      engagement: 320000,
      category: 'beauty',
      tags: ['beauty', 'inclusive', 'bodypositive', 'diversity'],
      capturedAt: new Date(),
    },
    {
      platform: 'twitter',
      title: 'Luxury Brands Go Digital: The Future of Commerce',
      description: 'Analysis of NFTs and digital luxury trends',
      url: 'https://twitter.com/i/web/status/456789012',
      engagement: 380000,
      category: 'lifestyle',
      tags: ['luxury', 'digital', 'nft', 'commerce'],
      capturedAt: new Date(),
    },
    {
      platform: 'twitter',
      title: 'Creator Economy Hits $100B Milestone',
      description: 'Insights on creator earnings and platform growth',
      url: 'https://twitter.com/i/web/status/321654987',
      engagement: 560000,
      category: 'lifestyle',
      tags: ['creators', 'economy', 'growth', 'earnings'],
      capturedAt: new Date(),
    },
    {
      platform: 'twitter',
      title: 'Mental Wellness Apps Are Revolutionary',
      description: 'Thread about meditation and wellness tech',
      url: 'https://twitter.com/i/web/status/654321789',
      engagement: 290000,
      category: 'wellness',
      tags: ['wellness', 'mentalhealth', 'tech', 'apps'],
      capturedAt: new Date(),
    },
  ],
  reddit: [
    {
      platform: 'reddit',
      title: 'The Best Fitness Hacks No One Talks About',
      description: 'Community tips for efficient workouts and results',
      url: 'https://reddit.com/r/fitness/comments/abc123def/',
      engagement: 15000,
      category: 'fitness',
      tags: ['fitness', 'hacks', 'workout', 'tips'],
      capturedAt: new Date(),
    },
    {
      platform: 'reddit',
      title: 'Am I the Only One Who Thinks This Beauty Trend Is Perfect?',
      description: 'Discussion on new makeup trends and techniques',
      url: 'https://reddit.com/r/MakeupAddiction/comments/xyz789uvw/',
      engagement: 8200,
      category: 'beauty',
      tags: ['makeup', 'beauty', 'trend', 'discussion'],
      capturedAt: new Date(),
    },
    {
      platform: 'reddit',
      title: 'How to Build an Authentic Personal Brand Online',
      description: 'Guide to growing influence and engagement authentically',
      url: 'https://reddit.com/r/ContentCreators/comments/qrs456tuv/',
      engagement: 12500,
      category: 'lifestyle',
      tags: ['personalbrand', 'content', 'authenticity', 'guide'],
      capturedAt: new Date(),
    },
    {
      platform: 'reddit',
      title: 'Is Sustainable Fashion Really More Expensive?',
      description: 'Community debate on eco-friendly clothing costs',
      url: 'https://reddit.com/r/fashion/comments/jkl789mno/',
      engagement: 6800,
      category: 'fashion',
      tags: ['sustainable', 'fashion', 'cost', 'eco'],
      capturedAt: new Date(),
    },
    {
      platform: 'reddit',
      title: 'Wellness Glow-Up: Success Stories That Inspire',
      description: 'Community shares health transformation journeys',
      url: 'https://reddit.com/r/wellness/comments/pqr234stu/',
      engagement: 9200,
      category: 'wellness',
      tags: ['wellness', 'health', 'transformation', 'inspiration'],
      capturedAt: new Date(),
    },
  ],
}

/**
 * Récupère les trends depuis TikTok
 */
async function fetchTikTokTrends(): Promise<Trend[]> {
  try {
    // Essayer fetch de TikTok public API
    // Note: L'API non-officielle de TikTok via RapidAPI nécessite des clés
    // Pour la démo, on retourne les mocks
    console.log('Fetching TikTok trends...')
    // return await fetchTikTokAPI()
    return MOCK_TRENDS.tiktok.map((t, i) => ({
      ...t,
      id: `tiktok-${i}`,
    }))
  } catch (error) {
    console.error('TikTok fetch failed:', error)
    return MOCK_TRENDS.tiktok.map((t, i) => ({
      ...t,
      id: `tiktok-${i}`,
    }))
  }
}

/**
 * Récupère les trends depuis Instagram (hashtags)
 */
async function fetchInstagramTrends(): Promise<Trend[]> {
  try {
    // Instagram n'a pas d'API publique pour les trends
    // Scraping léger nécessiterait Puppeteer ou similaire
    console.log('Using Instagram mock trends...')
    return MOCK_TRENDS.instagram.map((t, i) => ({
      ...t,
      id: `instagram-${i}`,
    }))
  } catch (error) {
    console.error('Instagram fetch failed:', error)
    return MOCK_TRENDS.instagram.map((t, i) => ({
      ...t,
      id: `instagram-${i}`,
    }))
  }
}

/**
 * Récupère les Trending Topics depuis Twitter/X
 */
async function fetchTwitterTrends(): Promise<Trend[]> {
  try {
    // Twitter API v2 nécessite authentification Bearer
    // Pour la démo, on utilise les mocks
    console.log('Using Twitter mock trends...')
    return MOCK_TRENDS.twitter.map((t, i) => ({
      ...t,
      id: `twitter-${i}`,
    }))
  } catch (error) {
    console.error('Twitter fetch failed:', error)
    return MOCK_TRENDS.twitter.map((t, i) => ({
      ...t,
      id: `twitter-${i}`,
    }))
  }
}

/**
 * Récupère les posts top depuis Reddit
 */
async function fetchRedditTrends(): Promise<Trend[]> {
  try {
    // Reddit API publique accessible sans auth pour données publiques
    const subreddits = ['OnlyFansAdvice', 'ContentCreators', 'FitnessInfluencers']
    const trends: Trend[] = []

    for (const sub of subreddits) {
      try {
        const response = await fetch(
          `https://www.reddit.com/r/${sub}/top.json?t=day&limit=5`,
          {
            headers: {
              'User-Agent': 'OmniFlow-TrendsFetcher/1.0',
            },
          }
        )

        if (!response.ok) throw new Error(`Reddit API: ${response.status}`)

        const data = await response.json()
        const posts = data.data.children

        posts.forEach((post: any, index: number) => {
          const postData = post.data
          trends.push({
            id: `reddit-${sub}-${index}`,
            platform: 'reddit',
            title: postData.title,
            description: postData.selftext.substring(0, 200),
            url: `https://reddit.com${postData.permalink}`,
            engagement: postData.ups + postData.downs,
            category: getCategoryFromSubreddit(sub),
            tags: [sub.toLowerCase(), 'reddit'],
            capturedAt: new Date(),
          })
        })
      } catch (error) {
        console.error(`Failed to fetch Reddit r/${sub}:`, error)
      }
    }

    return trends.length > 0 ? trends : MOCK_TRENDS.reddit.map((t, i) => ({
      ...t,
      id: `reddit-${i}`,
    }))
  } catch (error) {
    console.error('Reddit fetch failed:', error)
    return MOCK_TRENDS.reddit.map((t, i) => ({
      ...t,
      id: `reddit-${i}`,
    }))
  }
}

/**
 * Détermine la catégorie selon le subreddit
 */
function getCategoryFromSubreddit(sub: string): string {
  const categoryMap: Record<string, string> = {
    OnlyFansAdvice: 'lifestyle',
    ContentCreators: 'lifestyle',
    FitnessInfluencers: 'fitness',
    MakeupAddiction: 'beauty',
    FashionAdvice: 'fashion',
    Wellness: 'wellness',
  }
  return categoryMap[sub] || 'lifestyle'
}

/**
 * Récupère TOUS les trends depuis toutes les sources
 */
export async function fetchAllTrends(): Promise<Trend[]> {
  console.log('Fetching trends from all sources...')

  const [tiktok, instagram, twitter, reddit] = await Promise.all([
    fetchTikTokTrends(),
    fetchInstagramTrends(),
    fetchTwitterTrends(),
    fetchRedditTrends(),
  ])

  const allTrends = [...tiktok, ...instagram, ...twitter, ...reddit]

  // Trier par engagement (top trends en premier)
  return allTrends.sort((a, b) => b.engagement - a.engagement)
}

/**
 * Filtre les trends selon critères
 */
export function filterTrends(
  trends: Trend[],
  filters: {
    platform?: 'tiktok' | 'instagram' | 'twitter' | 'reddit' | 'all'
    category?: string
    limit?: number
  }
): Trend[] {
  let filtered = [...trends]

  if (filters.platform && filters.platform !== 'all') {
    filtered = filtered.filter(t => t.platform === filters.platform)
  }

  if (filters.category) {
    filtered = filtered.filter(t => t.category === filters.category)
  }

  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit)
  }

  return filtered
}

/**
 * Génère un prompt pour la génération IA basé sur un trend
 */
export function generatePromptFromTrend(trend: Trend): string {
  const basePrompt = `Inspired by the trend "${trend.title}" - create a stunning ${trend.category} content piece`
  const categoryPrompts: Record<string, string> = {
    fitness: 'showing an effective workout or body transformation moment',
    beauty: 'showcasing a makeup transformation or skincare routine',
    lifestyle: 'depicting a luxurious or aspirational lifestyle moment',
    fashion: 'displaying high-end fashion styling or a clothing haul',
    wellness: 'capturing a peaceful wellness or meditation moment',
  }

  const specific = categoryPrompts[trend.category] || 'creating engaging content'
  return `${basePrompt}, ${specific}. Professional quality, trending aesthetics, high engagement potential.`
}
