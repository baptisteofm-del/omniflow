/**
 * Outreach Queue — CRUD
 * GET  /api/prospection/outreach        → list outreach messages for agency
 * POST /api/prospection/outreach        → create/queue a message
 * PATCH /api/prospection/outreach       → update status (sent/replied/no_response/signed/rejected)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('outreach_messages')
    .select('*, prospects(username, platform, followers_estimate, niche, avatar_url, profile_url)')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ outreach: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

  const { prospect_id, message, platform, ai_generated } = await request.json()

  const { data, error } = await supabase
    .from('outreach_messages')
    .insert({
      agency_id: agency.id,
      prospect_id,
      message,
      platform,
      ai_generated: ai_generated ?? true,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also update prospect status to 'contacted'
  await supabase
    .from('prospects')
    .update({ status: 'contacted' })
    .eq('id', prospect_id)

  return NextResponse.json({ success: true, outreach: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, reply_content } = await request.json()

  const update: Record<string, any> = { status }
  if (status === 'sent') update.sent_at = new Date().toISOString()
  if (status === 'replied') {
    update.replied_at = new Date().toISOString()
    if (reply_content) update.reply_content = reply_content
  }

  const { data, error } = await supabase
    .from('outreach_messages')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync prospect status
  if (status === 'signed' && data.prospect_id) {
    await supabase
      .from('prospects')
      .update({ status: 'signed' })
      .eq('id', data.prospect_id)
  } else if (status === 'replied' && data.prospect_id) {
    await supabase
      .from('prospects')
      .update({ status: 'discussing' })
      .eq('id', data.prospect_id)
  }

  return NextResponse.json({ success: true, outreach: data })
}
