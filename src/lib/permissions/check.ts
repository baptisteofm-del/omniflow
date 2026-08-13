import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Thin wrapper over the has_permission() SQL function (0001_foundation.sql)
// — the same function RLS policies already call to gate agency_memberships/
// agency_invitations writes. This is the first place application code
// (rather than just RLS) checks it, to actually restrict the feature areas
// the 0024_team_management.sql permission catalog describes
// (inbox.view/send, scripts.manage, media.manage, analytics.view,
// ai_settings.manage) — until now, granting/revoking these in
// /settings/team didn't change what a member could actually do.
export async function hasPermission(supabase: AnySupabaseClient, agencyId: string, key: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', { check_agency_id: agencyId, permission_key: key })
  if (error) return false
  return data === true
}

export async function requirePermission(supabase: AnySupabaseClient, agencyId: string, key: string, message?: string) {
  const ok = await hasPermission(supabase, agencyId, key)
  if (!ok) throw new Error(message || "Vous n'avez pas la permission nécessaire pour cette action")
}

// Shared server-component page guard — repeats the same
// auth -> users -> active agency_membership lookup already duplicated
// across every Server Action's getAgencyAndUser(), specifically for pages
// that just need a yes/no "can this person see this page" answer.
//
// Owner report: "partout c'est lent" — every gated page's layout calls this
// on top of the same auth -> users -> agency_membership chain (app)/layout.tsx
// already ran, so a page like Inbox paid for that chain twice per
// navigation. Can't remove the second auth.getUser() without a bigger
// restructure (Supabase's own security-critical revalidation, not a cache
// we control), but the users+agency_memberships round trip is the same fix
// as (app)/layout.tsx: one joined query instead of two sequential ones.
export async function checkPageAccess(key: string) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return { supabase, agencyId: null as string | null, userId: null as string | null, allowed: false }

  const { data: appUser } = await supabase
    .from('users')
    .select('id, agency_memberships(agency_id, status)')
    .eq('auth_user_id', authUser.id)
    .single()
  if (!appUser) return { supabase, agencyId: null as string | null, userId: null as string | null, allowed: false }

  const memberships = (appUser.agency_memberships ?? []) as unknown as { agency_id: string; status: string }[]
  const agencyId = memberships.find((m) => m.status === 'active')?.agency_id ?? null
  if (!agencyId) return { supabase, agencyId, userId: appUser.id as string, allowed: false }

  const allowed = await hasPermission(supabase, agencyId, key)
  return { supabase, agencyId, userId: appUser.id as string, allowed }
}
