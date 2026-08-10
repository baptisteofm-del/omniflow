import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Task Registry (spec 5.4) — extend as new AI-driven features are built.
// Only the tasks actually wired up exist here; the full spec list is
// illustrative, not a checklist to pre-implement.
export type AiTaskType = 'MEMORY_EXTRACTION' | 'FAN_SCORING'

// Model Registry (spec 5.3) — minimal routing table (spec 5.12: both tasks
// are Fast-tier). Model identifiers are env-overridable, never hardcoded
// business logic (spec 5.36: don't freeze model names in the spec/code).
const MODEL_BY_TASK: Record<AiTaskType, string> = {
  MEMORY_EXTRACTION: process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-4-5-20251001',
  FAN_SCORING: process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-4-5-20251001',
}

// Approximate USD cost per 1M tokens, for the internal AI Usage Ledger
// (spec 5.27) only — never surfaced to end users as a product claim.
const COST_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 1, output: 5 },
}

interface RunAiTaskParams {
  taskType: AiTaskType
  promptVersion: string
  systemPrompt: string
  userPrompt: string
  agencyId: string
  conversationId?: string
  fanId?: string
  creatorId?: string
  messageId?: string
}

export async function runAiTask<T>({
  taskType,
  promptVersion,
  systemPrompt,
  userPrompt,
  agencyId,
  conversationId,
  fanId,
  creatorId,
  messageId,
}: RunAiTaskParams): Promise<T> {
  const model = MODEL_BY_TASK[taskType]
  const supabase = await createClient()
  const startedAt = Date.now()

  let status: 'success' | 'failed' = 'success'
  let parsed: T | null = null
  let estimatedCost: number | null = null
  let errorMessage: string | null = null

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      // Extraction/scoring tasks need consistency, not creative variation
      // (spec 5.13: structured outputs feeding business logic must be
      // reliable) — deterministic sampling so re-analyzing an unchanged
      // conversation doesn't drift.
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    parsed = parseJsonResponse<T>(text)

    const pricing = COST_PER_MILLION_TOKENS[model]
    if (pricing) {
      estimatedCost =
        (response.usage.input_tokens / 1_000_000) * pricing.input +
        (response.usage.output_tokens / 1_000_000) * pricing.output
    }
  } catch (err) {
    status = 'failed'
    errorMessage = err instanceof Error ? err.message : 'Erreur IA inconnue'
  }

  const latencyMs = Date.now() - startedAt

  await supabase.from('ai_decisions').insert({
    agency_id: agencyId,
    conversation_id: conversationId ?? null,
    message_id: messageId ?? null,
    fan_id: fanId ?? null,
    creator_id: creatorId ?? null,
    decision_type: taskType,
    model_provider: 'anthropic',
    model_name: model,
    prompt_version: promptVersion,
    structured_output_json: parsed ?? { error: errorMessage },
    status,
    latency_ms: latencyMs,
    estimated_cost: estimatedCost,
  })

  if (status === 'failed' || parsed === null) {
    throw new Error(errorMessage || 'Échec de la tâche IA')
  }

  return parsed
}

function parseJsonResponse<T>(text: string): T {
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Sortie IA non structurée (JSON introuvable)')
  return JSON.parse(jsonMatch[0]) as T
}
