import { fetchAllTrends, filterTrends, generatePromptFromTrend } from './src/lib/trends/fetcher'

async function testTrendsModule() {
  console.log('🧪 Testing Trends Module...\n')

  try {
    // Test 1: Fetch all trends
    console.log('📥 Fetching trends from all sources...')
    const allTrends = await fetchAllTrends()
    console.log(`✅ Fetched ${allTrends.length} trends\n`)

    // Test 2: Platform breakdown
    const byPlatform = {
      tiktok: allTrends.filter(t => t.platform === 'tiktok').length,
      instagram: allTrends.filter(t => t.platform === 'instagram').length,
      twitter: allTrends.filter(t => t.platform === 'twitter').length,
      reddit: allTrends.filter(t => t.platform === 'reddit').length,
    }
    console.log('📊 Platform breakdown:', byPlatform, '\n')

    // Test 3: Top trend
    const topTrend = allTrends[0]
    console.log('🔥 Top trend:', {
      platform: topTrend.platform,
      title: topTrend.title.substring(0, 50) + '...',
      engagement: topTrend.engagement,
      category: topTrend.category,
    }, '\n')

    // Test 4: Filter by platform
    console.log('🔍 Testing filters...')
    const tikTokTrends = filterTrends(allTrends, { platform: 'tiktok', limit: 3 })
    console.log(`✅ Found ${tikTokTrends.length} TikTok trends (limited to 3)\n`)

    // Test 5: Filter by category
    const fitnessTrends = filterTrends(allTrends, { category: 'fitness', limit: 2 })
    console.log(`✅ Found ${fitnessTrends.length} fitness trends (limited to 2)\n`)

    // Test 6: Generate prompt from trend
    console.log('💡 Generating AI prompt from top trend...')
    const prompt = generatePromptFromTrend(topTrend)
    console.log(`Prompt:\n${prompt}\n`)

    console.log('✨ All tests passed!')
  } catch (error) {
    console.error('❌ Test error:', error)
    process.exit(1)
  }
}

testTrendsModule()
