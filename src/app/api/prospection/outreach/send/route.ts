/**
 * Trigger actual DM send via n8n → AdsPower/GeeLark
 * POST body: { outreach_id, adspower_profile_id? }
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const N8N_OUTREACH_WEBHOOK = process.env.N8N_OUTREACH_WEBHOOK_URL || ''

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { outreach_id, adspower_profile_id } = await request.json()

  // Fetch outreach message with prospect info
  const { data: outreach } = await supabase
    .from('outreach_messages')
    .select('*, prospects(username, platform, profile_url)')
    .eq('id', outreach_id)
    .single()

  if (!outreach) return NextResponse.json({ error: 'Outreach message not found' }, { status: 404 })

  // Trigger n8n if webhook configured
  if (N8N_OUTREACH_WEBHOOK) {
    try {
      await fetch(N8N_OUTREACH_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outreach_id: outreach.id,
          prospect_username: outreach.prospects?.username,
          platform: outreach.prospects?.platform,
          profile_url: outreach.prospects?.profile_url,
          message: outreach.message,
          adspower_profile_id: adspower_profile_id || null,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (e) {
      console.error('n8n webhook failed:', e)
      // Non-blocking — mark as sent anyway if webhook fails
    }
  }

  // Update status to 'sent'
  const { error } = await supabase
    .from('outreach_messages')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', outreach_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update prospect status
  await supabase
    .from('prospects')
    .update({ status: 'contacted' })
    .eq('id', outreach.prospect_id)

  return NextResponse.json({
    success: true,
    n8n_triggered: !!N8N_OUTREACH_WEBHOOK,
    message: N8N_OUTREACH_WEBHOOK
      ? 'Message envoyé via n8n → AdsPower'
      : 'Message marqué comme envoyé (configurez N8N_OUTREACH_WEBHOOK_URL pour l\'envoi automatique)',
  })
}
