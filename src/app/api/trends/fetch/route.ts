/**
 * POST /api/trends/fetch
 * 
 * Génération manuelle de trends Instagram (système RUN)
 * 1 RUN = 10 trends = 9€ si quota épuisé
 * 
 * Body: { limit?: number }
 * Seule source autorisée : Instagram
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { fetchInstagramTrends } from '@/lib/trends/fetcher'
import { RUN_UNITS } from '@/lib/plans'
import { checkLimit } from '@/lib/plans/limits'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, plan_id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
    }

    // Parse body — on force Instagram, limit max = RUN_UNITS (10)
    let limit = RUN_UNITS
    try {
      const body = await request.json()
      limit = Math.min(Math.max(parseInt(body.limit) || RUN_UNITS, 1), RUN_UNITS)
    } catch {}

    // Vérification quota mensuel
    const limitResult = await checkLimit(agency.id, 'trendRuns')
    if (!limitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: 'quota_exceeded',
        message: `Quota mensuel atteint (${limitResult.current}/${limitResult.limit}). Achetez un RUN supplémentaire (9€).`,
        buyRun: true,
        current: limitResult.current,
        limit: limitResult.limit,
      }, { status: 429 })
    }

    // Fetch Instagram trends via Apify (ou seed fallback)
    const trends = await fetchInstagramTrends(limit)

    if (!trends.length) {
      return NextResponse.json({ success: true, trendsCount: 0 })
    }

    // Vérifier si la table trends existe
    const { error: tableCheck } = await supabase
      .from('trends')
      .select('id')
      .limit(1)

    if (tableCheck) {
      return NextResponse.json({
        success: true,
        trendsCount: trends.length,
        warning: 'Table "trends" non trouvée — mode démo actif. Exécutez la migration SQL.',
      })
    }

    // Nettoyer les anciens trends de +48h pour cette agence
    await supabase
      .from('trends')
      .delete()
      .eq('agency_id', agency.id)
      .lt('captured_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

    // Insérer les nouveaux trends
    const records = trends.map((t) => ({
      agency_id: agency.id,
      platform: 'instagram',                          // Toujours Instagram
      title: t.title,
      url: t.url,
      thumbnail_url: t.thumbnailUrl || null,
      author_username: t.authorUsername || null,
      author_url: t.authorUrl || null,
      content_type: t.contentType || 'reel',
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
      console.error('[Trends Fetch] Insert error:', insertError)
      return NextResponse.json({
        success: true,
        trendsCount: trends.length,
        warning: insertError.message,
      })
    }

    // Enregistrer le RUN dans trend_runs pour le suivi du quota
    try {
      await supabase.from('trend_runs').insert({
        agency_id: agency.id,
        trends_count: inserted?.length || trends.length,
        platform: 'instagram',
        created_at: new Date().toISOString(),
      })
    } catch {
      // Non-fatal si la table trend_runs n'existe pas encore
    }

    return NextResponse.json({
      success: true,
      trendsCount: inserted?.length || trends.length,
    })
  } catch (error) {
    console.error('[Trends Fetch] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
