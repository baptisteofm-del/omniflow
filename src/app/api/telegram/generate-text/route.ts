import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const STYLE_PROMPTS: Record<string, string> = {
  soft:            'Style doux, bienveillant, engageant. Ton chaleureux, proche, intime.',
  provocant:       'Style provocant, audacieux, mystérieux. Accrocheur, légèrement suggestif, tease.',
  direct:          'Style direct, commercial, orienté conversion. Appel à l\'action clair, efficace.',
  conversationnel: 'Style naturel, conversationnel, authentique. Comme parler à un ami proche.',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { examples, style = 'soft', count = 5, channel_name = '', existing_posts = [] } = body

    const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.soft
    const examplesText = (examples || []).filter((e: string) => e.trim()).join('\n\n')

    const avoidList = existing_posts.length > 0
      ? `\n\nPOSTS DÉJÀ UTILISÉS (ne pas répéter ces idées) :\n${existing_posts.slice(0, 10).join('\n')}`
      : ''

    const prompt = `Tu es un expert en copywriting pour agences OFM (OnlyFans Management).

STYLE : ${styleDesc}

CANAL : ${channel_name || 'Canal Telegram premium'}

${examplesText ? `EXEMPLES DE POSTS DE RÉFÉRENCE (analyse le style, le ton, la longueur) :
${examplesText}` : 'Génère des posts dans le style choisi.'}${avoidList}

CONSIGNES :
- Génère exactement ${count} posts Telegram différents
- Chaque post doit être unique, jamais répétitif
- Respecte strictement le style et le ton des exemples
- Longueur similaire aux exemples (ou 1-3 lignes si pas d'exemples)
- Adapte pour un canal Telegram (pas de hashtags, pas de @mentions)
- Inclus des emojis si présents dans les exemples
- Chaque post sur une ligne séparée par ---

RÉPONSE : donne uniquement les ${count} posts, séparés par ---`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const posts = text
      .split('---')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0)
      .slice(0, count)

    return NextResponse.json({ posts, style, count: posts.length })
  } catch (error) {
    console.error('Telegram text generation error:', error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}
