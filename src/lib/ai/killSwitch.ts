import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

export type FullAiActionType = 'send_message' | 'send_paid_offer'

// Kill Switch (spec 10.29 / 4.29): 4 levels, most-specific-doesn't-matter —
// ANY matching switch blocks. "global" (agency_id null) is internal-OmniFlow
// only (no app UI creates one, see 0014_full_ai.sql's RLS), but is still
// checked here so an agency-side action respects it if one is ever inserted.
export async function isFullAiKilled(
  supabase: AnySupabaseClient,
  agencyId: string,
  creatorId: string,
  actionType: FullAiActionType
): Promise<{ killed: boolean; reason: string | null }> {
  const { data: switches } = await supabase
    .from('ai_kill_switches')
    .select('scope, agency_id, creator_id, action_type, reason')

  const hit = (switches ?? []).find(
    (s: { scope: string; agency_id: string | null; creator_id: string | null; action_type: string | null }) =>
      s.scope === 'global' ||
      (s.scope === 'agency' && s.agency_id === agencyId) ||
      (s.scope === 'creator' && s.creator_id === creatorId) ||
      (s.scope === 'action_type' && s.agency_id === agencyId && s.action_type === actionType)
  )

  return { killed: !!hit, reason: hit?.reason ?? null }
}
