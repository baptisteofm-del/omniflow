/**
 * n8n Webhook Receiver — Prospection
 *
 * Configure your n8n workflow to POST scraped profiles to:
 *   POST https://omniflowapp.ai/api/prospection/webhook
 *   Headers: { "x-webhook-secret": "<PROSPECTION_WEBHOOK_SECRET env var>" }
 *
 * Expected body:
 * {
 *   agency_id: string,        // UUID of the target agency
 *   prospects: [{
 *     username: string,       // "@handle"
 *     display_name?: string,
 *     platform: "Instagram" | "TikTok" | "Twitter",
 *     profile_url?: string,
 *     avatar_url?: string,
 *     followers_estimate: number,
 *     engagement_rate?: number,
 *     niche?: string,
 *     bio?: string,
 *     potential_score?: number   // 1-5
 *   }]
 * }
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_SECRET = process.env.PROSPECTION_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  // Verify secret
  const secret = request.headers.get('x-webhook-secret')
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()
    const { agency_id, prospects } = body

    if (!agency_id || !Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verify agency exists
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', agency_id)
      .single()
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const records = prospects.map((p: any) => ({
      agency_id,
      username: p.username,
      display_name: p.display_name || null,
      platform: p.platform,
      profile_url: p.profile_url || null,
      avatar_url: p.avatar_url || null,
      followers_estimate: p.followers_estimate || 0,
      engagement_rate: p.engagement_rate || 0.04,
      niche: p.niche || 'lifestyle',
      bio: p.bio || '',
      potential_score: p.potential_score || 3,
      status: 'discovered',
      notes: '',
    }))

    const { data: inserted, error } = await supabase
      .from('prospects')
      .upsert(records, { onConflict: 'agency_id,username,platform', ignoreDuplicates: true })
      .select('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      inserted: inserted?.length || 0,
      message: `${inserted?.length || 0} profils ajoutés via n8n`,
    })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
