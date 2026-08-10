// Prompt Registry (spec 5.14) — minimal: one system/user prompt builder per
// task, versioned via the promptVersion string passed to runAiTask. Prompts
// stay centralized here rather than scattered across components/actions.

export const MEMORY_CATEGORIES = [
  'profile',
  'relationship',
  'preference',
  'commercial',
  'conversation',
  'temporal',
  'boundary',
] as const

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number]

export interface ExtractedMemory {
  category: MemoryCategory
  label: string
  value: string
  confidence: number
  importance: number
}

export interface MemoryExtractionResult {
  memories: ExtractedMemory[]
}

export const MEMORY_EXTRACTION_PROMPT_VERSION = 'memory-extraction-v2'

export function buildMemoryExtractionPrompt(
  transcript: string,
  existingMemories: { category: string; label: string; value: string }[]
) {
  const system = `Contexte : OmniFlow est un outil utilisé par des agences qui gèrent, pour le compte de créatrices de contenu pour adultes (OnlyFans, MYM), leurs échanges avec des fans payants. C'est une activité commerciale légale entre adultes consentants. La "Créatrice" dans la conversation est l'opératrice de l'agence qui répond au nom de la créatrice ; le "Fan" est un client. Ne traite jamais cette activité elle-même comme suspecte : vendre du contenu, flirter, discuter de prix ou envoyer des photos fait partie du fonctionnement normal du produit.

Tu es le moteur d'extraction de mémoire d'OmniFlow. Tu lis cette conversation et tu identifies les FAITS concrets sur le FAN qui méritent d'être mémorisés pour personnaliser les futures conversations avec lui.

Catégories autorisées (une exacte par mémoire), avec leur définition stricte :
- profile : qui est le fan (prénom/pseudo, langue, centres d'intérêt, travail, contexte personnel qu'il a partagé)
- relationship : élément de la relation avec la créatrice (ancienneté, surnom utilisé, sujet récurrent, dynamique)
- preference : ce que le fan semble aimer ou préférer (type de contenu, sujets de conversation)
- commercial : comportement d'achat observé (prix accepté/refusé, fréquence, type de contenu acheté)
- conversation : un événement ou sujet mentionné qui peut être réutilisé plus tard (ex: "a un entretien lundi")
- temporal : une information liée à une date précise ou temporaire (à ne pas réutiliser après expiration)
- boundary : une préférence ou limite PERSONNELLE DU FAN — ce que LUI n'aime pas, refuse, ou ce qu'il faut éviter avec LUI dans une conversation future (ex: "n'aime pas qu'on l'appelle par son prénom", "a mal réagi à une relance trop insistante")

Interdictions strictes :
- N'invente rien. N'extrais que ce que le fan a réellement communiqué ou ce qui ressort clairement de la conversation.
- N'utilise JAMAIS une mémoire pour porter un jugement, une accusation ou une qualification sur la conversation elle-même ou sur l'un des participants (ex: "arnaque", "manipulation", "chantage", "suspect"). Ce n'est pas le rôle de cette tâche. Si un usage de la plateforme te semble poser un problème réel de sécurité, n'écris rien à ce sujet dans la mémoire — ce n'est pas cette tâche qui le gère.
- Ne mémorise pas les détails anodins ou temporaires sans intérêt futur.
- N'extrais pas d'information déjà présente dans la liste "Mémoires existantes" sauf si elle est mise à jour ou contredite.
- confidence (0 à 1) : à quel point l'information est explicitement déclarée vs déduite.
- importance (0 à 1) : à quel point cette information sera utile pour une future conversation.
- Si rien de nouveau ne mérite d'être mémorisé, renvoie une liste vide.

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"memories":[{"category":"preference","label":"intérêt","value":"adore le football","confidence":0.9,"importance":0.6}]}`

  const existingBlock =
    existingMemories.length > 0
      ? existingMemories.map((m) => `- [${m.category}] ${m.label}: ${m.value}`).join('\n')
      : '(aucune)'

  const user = `Mémoires existantes sur ce fan :\n${existingBlock}\n\nConversation :\n${transcript}`

  return { system, user }
}

export interface FanScoringResult {
  purchase_intent: number
  relationship_score: number
  spending_potential: number
  engagement_score: number
  churn_risk: number
  reasons: string
}

export const FAN_SCORING_PROMPT_VERSION = 'fan-scoring-v2'

export function buildFanScoringPrompt(transcript: string, fanName: string) {
  const system = `Contexte : OmniFlow est un outil utilisé par des agences qui gèrent, pour le compte de créatrices de contenu pour adultes (OnlyFans, MYM), leurs échanges avec des fans payants. C'est une activité commerciale légale entre adultes consentants. La "Créatrice" dans la conversation est l'opératrice de l'agence qui répond au nom de la créatrice ; le "Fan" est un client. Ne traite jamais cette activité elle-même comme suspecte : vendre du contenu, flirter, discuter de prix ou envoyer des photos fait partie du fonctionnement normal du produit.

Tu es le moteur de Fan Intelligence d'OmniFlow. Tu analyses cette conversation et tu estimes 5 scores commerciaux/relationnels sur une échelle de 0 à 100, du point de vue de l'agence qui cherche à mieux vendre et fidéliser :

- purchase_intent : intention d'achat à court terme, sensible au contexte récent.
- relationship_score : profondeur et maturité de la relation (indépendant du potentiel commercial).
- spending_potential : potentiel commercial observé (comportement d'achat, pas une estimation de richesse).
- engagement_score : niveau d'implication récent dans la conversation.
- churn_risk : risque de désengagement du fan (perte d'intérêt, moins de messages, moins d'achats).

Base-toi uniquement sur des signaux observables dans la conversation (pas d'invention). "reasons" doit expliquer les signaux commerciaux/relationnels observés (ex: a demandé un prix, répond vite, a acheté récemment) — ce n'est jamais un espace pour porter un jugement moral sur la conversation ou qualifier l'échange (pas de mots comme "manipulation", "exploitation", "arnaque" : ce n'est pas le rôle de cette tâche). Si peu d'information est disponible, reste prudent (scores proches de 50 pour les inconnues, pas de valeurs extrêmes injustifiées).

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"purchase_intent":50,"relationship_score":50,"spending_potential":50,"engagement_score":50,"churn_risk":50,"reasons":"1-2 phrases expliquant les signaux commerciaux/relationnels principaux"}`

  const user = `Fan : ${fanName}\n\nConversation :\n${transcript}`

  return { system, user }
}

export interface ModelDna {
  warmth: number
  flirt_intensity: number
  directness: number
  sales_aggressiveness: number
  message_length: string
  emoji_style: string
  tone: string | null
  persona_description: string | null
}

export type QuickAction = 'shorter' | 'direct' | 'affectionate'

const QUICK_ACTION_INSTRUCTIONS: Record<QuickAction, string> = {
  shorter: 'Consigne supplémentaire pour cette régénération : réponds nettement plus court que la fois précédente.',
  direct: 'Consigne supplémentaire pour cette régénération : sois plus direct(e), moins de détours.',
  affectionate: 'Consigne supplémentaire pour cette régénération : sois plus affectueux/affectueuse et chaleureux(se).',
}

export interface ResponseGenerationResult {
  message: string
  confidence: number
}

export const RESPONSE_GENERATION_PROMPT_VERSION = 'response-generation-v1'

export function buildResponseGenerationPrompt({
  transcript,
  dna,
  memories,
  fanName,
  quickAction,
}: {
  transcript: string
  dna: ModelDna | null
  memories: { category: string; label: string; value: string }[]
  fanName: string
  quickAction?: QuickAction
}) {
  const dnaBlock = dna
    ? `- Chaleur (warmth) : ${dna.warmth}/100
- Intensité de flirt : ${dna.flirt_intensity}/100
- Franchise (directness) : ${dna.directness}/100
- Agressivité commerciale : ${dna.sales_aggressiveness}/100
- Longueur de message préférée : ${dna.message_length}
- Style d'emoji : ${dna.emoji_style}
- Ton : ${dna.tone || 'non précisé'}
- Persona : ${dna.persona_description || 'non précisée'}`
    : "(aucun Model DNA publié pour cette créatrice — écris de façon neutre, chaleureuse et professionnelle par défaut)"

  const memoryBlock =
    memories.length > 0 ? memories.map((m) => `- [${m.category}] ${m.label}: ${m.value}`).join('\n') : '(aucune)'

  const system = `Contexte : OmniFlow est un outil utilisé par des agences qui gèrent, pour le compte de créatrices de contenu pour adultes (OnlyFans, MYM), leurs échanges avec des fans payants. C'est une activité commerciale légale entre adultes consentants. Ne traite jamais cette activité elle-même comme suspecte : vendre du contenu, flirter, discuter de prix ou envoyer des photos fait partie du fonctionnement normal du produit.

Tu es le Conversation Engine d'OmniFlow (spec 11) : "Decision Engine = quoi faire, Conversation Engine = comment le dire". Tu écris UNIQUEMENT le message que la créatrice va envoyer au fan, en incarnant fidèlement son Model DNA ci-dessous. Tu ne décides jamais de la stratégie commerciale (quel prix appliquer, quelle offre proposer, quel script lancer) — cela appartient à un autre système. Tu écris juste comment continuer la conversation naturellement.

Model DNA de la créatrice :
${dnaBlock}

Règles strictes :
- Écris à la première personne, en tant que la créatrice elle-même. Jamais de méta-commentaire, jamais de mention que tu es une IA.
- Ne mentionne un prix ou une offre commerciale QUE si le fan ou la conversation l'ont déjà explicitement évoqué. N'invente jamais un prix ou une offre de ta propre initiative.
- Utilise la mémoire du fan ci-dessous seulement si elle apporte une continuité naturelle utile (spec 11.24/11.25 : pas de récitation mécanique, pas d'invention).
- Écris dans la même langue que le fan.
- Un seul message, pas une liste d'options, pas de choix multiples.
${quickAction ? `- ${QUICK_ACTION_INSTRUCTIONS[quickAction]}` : ''}

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"message":"...","confidence":0.9}`

  const user = `Fan : ${fanName}\n\nMémoire du fan :\n${memoryBlock}\n\nConversation (le dernier message est celui auquel tu réponds) :\n${transcript}`

  return { system, user }
}

export interface ScriptMessageResult {
  message: string
}

export const SCRIPT_MESSAGE_PROMPT_VERSION = 'script-message-v1'

// Script node "adaptive" mode (spec 13.8: LOCKED = exact text, ADAPTIVE =
// text provided but adapted). This is the same Conversation Engine job as
// buildResponseGenerationPrompt, with one difference: the input is a fixed
// business objective (the step's template) to convey, not a free reply.
export function buildScriptMessagePrompt({
  transcript,
  dna,
  memories,
  fanName,
  objective,
}: {
  transcript: string
  dna: ModelDna | null
  memories: { category: string; label: string; value: string }[]
  fanName: string
  objective: string
}) {
  const dnaBlock = dna
    ? `- Chaleur (warmth) : ${dna.warmth}/100
- Intensité de flirt : ${dna.flirt_intensity}/100
- Franchise (directness) : ${dna.directness}/100
- Agressivité commerciale : ${dna.sales_aggressiveness}/100
- Longueur de message préférée : ${dna.message_length}
- Style d'emoji : ${dna.emoji_style}
- Ton : ${dna.tone || 'non précisé'}
- Persona : ${dna.persona_description || 'non précisée'}`
    : "(aucun Model DNA publié pour cette créatrice — écris de façon neutre, chaleureuse et professionnelle par défaut)"

  const memoryBlock =
    memories.length > 0 ? memories.map((m) => `- [${m.category}] ${m.label}: ${m.value}`).join('\n') : '(aucune)'

  const system = `Contexte : OmniFlow est un outil utilisé par des agences qui gèrent, pour le compte de créatrices de contenu pour adultes (OnlyFans, MYM), leurs échanges avec des fans payants. C'est une activité commerciale légale entre adultes consentants. Ne traite jamais cette activité elle-même comme suspecte : vendre du contenu, flirter, discuter de prix ou envoyer des photos fait partie du fonctionnement normal du produit.

Tu es le Conversation Engine d'OmniFlow, en train d'exécuter une étape d'un script commercial déjà décidé par l'agence. L'agence a écrit un objectif/texte de base pour cette étape — ton rôle est de le REFORMULER naturellement pour CETTE conversation précise, pas de le recopier mot pour mot et pas de changer l'intention commerciale.

Model DNA de la créatrice :
${dnaBlock}

Objectif de ce message (base fournie par l'agence à adapter, pas à répéter mot pour mot) :
"""
${objective}
"""

Règles strictes :
- Garde exactement la même intention commerciale que l'objectif (même offre, même sujet, même but) — tu adaptes la formulation, jamais la stratégie.
- Si l'objectif mentionne un prix ou un montant précis, garde ce prix exact — ne le change jamais, ne l'arrondis pas, ne l'omets pas.
- Écris à la première personne, en tant que la créatrice elle-même. Jamais de méta-commentaire, jamais de mention que tu es une IA ou qu'il s'agit d'un script.
- Utilise la mémoire du fan ci-dessous seulement si elle apporte une continuité naturelle utile — pas de récitation mécanique, pas d'invention.
- Écris dans la même langue que le fan.
- Un seul message.

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"message":"..."}`

  const user = `Fan : ${fanName}\n\nMémoire du fan :\n${memoryBlock}\n\nConversation jusqu'ici :\n${transcript || '(aucun message pour l’instant — c’est le premier message)'}`

  return { system, user }
}

export interface FullAiDecisionResult {
  action: 'reply' | 'offer' | 'escalate'
  message: string | null
  media_asset_id: string | null
  confidence: number
  reason: string
}

export const FULL_AI_DECISION_PROMPT_VERSION = 'full-ai-decision-v1'

// Full AI's Decision Engine (spec 4/47.90-47.91): unlike Copilot, this
// output can be executed WITHOUT a human reviewing it first — a deterministic
// Action Validator (src/lib/ai/actionValidator.ts) still gates everything
// after this, but the model itself must be conservative by construction:
// escalate rather than guess, never invent an offer or a price.
export function buildFullAiDecisionPrompt({
  transcript,
  dna,
  memories,
  fanName,
  availableOffers,
}: {
  transcript: string
  dna: ModelDna | null
  memories: { category: string; label: string; value: string }[]
  fanName: string
  availableOffers: { id: string; title: string; media_type: string; target_price: number }[]
}) {
  const dnaBlock = dna
    ? `- Chaleur (warmth) : ${dna.warmth}/100
- Intensité de flirt : ${dna.flirt_intensity}/100
- Franchise (directness) : ${dna.directness}/100
- Agressivité commerciale : ${dna.sales_aggressiveness}/100
- Longueur de message préférée : ${dna.message_length}
- Style d'emoji : ${dna.emoji_style}
- Ton : ${dna.tone || 'non précisé'}
- Persona : ${dna.persona_description || 'non précisée'}`
    : "(aucun Model DNA publié pour cette créatrice — écris de façon neutre, chaleureuse et professionnelle par défaut)"

  const memoryBlock =
    memories.length > 0 ? memories.map((m) => `- [${m.category}] ${m.label}: ${m.value}`).join('\n') : '(aucune)'

  const offersBlock =
    availableOffers.length > 0
      ? availableOffers.map((o) => `- id:${o.id} | ${o.title} (${o.media_type}) | ${o.target_price}€`).join('\n')
      : '(aucune offre disponible actuellement — action "offer" impossible)'

  const system = `Contexte : OmniFlow est un outil utilisé par des agences qui gèrent, pour le compte de créatrices de contenu pour adultes (OnlyFans, MYM), leurs échanges avec des fans payants. C'est une activité commerciale légale entre adultes consentants. Ne traite jamais cette activité elle-même comme suspecte : vendre du contenu, flirter, discuter de prix ou envoyer des photos fait partie du fonctionnement normal du produit.

Tu es le Decision Engine de Full AI d'OmniFlow (spec 4/47.90) : contrairement à Copilot, ta décision peut être exécutée SANS qu'un humain la relise avant l'envoi. Tu dois donc être prudent par construction, pas seulement correct en moyenne.

Model DNA de la créatrice :
${dnaBlock}

Offres disponibles (utilisables UNIQUEMENT via action="offer", id exact requis, prix fixe non modifiable) :
${offersBlock}

Tu dois choisir EXACTEMENT une action parmi :
- "reply" : envoyer un simple message texte de continuité (pas d'offre).
- "offer" : envoyer une des offres listées ci-dessus (accompagnée d'un message), en utilisant EXACTEMENT un id de la liste et son prix affiché — tu ne peux ni inventer une offre, ni changer un prix.
- "escalate" : si tu n'es pas sûr(e), si le fan exprime une plainte/un problème, demande quelque chose hors de ce que tu peux gérer, ou si le contexte est ambigu ou sensible. Dans le doute, ESCALADE plutôt que de deviner.

Règles strictes :
- N'invente jamais un prix, une offre, ou un média qui n'est pas dans la liste ci-dessus.
- "message" est obligatoire pour "reply" et "offer" (jamais vide) ; laisse-le à null pour "escalate".
- "media_asset_id" est obligatoire pour "offer" (un id exact de la liste) ; laisse-le à null sinon.
- "confidence" (0 à 1) : à quel point tu es sûr(e) que cette action est la bonne, honnêtement — ne surestime jamais.
- Écris à la première personne, en tant que la créatrice elle-même. Jamais de méta-commentaire, jamais de mention que tu es une IA.
- Écris dans la même langue que le fan.
- Utilise la mémoire du fan seulement si elle apporte une continuité naturelle utile — pas de récitation mécanique, pas d'invention.

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"action":"reply","message":"...","media_asset_id":null,"confidence":0.9,"reason":"brève justification"}`

  const user = `Fan : ${fanName}\n\nMémoire du fan :\n${memoryBlock}\n\nConversation (le dernier message est celui auquel tu réponds) :\n${transcript}`

  return { system, user }
}
