import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es l'assistant IA OmniFlow. Tu aides les agences OnlyFans à utiliser la plateforme avec expertise et bienveillance.

## Fonctionnalités OmniFlow

**Automatisation & Publication**
- Posting AdsPower / GeeLark: publication automatisée multi-comptes OnlyFans et MYM
- Bot Telegram: automatisation de la communication fans via Telegram
- Auto Posting: planification et publication automatique de contenu

**Intelligence Artificielle**  
- Chatting IA: répond automatiquement aux DMs des fans pour maximiser la conversion
- Génération vidéo IA (Kling): création de vidéos professionnelles par IA
- Veille Trends: analyse des tendances Instagram et contenu viral

**Gestion & Analytics**
- Dashboard financier: suivi en temps réel des revenus, fans, et performances
- Banque de médias: organiser et réutiliser les contenus
- Prospection: analyse de profils et identification d'opportunités
- Rapports hebdomadaires automatiques

**Intégrations**
- OnlyFans: connexion directe, sync des profils et revenus
- MYM: import automatique des profils
- Binance & Coinbase: suivi financier crypto

**Plans disponibles**
- Starter (99€/mois): fonctionnalités de base, 1 compte
- Pro (199€/mois): toutes fonctions, sans limite
- Agency (349€/mois): multi-comptes, équipe, fonctions avancées

## Directives

- Réponds TOUJOURS en français, sois concis, précis et utile
- Donne des réponses pratiques et actionnables
- Pour les questions complexes ou hors scope: "Je transmets ça à notre équipe support. Vous pouvez aussi nous contacter directement sur Telegram pour une réponse immédiate."
- Reste professionnel mais chaleureux, pas de jargon inutile
- Limite à 400 tokens par réponse
- Ne jamais inventer de fonctionnalités inexistantes
- Si l'utilisateur demande de l'aide humaine: suggère le support Telegram`

// Fallback response when API key is missing
const FALLBACK_MESSAGES = [
  "Bonjour ! Je suis l'assistant OmniFlow. Pour l'instant, contactez notre équipe directement sur Telegram : @omniflowsupport — réponse garantie en moins d'1h ! 🚀",
]

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  // If no API key, return graceful fallback
  if (!apiKey) {
    console.warn('[Support Chat] ANTHROPIC_API_KEY not set — using fallback response')
    return NextResponse.json({
      message: FALLBACK_MESSAGES[0],
    })
  }

  try {
    const { message, conversationHistory } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    // Build message history (keep last 10 turns to manage token usage)
    const history = (conversationHistory || []).slice(-10)
    const messages = [
      ...history,
      { role: 'user' as const, content: message.trim() },
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    })

    const aiMessage =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'Je rencontre une difficulté technique. Réessayez ou contactez @omniflowsupport sur Telegram.'

    return NextResponse.json({ message: aiMessage })
  } catch (error: unknown) {
    console.error('[Support Chat API Error]', error)

    // Structured error response — always HTTP 200 so frontend shows the message
    const msg = error instanceof Error && error.message.includes('401')
      ? 'Clé API invalide. Contactez @omniflowsupport sur Telegram pour une aide immédiate.'
      : 'Service momentanément indisponible. Contactez notre équipe sur Telegram : @omniflowsupport 📱'

    return NextResponse.json({ message: msg })
  }
}
