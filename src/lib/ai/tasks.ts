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

export const MEMORY_EXTRACTION_PROMPT_VERSION = 'memory-extraction-v1'

export function buildMemoryExtractionPrompt(
  transcript: string,
  existingMemories: { category: string; label: string; value: string }[]
) {
  const system = `Tu es le moteur d'extraction de mémoire d'OmniFlow. Tu lis une conversation entre un fan et une créatrice et tu identifies les informations qui méritent d'être mémorisées sur ce fan.

Catégories autorisées (une exacte par mémoire) : ${MEMORY_CATEGORIES.join(', ')}.

Règles strictes :
- N'invente rien. N'extrais que ce que le fan a réellement communiqué ou ce qui ressort clairement de la conversation.
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

export const FAN_SCORING_PROMPT_VERSION = 'fan-scoring-v1'

export function buildFanScoringPrompt(transcript: string, fanName: string) {
  const system = `Tu es le moteur de Fan Intelligence d'OmniFlow. Tu analyses une conversation entre un fan et une créatrice et tu estimes 5 scores sur une échelle de 0 à 100 :

- purchase_intent : intention d'achat à court terme, sensible au contexte récent.
- relationship_score : profondeur et maturité de la relation (indépendant du potentiel commercial).
- spending_potential : potentiel commercial observé (comportement d'achat, pas une estimation de richesse).
- engagement_score : niveau d'implication récent dans la conversation.
- churn_risk : risque de désengagement.

Base-toi uniquement sur des signaux observables dans la conversation (pas d'invention). Si peu d'information est disponible, reste prudent (scores proches de 50 pour les inconnues, pas de valeurs extrêmes injustifiées).

Réponds UNIQUEMENT avec un JSON valide de cette forme, sans texte autour :
{"purchase_intent":50,"relationship_score":50,"spending_potential":50,"engagement_score":50,"churn_risk":50,"reasons":"1-2 phrases expliquant les signaux principaux"}`

  const user = `Fan : ${fanName}\n\nConversation :\n${transcript}`

  return { system, user }
}
