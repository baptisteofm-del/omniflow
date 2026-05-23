import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MOCK_TRENDS_FLAT } from '@/lib/trends/fetcher'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', trends: [], total: 0 },
        { status: 401 }
      )
    }

    // Get agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    const { searchParams } = new URL(request.url)
    let platform = searchParams.get('platform') || 'all'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '40', 10)

    // YouTube interdit dans cette page
    if (platform === 'youtube') platform = 'all'

    // If no agency or table doesn't exist yet → return mock trends
    if (!agency) {
      const mock = filterMock(platform, category, limit)
      return NextResponse.json({
        success: true,
        trends: mock,
        total: mock.length,
        source: 'demo',
      })
    }

    let query = supabase
      .from('trends')
      .select('*')
      .eq('agency_id', agency.id)
      .order('captured_at', { ascending: false })

    if (platform !== 'all') query = query.eq('platform', platform)
    if (category) query = query.eq('category', category)
    query = query.limit(limit)

    const { data: trendsData, error } = await query

    // If table doesn't exist or is empty → return mock trends
    if (error || !trendsData || trendsData.length === 0) {
      if (error && !error.message.includes('does not exist')) {
        console.error('Trends query error:', error)
      }
      return NextResponse.json({
        success: true,
        trends: filterMock(platform, category, limit),
        total: MOCK_TRENDS_FLAT.length,
        source: 'demo',
      })
    }

    const trends = trendsData.map((t: any) => ({
      id: t.id,
      platform: t.platform,
      title: t.title,
      url: t.url,
      thumbnailUrl: t.thumbnail_url,
      authorUsername: t.author_username,
      authorUrl: t.author_url,
      contentType: t.content_type || 'video',
      engagement: t.engagement,
      category: t.category,
      tags: t.tags || [],
      capturedAt: t.captured_at,
    }))

    return NextResponse.json({ success: true, trends, total: trends.length, source: 'db' })
  } catch (error) {
    console.error('Trends GET error:', error)
    // Never show an empty error state — always return mock data as fallback
    return NextResponse.json({
      success: true,
      trends: MOCK_TRENDS_FLAT,
      total: MOCK_TRENDS_FLAT.length,
      source: 'demo',
    })
  }
}

function filterMock(platform: string, category: string | null, limit: number) {
  let trends = MOCK_TRENDS_FLAT.filter(t => t.platform !== 'youtube')
  if (platform !== 'all') trends = trends.filter((t) => t.platform === platform)
  if (category) trends = trends.filter((t) => t.category === category)
  return trends.slice(0, limit)
}
