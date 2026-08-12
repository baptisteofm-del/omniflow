'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getAgencyAndUser() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser!.id)
    .single()
  if (!appUser) throw new Error('Utilisateur introuvable')

  const { data: membership } = await supabase
    .from('agency_memberships')
    .select('agency_id')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (!membership) throw new Error('Aucune agence active pour cet utilisateur')

  return { supabase, appUser, agencyId: membership.agency_id as string }
}

// RLS (has_permission(agency_id, 'team.invite')) is the real authorization
// boundary here, same pattern as every other agency-scoped table in this
// project — this just attempts the write and lets Postgres reject it.
export async function inviteTeamMember(formData: FormData) {
  const { supabase, agencyId, appUser } = await getAgencyAndUser()

  const email = String(formData.get('email') || '').trim().toLowerCase()
  const roleId = String(formData.get('role_id') || '')
  if (!email) throw new Error('Email requis')
  if (!roleId) throw new Error('Sélectionnez un rôle')

  const { data: existingUser } = await supabase.from('users').select('id').ilike('email', email).maybeSingle()
  if (existingUser) {
    const { data: existingMembership } = await supabase
      .from('agency_memberships')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('user_id', existingUser.id)
      .maybeSingle()
    if (existingMembership) throw new Error('Cette personne fait déjà partie de votre équipe')
  }

  const { error } = await supabase.from('agency_invitations').insert({
    agency_id: agencyId,
    email,
    role_id: roleId,
    invited_by: appUser.id,
  })
  if (error) {
    if (error.code === '23505') throw new Error('Une invitation est déjà en attente pour cet email')
    throw new Error(error.message)
  }

  revalidatePath('/settings')
}

export async function revokeInvitation(invitationId: string) {
  const { supabase } = await getAgencyAndUser()
  const { error } = await supabase.from('agency_invitations').update({ status: 'revoked' }).eq('id', invitationId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function changeMemberRole(membershipId: string, roleId: string) {
  const { supabase } = await getAgencyAndUser()
  const { error } = await supabase
    .from('agency_memberships')
    .update({ role_id: roleId, updated_at: new Date().toISOString() })
    .eq('id', membershipId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function removeMember(membershipId: string) {
  const { supabase, appUser } = await getAgencyAndUser()

  const { data: membership } = await supabase.from('agency_memberships').select('user_id').eq('id', membershipId).single()
  if (membership?.user_id === appUser.id) throw new Error('Vous ne pouvez pas vous retirer vous-même de l’agence')

  const { error } = await supabase
    .from('agency_memberships')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', membershipId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

export async function createCustomRole(formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Nom du rôle requis')

  const permissionKeys = formData.getAll('permissions').map(String)
  if (permissionKeys.length === 0) throw new Error('Sélectionnez au moins une fonctionnalité')

  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert({ agency_id: agencyId, name, type: 'custom', is_system: false })
    .select('id')
    .single()
  if (roleError || !role) {
    if (roleError?.code === '23505') throw new Error('Un rôle avec ce nom existe déjà')
    throw new Error(roleError?.message || 'Échec de création du rôle')
  }

  const { data: permissions } = await supabase.from('permissions').select('id, key').in('key', permissionKeys)
  const rows = (permissions ?? []).map((p) => ({ role_id: role.id, permission_id: p.id }))
  if (rows.length > 0) {
    const { error: linkError } = await supabase.from('role_permissions').insert(rows)
    if (linkError) throw new Error(linkError.message)
  }

  revalidatePath('/settings')
}

export async function deleteCustomRole(roleId: string) {
  const { supabase } = await getAgencyAndUser()

  const { count } = await supabase
    .from('agency_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', roleId)
  if (count && count > 0) throw new Error('Ce rôle est encore attribué à des membres — changez leur rôle avant de le supprimer')

  const { error } = await supabase.from('roles').delete().eq('id', roleId).eq('is_system', false)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

// Public, pre-auth lookup for the /join page — the invite token itself is
// the access credential (unguessable, single-purpose), so an admin-client
// read of exactly one row by its exact token is the same trust model as any
// invite-link flow (e.g. a password-reset link), not a bulk-access hole.
export async function getInvitationByToken(token: string) {
  if (!token) return null
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('agency_invitations')
    .select('id, email, status, agencies(name), roles(name)')
    .eq('token', token)
    .maybeSingle()
  if (!data) return null
  return {
    email: data.email as string,
    status: data.status as string,
    agencyName: (data.agencies as unknown as { name: string } | null)?.name ?? 'une agence',
    roleName: (data.roles as unknown as { name: string } | null)?.name ?? '',
  }
}

// Called from the /join page once the invitee has an active session
// (whether they just registered — handle_new_user() already joined them
// automatically by email match — or they already had an account and just
// logged in, which the trigger never sees). Idempotent: a no-op if the
// membership already exists.
export async function acceptInvitation(token: string) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Connexion requise')

  const admin = await createAdminClient()
  const { data: invitation } = await admin
    .from('agency_invitations')
    .select('id, agency_id, email, role_id, status, invited_by')
    .eq('token', token)
    .maybeSingle()
  if (!invitation) throw new Error('Invitation introuvable')
  if (invitation.status === 'revoked') throw new Error('Cette invitation a été révoquée')
  if (invitation.email.toLowerCase() !== (authUser.email || '').toLowerCase()) {
    throw new Error(`Cette invitation est destinée à ${invitation.email} — connectez-vous avec cette adresse`)
  }

  const { data: appUser } = await supabase.from('users').select('id').eq('auth_user_id', authUser.id).single()
  if (!appUser) throw new Error('Utilisateur introuvable')

  const { data: existing } = await admin
    .from('agency_memberships')
    .select('id')
    .eq('agency_id', invitation.agency_id)
    .eq('user_id', appUser.id)
    .maybeSingle()

  if (!existing) {
    const { error } = await admin.from('agency_memberships').insert({
      agency_id: invitation.agency_id,
      user_id: appUser.id,
      role_id: invitation.role_id,
      status: 'active',
      invited_by: invitation.invited_by,
      joined_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
  }

  if (invitation.status === 'pending') {
    await admin.from('agency_invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id)
  }

  const { data: agency } = await admin.from('agencies').select('name').eq('id', invitation.agency_id).single()
  return { agencyName: agency?.name ?? 'votre agence' }
}
