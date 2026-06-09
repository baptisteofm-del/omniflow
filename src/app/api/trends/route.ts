/**
 * GET /api/trends
 * 
 * Retourne les trends Instagram de l'agence (DB ou fallback seed).
 * Enrichit les résultats avec le feedback utilisateur (like/dislike).
 * Source unique : Instagram
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MOCK_TRENDS_FLAT } from '@/lib/trends/fetcher'
import { getPlanById } from '@/lib/plans'

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
      .select('id, plan_id')
      .eq('owner_id', user.id)
      .single()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const plan = getPlanById(agency?.plan_id || 'starter')
    // Afficher au max dailyTrendsCount × 3 pour montrer plusieurs jours de veille
    const dailyCount = plan?.limits?.dailyTrendsCount ?? 5
    const limit = parseInt(searchParams.get('limit') || String(dailyCount * 3), 10)

    // Pas d'agence → mode démo
    if (!agency) {
      const mock = filterMock(category, limit)
      return NextResponse.json({ success: true, trends: mock, total: mock.length, source: 'demo' })
    }

    // Récupérer les feedbacks de l'utilisateur
    let feedbackMap: Record<string, 'like' | 'dislike'> = {}
    try {
      const { data: feedbacks } = await supabase
        .from('trend_feedback')
        .select('trend_id, feedback')
        .eq('agency_id', agency.id)
      for (const row of feedbacks || []) {
        feedbackMap[row.trend_id] = row.feedback
      }
    } catch {
      // Table non créée encore — feedback ignoré
    }

    // Query trends
    let query = supabase
      .from('trends')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('platform', 'instagram')           // Instagram uniquement
      .order('captured_at', { ascending: false })

    if (category) query = query.eq('category', category)
    query = query.limit(limit)

    const { data: trendsData, error } = await query

    // Fallback → seed data démo
    if (error || !trendsData || trendsData.length === 0) {
      if (error && !error.message.includes('does not exist')) {
        console.error('[Trends GET] Query error:', error)
      }
      const mock = filterMock(category, limit)
      const mockWithFeedback = mock.map(t => ({
        ...t,
        userFeedback: feedbackMap[t.id] ?? null,
      }))
      return NextResponse.json({ success: true, trends: mockWithFeedback, total: mock.length, source: 'demo' })
    }

    const trends = trendsData.map((t: any) => {
      // Force reel/video for all Instagram Reels — never show 'photo'
      const rawType = (t.content_type || 'reel').toLowerCase()
      const contentType = rawType === 'photo' ? 'reel' : rawType
      return {
        id: t.id,
        platform: 'instagram',
        title: t.title,
        url: t.url,
        thumbnailUrl: t.thumbnail_url,
        videoUrl: t.video_url || null,
        authorUsername: t.author_username,
        authorUrl: t.author_url,
        contentType,
        engagement: t.engagement,
        likes: t.likes || null,
        category: t.category,
        tags: t.tags || [],
        capturedAt: t.captured_at,
        userFeedback: feedbackMap[t.id] ?? null,
      }
    })

    return NextResponse.json({ success: true, trends, total: trends.length, source: 'db' })
  } catch (error) {
    console.error('[Trends GET] Error:', error)
    return NextResponse.json({
      success: true,
      trends: MOCK_TRENDS_FLAT.slice(0, 20).map(t => ({ ...t, userFeedback: null })),
      total: MOCK_TRENDS_FLAT.length,
      source: 'demo',
    })
  }
}

function filterMock(category: string | null, limit: number) {
  let trends = MOCK_TRENDS_FLAT.filter(t => t.platform === 'instagram')
  if (category) trends = trends.filter(t => t.category === category)
  return trends.slice(0, limit).map(t => ({ ...t, userFeedback: null }))
}
