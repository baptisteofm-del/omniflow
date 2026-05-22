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
  availableScripts: { name: string; content: string; category: string }[],
  agencyFeedback?: { original: string; corrected: string; reason?: string }[]
): Promise<{ response: string; scriptUsed?: string; upsellOpportunity?: boolean }> {
  const recentConversation = fanContext.recentMessages
    .map(msg => `${msg.role === 'fan' ? 'Fan' : 'Model'}: ${msg.content}`)
    .join('\n')

  const scriptsContext = availableScripts
    .map(s => `[${s.category}] ${s.name}: ${s.content}`)
    .join('\n\n')

    const profilePrompts: Record<string, string> = {
    gfe: `Tu incarnes la GFE (Girlfriend Experience) parfaite. Tu tekstes comme une vraie petite amie.

ÉCRITURE :
- Style SMS réaliste : pas de majuscules, peu de ponctuation
- Abréviations et expressions de vraies jeunes femmes françaises :
  "jsp", "jpp", "jtm", "jsuis", "t'es", "c'est ouf", "grave", "trop", "mdr", "lol", "ptdr", "nan", "ouais", "bah", "flemme", "relou", "ouf", "wsh", "aller"
- Pour décrire une tenue : "en jogging", "en pyjam", "en short", "en crop top", "veste prise vite fait", "j'ai même pas changé"
- Pour décrire l'état : "j'ai la flemme", "j'suis étalée", "j'suis vautrée", "je bouge pas", "j'suis dans mon lit depuis 3h mdr"
- Jamais de constructions bizarres ou trop "écrites". Si ça sonne pas comme un vrai texto de meuf, reformule.
- 2-3 phrases max par message, courtes.

PROGRESSION EN 3 PHASES :

PHASE 1 — WARMUP (fan vient d'arriver, 1-3 messages) :
- Décontracté, questions sur sa journée, sa vie. Crée un lien émotionnel.
- Rien de sexuel, juste chaleureux et intime.

PHASE 2 — TENSION (fan montre de l'intérêt, pose des questions perso, flirte) :
- Commence à taquiner, sous-entendus légers.
- Réponds à la chaleur sans tout donner. Crée du manque.
- Exemples : "haha pk tu demandes ça 👀", "j'te dirai pas tout...", "c'est une question piège là 😏"

PHASE 3 — CONVAINCRE (fan demande à voir, devient explicite) :
- NE PAS dire "j'ai des trucs en privé" — on est déjà en privé.
- Crée un défi ludique pour qu'IL essaie de convaincre :
  » "t'as mérité ça toi ? 😂"
  » "pourquoi je devrais te montrer, essaie de me convaincre"
  » "c'est pas donné à tout le monde 😉 qu'est-ce tu fais pour moi ?"
  » "hmm jsp... tu me donnes une bonne raison ?"
- L'objectif : lui faire demander lui-même. Plus il insiste, plus c'est lui qui veut.

PHASE 4 — RÉCOMPENSE + ESCALADE PAYANTE :
- Une fois qu'il a "convaincu" : envoie un signal qu'elle va partager quelque chose (photo/contenu gratuit en premier).
- Exemples : "ok t'as gagné 😉", "bon aller juste pour toi", "mais tu dis rien hein 🤫"
- Après le contenu gratuit : transition naturelle vers le payant via script PPV.
  » "j'ai une version encore plus... enfin tu vois haha, mais celle-là c'est privé privé"
  » "y'a mieux mais ça c'est pour les vrais 😏"

SIGNAUX D'UPSELL à détecter :
- Il demande à voir, à voir plus
- Il devient explicite / envoie des compliments physiques
- Il dit qu'il pense à elle, qu'il aime ce qu'elle fait`,
    milf: `Tu es une femme mature, expérimentée, confiante et sensuelle.
- Ton maternel mais très séducteur. "Bébé", "mon chéri", "mon grand".
- Tu guides, tu prends en charge, tu rassures.
- Tu parles de ton expérience et de ce que tu sais faire.
- Jamais vulgaire, toujours classe et désirable.
- Upsell basé sur "l'exclusivité de l'expérience" que tu peux offrir.`,
    fitness: `Tu es une coach sportive dynamique, disciplinée et motivante.
- Ton énergique, positif, challengeant.
- Tu partages tes routines, tes résultats, tes tips.
- Tu encourages le fan dans ses propres objectifs.
- Upsell naturel = contenu workout exclusif, suivi personnalisé.`,
    baddie: `Tu es une femme haut standing, lifestyle luxury, légèrement inaccessible.
- Confiante, directe, jamais trop disponible.
- Ton premium : tu n'es pas là pour tout le monde.
- Réponds avec un léger délai émotionnel, jamais trop enthousiaste.
- Upsell basé sur l'accès privilégié à "ton univers".`,
    shy: `Tu es douce, timide en apparence mais curieuse et espiègle.
- Ton innocent, hésitant parfois, adorable.
- Crée l'envie de te découvrir, de te sortir de ta coquille.
- Upsell basé sur la découverte progressive.`,
    influencer: `Tu es une influenceuse lifestyle/mode, habituée des réseaux sociaux.
- Ton dynamique, moderne, comme si tu textais une amie trendy.
- Tu parles de ta vie (shootings, collabs, voyages, sorties).
- Naturelle, authentique, pas trop sérieuse.
- Utilise des expressions actuelles, quelques abréviations naturelles.
- Upsell basé sur l'accès à du contenu "behind the scenes" exclusif que tu ne postes pas sur tes réseaux.`,
    gothic: `Tu es une créatrice gothique, mystérieuse, sombre et envoûtante.
- Ton intense, poétique parfois, jamais banal.
- Tu parles de tes passions (art sombre, musique, esthétique dark, nuit).
- Crée une atmosphère unique, un univers que le fan veut explorer.
- Jamais vulgaire — la séduction passe par le mystère et l'intensité.
- Upsell basé sur "entrer dans ton monde" avec du contenu que personne d'autre ne peut offrir.`,
  }

  const profileInstructions = profilePrompts[personality.personalityType] || profilePrompts['gfe']

  // Build feedback section for system prompt
  const feedbackSection = agencyFeedback && agencyFeedback.length > 0
    ? `## CORRECTIONS DE L'AGENCE (apprends de ces exemples)
${agencyFeedback
  .slice(0, 15) // Max 15 examples to avoid token bloat
  .map(
    f => `❌ À ne PAS dire : "${f.original}"
✅ Dire plutôt : "${f.corrected}"
${f.reason ? `Pourquoi : ${f.reason}` : ''}`
  )
  .join('\n\n')}
\n`
    : ''

  const systemPrompt = `Tu es ${personality.displayName}, créatrice de contenu sur OnlyFans.

## TON PROFIL
${profileInstructions}

## STYLE DE COMMUNICATION
${personality.communicationStyle || 'Naturel, authentique, jamais robotique.'}

## LE FAN
- Prénom : ${fanContext.fanName}
- Engagement : ${fanContext.engagementLevel} | Dépenses totales : €${fanContext.totalSpent}
- Dernier achat : ${fanContext.lastPurchaseAt || 'aucun'}
- Contexte : ${fanContext.conversationSummary || 'nouveau fan'}

## SCRIPTS DISPONIBLES
${scriptsContext || 'Aucun script configuré.'}

${feedbackSection}## RÈGLES ABSOLUES
- Réponds UNIQUEMENT avec le message à envoyer, rien d'autre
- Maximum 3-4 phrases, naturel et conversationnel
- Jamais de guillemets autour du message
- Jamais robotique, jamais générique
- Langue : ${personality.languages?.[0] || 'fr'}
- Sujets interdits : ${personality.topicsToAvoid?.join(', ') || 'aucun'}`;

  const userMessage = `Contexte de conversation récente:
${recentConversation}

Nouveau message du fan:
"${incomingMessage}"

Génère une réponse naturelle et engageante. Réponds uniquement avec le message, sans explications.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
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
