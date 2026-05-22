import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Prospection Feedback API — Log outcomes and recalculate learning weights
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

    const { prospect_id, outcome } = await request.json()

    if (!prospect_id || !['signed', 'rejected', 'no_response'].includes(outcome)) {
      return NextResponse.json(
        { error: 'Invalid prospect_id or outcome' },
        { status: 400 }
      )
    }

    // 1. Update prospect status
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('niche, followers_estimate, platform_status, geo_country, scrape_mode')
      .eq('id', prospect_id)
      .eq('agency_id', agency.id)
      .single()

    if (prospectError || !prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    // Map outcome to status
    const statusMap: Record<string, string> = {
      signed: 'signed',
      rejected: 'rejected',
      no_response: 'discovered', // Keep as discovered
    }

    await supabase
      .from('prospects')
      .update({ status: statusMap[outcome] })
      .eq('id', prospect_id)

    // 2. Classify follower range
    function classifyFollowerRange(followers: number): 'micro' | 'mid' | 'macro' {
      if (followers < 12000) return 'micro'
      if (followers < 120000) return 'mid'
      return 'macro'
    }

    const followerRange = classifyFollowerRange(prospect.followers_estimate)
    const platformStatus = prospect.platform_status || 'not_on_platform'
    const geoCountry = prospect.geo_country || null

    // 3. Call the learning upsert function
    const { data: learningResult, error: learningError } = await supabase.rpc(
      'upsert_learning_and_recalculate',
      {
        p_agency_id: agency.id,
        p_prospect_id: prospect_id,
        p_niche: prospect.niche,
        p_geo_country: geoCountry,
        p_follower_range: followerRange,
        p_platform_status: platformStatus,
        p_outcome: outcome,
      }
    )

    if (learningError) {
      console.error('Learning error:', learningError)
      return NextResponse.json(
        { error: 'Failed to update learning weights' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      outcome,
      prospect_id,
      new_success_rate: learningResult?.[0]?.success_rate_output || null,
      message: `Prospect updated to "${outcome}" and learning weights recalculated`,
    })
  } catch (e) {
    console.error('Feedback error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET to fetch learning stats for a segment
export async function GET(request: NextRequest) {
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

    // Fetch all learning weights for the agency
    const { data: weights, error } = await supabase
      .from('prospection_scoring_weights')
      .select('*')
      .eq('agency_id', agency.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by niche + geo
    const bySegment = weights.reduce(
      (acc: Record<string, any[]>, w: any) => {
        const key = `${w.niche}-${w.geo_country || 'global'}`
        if (!acc[key]) acc[key] = []
        acc[key].push(w)
        return acc
      },
      {}
    )

    return NextResponse.json({
      success: true,
      weights_count: weights.length,
      by_segment: bySegment,
    })
  } catch (e) {
    console.error('GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
