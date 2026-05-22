/**
 * Follow-up system
 * GET  /api/prospection/followup → prospects needing follow-up (no reply after X days)
 * POST /api/prospection/followup → queue follow-up messages for overdue prospects
 */

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id').eq('owner_id', user.id).single()
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const daysThreshold = parseInt(searchParams.get('days') || '5')

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysThreshold)

  // Find prospects that were contacted but never replied, sent > X days ago
  const { data: overdue } = await supabase
    .from('outreach_messages')
    .select('*, prospects(id, username, platform, niche, followers_estimate, bio, avatar_url)')
    .eq('agency_id', agency.id)
    .eq('status', 'sent')
    .lt('sent_at', cutoff.toISOString())
    .order('sent_at', { ascending: true })

  return NextResponse.json({
    overdue: overdue || [],
    count: overdue?.length || 0,
    threshold_days: daysThreshold,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id').eq('owner_id', user.id).single()
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  const { outreach_ids, agency_name, agency_pitch } = await request.json()

  if (!Array.isArray(outreach_ids) || outreach_ids.length === 0) {
    return NextResponse.json({ error: 'No outreach IDs provided' }, { status: 400 })
  }

  // Fetch original messages + prospects
  const { data: originals } = await supabase
    .from('outreach_messages')
    .select('*, prospects(id, username, platform, niche, bio, followers_estimate)')
    .in('id', outreach_ids)
    .eq('agency_id', agency.id)

  if (!originals?.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const followups: any[] = []

  for (const orig of originals) {
    const p = orig.prospects as any
    if (!p) continue

    const prompt = `Tu es recruteur pour une agence de management de créatrices (${agency_name || 'notre agence'}).
Tu as déjà contacté ${p.username} (${p.platform}, niche: ${p.niche}) il y a quelques jours sans réponse.

Message initial envoyé: "${orig.message}"

Rédige UN message de relance court (3 lignes max).
- Ne pas mentionner OF/MYM
- Ton relax, pas insistant, juste un petit rappel
- Nouvelle accroche différente
- Finir par "Pas de souci si pas intéressée, bonne continuation 😊" si c'est la 2e relance

Réponds UNIQUEMENT avec le message.`

    try {
      const res = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''

      // Insert follow-up message
      const { data: inserted } = await supabase
        .from('outreach_messages')
        .insert({
          agency_id: agency.id,
          prospect_id: p.id,
          message: text,
          platform: p.platform,
          ai_generated: true,
          status: 'pending',
        })
        .select('id')
        .single()

      followups.push({ prospect_id: p.id, username: p.username, message: text, outreach_id: inserted?.id })
    } catch { /* skip */ }
  }

  // Mark originals as 'no_response'
  await supabase
    .from('outreach_messages')
    .update({ status: 'no_response' })
    .in('id', outreach_ids)

  return NextResponse.json({ success: true, followups, count: followups.length })
}
