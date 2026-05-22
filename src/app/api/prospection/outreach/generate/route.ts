/**
 * AI Outreach Message Generator
 * Uses Claude to craft personalized DM outreach for each prospect.
 */

import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prospect_id, tone, agency_name, agency_pitch } = await request.json()

    // Fetch prospect details
    const { data: prospect } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospect_id)
      .single()

    if (!prospect) return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })

    const followersLabel =
      prospect.followers_estimate > 100000
        ? `${Math.round(prospect.followers_estimate / 1000)}K abonnés`
        : prospect.followers_estimate > 1000
        ? `${Math.round(prospect.followers_estimate / 1000)}K abonnés`
        : `${prospect.followers_estimate} abonnés`

    const platformDMStyle =
      prospect.platform === 'Instagram'
        ? 'DM Instagram (court, naturel, pas de formalisme)'
        : prospect.platform === 'TikTok'
        ? 'DM TikTok (très court, direct, emoji possibles)'
        : 'DM Twitter/X (concis, professionnel mais chaleureux)'

    const prompt = `Tu es un agent de recrutement pour une agence de management de créatrices de contenu (OnlyFans / MYM).
Tu dois rédiger un message de démarchage pour contacter une créatrice potentielle sur les réseaux sociaux.

CONTEXTE AGENCE:
- Nom: ${agency_name || 'Notre agence'}
- Pitch: ${agency_pitch || 'Nous gérons des créatrices de contenu et leur permettons de multiplier leurs revenus par 3 à 5 en 60 jours.'}

PROFIL CIBLE:
- Username: ${prospect.username}
- Plateforme: ${prospect.platform}
- Followers: ${followersLabel}
- Niche: ${prospect.niche}
- Bio: ${prospect.bio || 'N/A'}
- Engagement: ${(prospect.engagement_rate * 100).toFixed(1)}%

STYLE DE MESSAGE: ${platformDMStyle}
TONE: ${tone || 'chaleureux et direct'}

RÈGLES:
- Message COURT (max 4-5 lignes)
- Mentionner un élément spécifique du profil (niche, followers, bio) pour montrer qu'on a vraiment regardé
- NE PAS mentionner OnlyFans/MYM explicitement dans le premier message
- Parler de "revenus supplémentaires" ou "monétiser ton audience" à la place
- Finir par une question ouverte ou un CTA simple
- Pas de formule de politesse trop formelle
- Utiliser "tu" pas "vous"
- Si la bio contient des infos intéressantes, s'en servir pour personnaliser

Génère 3 variations du message. Format JSON:
{
  "messages": [
    { "id": 1, "text": "...", "label": "Approche directe" },
    { "id": 2, "text": "...", "label": "Approche valeur" },
    { "id": 3, "text": "...", "label": "Approche curiosité" }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    // Parse JSON from response
    let parsed
    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch?.[0] || '{}')
    } catch {
      // Fallback: return raw text as single message
      parsed = {
        messages: [
          { id: 1, text: content.text, label: 'Message IA' },
        ],
      }
    }

    return NextResponse.json({
      success: true,
      prospect,
      messages: parsed.messages,
    })
  } catch (e) {
    console.error('Outreach generate error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
