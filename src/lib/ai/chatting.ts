import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface FanContext {
  fanName: string
  conversationSummary: string
  recentMessages: { role: 'fan' | 'model'; content: string }[]
  engagementLevel: string
  totalSpent: number
  lastPurchaseAt?: string
}

export interface ModelPersonality {
  displayName: string
  personalityType: string
  communicationStyle: string
  exampleMessages: string[]
  languages: string[]
  topicsToAvoid: string[]
  ppvPriceRange: string
  tipsStrategy: string
}

/**
 * Generate an AI response for an incoming fan message
 */
export async function generateResponse(
  fanContext: FanContext,
  personality: ModelPersonality,
  incomingMessage: string,
  availableScripts: { name: string; content: string; category: string }[]
): Promise<{ response: string; scriptUsed?: string; upsellOpportunity?: boolean }> {
  const recentConversation = fanContext.recentMessages
    .map(msg => `${msg.role === 'fan' ? 'Fan' : 'Model'}: ${msg.content}`)
    .join('\n')

  const scriptsContext = availableScripts
    .map(s => `[${s.category}] ${s.name}: ${s.content}`)
    .join('\n\n')

  const systemPrompt = `Tu es ${personality.displayName}, une créatrice de contenu OnlyFans.
Style de personnalité: ${personality.personalityType} - ${personality.communicationStyle}
Langues parlées: ${personality.languages.join(', ')}

Informations sur le fan:
- Nom: ${fanContext.fanName}
- Niveau engagement: ${fanContext.engagementLevel}
- Total dépensé: €${fanContext.totalSpent}
- Dernier achat: ${fanContext.lastPurchaseAt || 'Aucun'}

Résumé de la relation:
${fanContext.conversationSummary}

Sujets À ÉVITER:
${personality.topicsToAvoid.join(', ')}

Stratégie tips/PPV:
${personality.tipsStrategy}

Scripts disponibles:
${scriptsContext}

INSTRUCTIONS IMPORTANTES:
1. Sois naturelle et chaleureuse, jamais robotique
2. Adapter ton ton au niveau d'engagement du fan
3. Si le fan semble intéressé, propose subtilement un PPV ou tips
4. Reste authentique et engageante
5. Réponds en ${personality.languages[0]}`

  const userMessage = `Contexte de conversation récente:
${recentConversation}

Nouveau message du fan:
"${incomingMessage}"

Génère une réponse naturelle et engageante. Réponds uniquement avec le message, sans explications.`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const generatedResponse =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // Check for upsell opportunity
  const upsellOpportunity = await detectUpsellOpportunity(
    [...fanContext.recentMessages, { role: 'fan', content: incomingMessage }],
    fanContext.engagementLevel
  )

  return {
    response: generatedResponse,
    scriptUsed: undefined,
    upsellOpportunity: upsellOpportunity.opportunity,
  }
}

/**
 * Update conversation summary with new messages
 */
export async function updateConversationSummary(
  currentSummary: string,
  recentMessages: { role: string; content: string }[],
  fanProfile: Record<string, unknown>
): Promise<string> {
  const messagesText = recentMessages
    .map(m => `${m.role === 'fan' ? 'Fan' : 'Model'}: ${m.content}`)
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system:
      "Tu es un assistant spécialisé dans la création de résumés de conversations. Crée un résumé court et factuel des interactions, en mettant l'accent sur les intérêts, préférences et points clés.",
    messages: [
      {
        role: 'user',
        content: `Résumé actuel:
${currentSummary}

Nouveaux messages:
${messagesText}

Fournissez un résumé mis à jour et concis (max 150 mots). Inclut les intérêts, points clés et contexte important pour les futures interactions.`,
      },
    ],
  })

  return response.content[0].type === 'text' ? response.content[0].text : currentSummary
}

/**
 * Analyze a script and provide improvements
 */
export async function analyzeScript(
  scriptContent: string,
  category: string
): Promise<{ score: number; suggestions: string; improvements: string[] }> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 600,
    system:
      "Tu es un expert en copywriting pour créateurs OnlyFans. Analyse les scripts d'engagement et fournis des scores (0-100) avec des suggestions concrètes d'amélioration.",
    messages: [
      {
        role: 'user',
        content: `Analyse ce script ${category}:

"${scriptContent}"

Fournis:
1. Un score de 0-100
2. Une brève suggestion générale
3. 3-5 points d'amélioration spécifiques

Format ta réponse en JSON: { "score": number, "suggestions": string, "improvements": string[] }`,
      },
    ],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const parsed = JSON.parse(text)
    return {
      score: parsed.score || 0,
      suggestions: parsed.suggestions || '',
      improvements: parsed.improvements || [],
    }
  } catch {
    return {
      score: 60,
      suggestions: 'Script valide',
      improvements: [],
    }
  }
}

/**
 * Detect upsell opportunities in conversation
 */
export async function detectUpsellOpportunity(
  messages: { role: string; content: string }[],
  engagementLevel: string
): Promise<{ opportunity: boolean; type?: 'ppv' | 'tips'; suggestedMessage?: string }> {
  const conversation = messages.map(m => `${m.role === 'fan' ? 'Fan' : 'Model'}: ${m.content}`).join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system:
      "Tu es un expert en ventes OnlyFans. Identifie les opportunités de monétisation (PPV, tips) basées sur l'engagement et l'intérêt du fan.",
    messages: [
      {
        role: 'user',
        content: `Conversation:
${conversation}

Engagement level du fan: ${engagementLevel}

Y a-t-il une opportunité de proposer un PPV ou un tip? Réponds en JSON: { "opportunity": boolean, "type": "ppv" | "tips" | null, "suggestedMessage": string | null }`,
      },
    ],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const parsed = JSON.parse(text)
    return {
      opportunity: parsed.opportunity || false,
      type: parsed.type || undefined,
      suggestedMessage: parsed.suggestedMessage || undefined,
    }
  } catch {
    return { opportunity: false }
  }
}
