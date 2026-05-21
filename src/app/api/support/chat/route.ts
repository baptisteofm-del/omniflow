import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Tu es l'assistant OmniFlow. Tu aides les agences OnlyFans à utiliser la plateforme 24h/24.

Fonctionnalités OmniFlow que tu connais:
- Posting AdsPower / GeeLark: publication automatisée multi-comptes
- Génération vidéo IA Kling: création de vidéos de qualité professionelle
- Chatting IA: répondre automatiquement aux DMs des fans
- Veille contenu: analyse intelligente des tendances
- Dashboard financier: suivi en temps réel des revenus et des fans
- Banque de médias: organiser et réutiliser les contenus générés
- Synchronisation OnlyFans/MYM: import automatique des profils
- Prospection et analyse de fans
- Rapports hebdomadaires automatiques

Directives:
- Réponds en français, sois concis et utile
- Fournis des réponses claires et pratiques
- Si l'utilisateur demande quelque chose que tu ne sais pas: "Je ne suis pas sûr de ça. Connecte-toi avec notre équipe support via @omniflowapp_bot sur Telegram pour une aide personnalisée."
- Reste professionnel mais amical
- Limite tes réponses à 500 tokens maximum
- Si l'utilisateur demande de contacter l'équipe ou a besoin d'aide urgent → suggère Telegram: "📱 Contact notre équipe: @omniflowapp_bot sur Telegram"`

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    // Préparer l'historique pour Claude
    const messages = [
      ...(conversationHistory || []),
      { role: 'user' as const, content: message.trim() },
    ]

    // Appel à Claude Haiku
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    })

    const aiMessage =
      response.content[0].type === 'text' ? response.content[0].text : 'Erreur de traitement'

    return NextResponse.json({
      message: aiMessage,
    })
  } catch (error) {
    console.error('[Support Chat API Error]', error)

    // Retourner une réponse cohérente même en cas d'erreur
    return NextResponse.json(
      {
        message:
          'Désolé, j\'ai rencontré un problème temporaire. Essayez de nouveau ou contactez @omniflowapp_bot sur Telegram.',
      },
      { status: 200 } // Retourner 200 pour que le frontend affiche le message
    )
  }
}
