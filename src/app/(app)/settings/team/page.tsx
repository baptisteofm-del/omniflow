import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TeamManager } from '@/components/app/team/TeamManager'
import { RolesPanel } from '@/components/app/team/RolesPanel'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  const { data: appUser } = authUser
    ? await supabase.from('users').select('id').eq('auth_user_id', authUser.id).single()
    : { data: null }

  const { data: membership } = appUser
    ? await supabase.from('agency_memberships').select('agency_id').eq('user_id', appUser.id).eq('status', 'active').maybeSingle()
    : { data: null }
  const agencyId = membership?.agency_id as string | undefined

  const [
    { data: members },
    { data: invitations },
    { data: systemRoles },
    { data: customRoles },
    { data: permissions },
    { data: rolePermissions },
  ] = await Promise.all([
    agencyId
      ? supabase
          .from('agency_memberships')
          .select('id, user_id, role_id, status, joined_at, users(display_name, email), roles(name)')
          .eq('agency_id', agencyId)
          .neq('status', 'removed')
          .order('joined_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    agencyId
      ? supabase
          .from('agency_invitations')
          .select('id, email, status, created_at, token, roles(name)')
          .eq('agency_id', agencyId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase.from('roles').select('id, name').eq('is_system', true).order('name'),
    agencyId
      ? supabase.from('roles').select('id, name').eq('agency_id', agencyId).eq('is_system', false).order('name')
      : Promise.resolve({ data: [] }),
    supabase.from('permissions').select('id, key, description').order('key'),
    supabase.from('role_permissions').select('role_id, permission_id'),
  ])

  const allRoles = [...(systemRoles ?? []), ...(customRoles ?? [])]

  const permissionsByRole = new Map<string, string[]>()
  for (const rp of rolePermissions ?? []) {
    const list = permissionsByRole.get(rp.role_id as string) ?? []
    list.push(rp.permission_id as string)
    permissionsByRole.set(rp.role_id as string, list)
  }

  const memberRows = (members ?? []).map((m) => {
    const user = m.users as unknown as { display_name: string | null; email: string } | null
    const role = m.roles as unknown as { name: string } | null
    return {
      id: m.id as string,
      userId: m.user_id as string,
      name: user?.display_name || user?.email || 'Membre',
      email: user?.email ?? '',
      roleId: m.role_id as string,
      roleName: role?.name ?? '—',
      status: m.status as string,
    }
  })

  const invitationRows = (invitations ?? []).map((i) => ({
    id: i.id as string,
    email: i.email as string,
    roleName: (i.roles as unknown as { name: string } | null)?.name ?? '—',
    token: i.token as string,
    createdAt: i.created_at as string,
  }))

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-2">
        <Users className="h-5 w-5" />
        <div>
          <h1 className="text-xl font-semibold">Équipe</h1>
          <p className="text-sm text-[color:var(--foreground-muted)]">
            Membres de votre agence, leurs rôles et les fonctionnalités qui leur sont accessibles.
          </p>
        </div>
      </div>

      <TeamManager members={memberRows} invitations={invitationRows} roles={allRoles.map((r) => ({ id: r.id, name: r.name }))} />

      <div className="mt-10">
        <RolesPanel
          systemRoles={(systemRoles ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            permissionIds: permissionsByRole.get(r.id as string) ?? [],
          }))}
          customRoles={(customRoles ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            permissionIds: permissionsByRole.get(r.id as string) ?? [],
          }))}
          permissions={(permissions ?? []).map((p) => ({ id: p.id as string, key: p.key as string, description: p.description as string | null }))}
        />
      </div>
    </div>
  )
}
