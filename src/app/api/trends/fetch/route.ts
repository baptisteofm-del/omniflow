import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { fetchAllTrends } from '@/lib/trends/fetcher'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
    }

    // Parse body params
    let platform = 'all'
    let limit = 5
    try {
      const body = await request.json()
      platform = body.platform || 'all'
      limit = Math.min(Math.max(parseInt(body.limit) || 5, 1), 10)
    } catch {}

    // Fetch trends from all sources (real APIs + mock fallback)
    let trends = await fetchAllTrends()

    // Filter by platform (YouTube supprimé du système)
    trends = trends.filter(t => (t.platform as string) !== 'youtube')
    if (platform && platform !== 'all') {
      trends = trends.filter(t => t.platform === platform)
    }

    // Respect requested limit
    trends = trends.slice(0, limit)

    if (!trends.length) {
      return NextResponse.json({ success: true, trendsCount: 0 })
    }

    // Check if trends table exists before inserting
    const { error: tableCheck } = await supabase
      .from('trends')
      .select('id')
      .limit(1)

    if (tableCheck) {
      // Table doesn't exist yet — return success with count anyway (mock displayed on frontend)
      return NextResponse.json({
        success: true,
        trendsCount: trends.length,
        warning: 'Table "trends" non trouvée en DB — les données sont affichées en mode démo. Exécutez la migration SQL.',
      })
    }

    // Delete old trends for this agency (keep only fresh ones)
    await supabase
      .from('trends')
      .delete()
      .eq('agency_id', agency.id)
      .lt('captured_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

    // Insert new trends
    const records = trends.map((t) => ({
      agency_id: agency.id,
      platform: t.platform,
      title: t.title,
      url: t.url,
      thumbnail_url: t.thumbnailUrl || null,
      author_username: t.authorUsername || null,
      author_url: t.authorUrl || null,
      content_type: t.contentType || 'video',
      engagement: t.engagement,
      category: t.category,
      tags: t.tags,
      captured_at: new Date().toISOString(),
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('trends')
      .insert(records)
      .select('id')

    if (insertError) {
      console.error('Trends insert error:', insertError)
      // Non-fatal — mock data still shown on frontend
      return NextResponse.json({ success: true, trendsCount: trends.length, warning: insertError.message })
    }

    return NextResponse.json({ success: true, trendsCount: inserted?.length || trends.length })
  } catch (error) {
    console.error('Trends fetch error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
