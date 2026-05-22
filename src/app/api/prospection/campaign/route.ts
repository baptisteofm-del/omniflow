/**
 * Campaign — bulk AI outreach generation
 * POST /api/prospection/campaign
 * Body: { prospect_ids: string[], tone?: string, agency_name?: string, agency_pitch?: string }
 * Returns: { messages: Array<{prospect_id, prospect, message, variations}> }
 */

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function generateForProspect(
  prospect: any,
  tone: string,
  agencyName: string,
  agencyPitch: string
): Promise<{ message: string; label: string }[]> {
  const followersLabel =
    prospect.followers_estimate >= 1000
      ? `${Math.round(prospect.followers_estimate / 1000)}K abonnés`
      : `${prospect.followers_estimate} abonnés`

  const platformStyle =
    prospect.platform === 'Instagram' ? 'DM Instagram (court, naturel)'
    : prospect.platform === 'TikTok' ? 'DM TikTok (très court, direct)'
    : 'DM Twitter/X (concis)'

  const prompt = `Tu es recruteur pour une agence de management de créatrices de contenu (OnlyFans/MYM).
Rédige UN message de démarchage court pour ce profil.

AGENCE: ${agencyName || 'Notre agence'} — ${agencyPitch || 'Nous multiplions les revenus des créatrices par 3 à 5 en 60 jours.'}

PROFIL:
- Username: ${prospect.username}
- Plateforme: ${prospect.platform} (${platformStyle})
- Followers: ${followersLabel}
- Niche: ${prospect.niche}
- Bio: ${prospect.bio || 'N/A'}
- Engagement: ${(prospect.engagement_rate * 100).toFixed(1)}%

RÈGLES:
- Max 4 lignes
- Personnalise avec un détail du profil (bio, niche, taille)
- Ne jamais mentionner OnlyFans/MYM directement
- Dire "monétiser ton audience" ou "revenus supplémentaires"
- Ton: ${tone}
- Finir par question ouverte ou CTA court

Réponds UNIQUEMENT avec le message, rien d'autre.`

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
    return [{ message: text, label: 'Message IA' }]
  } catch {
    return [{
      message: `Hey ${prospect.username} 👋 J'ai vu ton contenu ${prospect.niche} et je pense qu'on pourrait vraiment booster tes revenus. On travaille avec des créatrices comme toi et les résultats parlent d'eux-mêmes. Tu veux qu'on en parle ?`,
      label: 'Message fallback',
    }]
  }
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

  const { prospect_ids, tone = 'chaleureux et direct', agency_name, agency_pitch } = await request.json()

  if (!Array.isArray(prospect_ids) || prospect_ids.length === 0) {
    return NextResponse.json({ error: 'No prospects selected' }, { status: 400 })
  }

  // Limit to 20 per campaign to avoid rate limits
  const ids = prospect_ids.slice(0, 20)

  const { data: prospects } = await supabase
    .from('prospects')
    .select('*')
    .in('id', ids)
    .eq('agency_id', agency.id)

  if (!prospects || prospects.length === 0) {
    return NextResponse.json({ error: 'No prospects found' }, { status: 404 })
  }

  // Generate messages concurrently (batched to avoid rate limits)
  const BATCH = 5
  const results: any[] = []

  for (let i = 0; i < prospects.length; i += BATCH) {
    const batch = prospects.slice(i, i + BATCH)
    const batchResults = await Promise.all(
      batch.map(async (p) => {
        const variations = await generateForProspect(p, tone, agency_name || '', agency_pitch || '')
        return { prospect_id: p.id, prospect: p, message: variations[0].message, variations }
      })
    )
    results.push(...batchResults)
    // Small pause between batches
    if (i + BATCH < prospects.length) await new Promise((r) => setTimeout(r, 500))
  }

  return NextResponse.json({ success: true, messages: results, count: results.length })
}
