import Link from 'next/link'
import { ShieldAlert, ShieldCheck, CreditCard, Info, Users, ShieldCheck as ShieldIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AiSettingsPanel } from '@/components/app/settings/AiSettingsPanel'
import { PlanSwitcher } from '@/components/app/settings/PlanSwitcher'
import { TeamManager } from '@/components/app/team/TeamManager'
import { RolesPanel } from '@/components/app/team/RolesPanel'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

function formatEuro(n: number) {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`
}

type Tab = 'ai' | 'billing' | 'team'
const TABS: { key: Tab; label: string; icon: typeof ShieldIcon }[] = [
  { key: 'ai', label: 'IA', icon: ShieldIcon },
  { key: 'billing', label: 'Facturation', icon: CreditCard },
  { key: 'team', label: 'Équipe', icon: Users },
]

// Paramètres (owner correction: "c'était pas faire des groupes dans la
// sidebar mais des regroupements sur une page seulement") — IA/Facturation/
// Équipe are three tabs of ONE page/route now, matching "Paramétrer ne doit
// plus être une catégorie principale indépendante" from the V2 brief.
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: tabParam } = await searchParams
  const tab: Tab = tabParam === 'billing' ? 'billing' : tabParam === 'team' ? 'team' : 'ai'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
          Autonomie IA, abonnement et commission, équipe et permissions.
        </p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-[color:var(--border)]">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <Link
              key={t.key}
              href={`/settings?tab=${t.key}`}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-[color:var(--violet)] text-[color:var(--foreground)]'
                  : 'border-transparent text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          )
        })}
      </div>

      {tab === 'ai' && <AiTab />}
      {tab === 'billing' && <BillingTab />}
      {tab === 'team' && <TeamTab />}
    </div>
  )
}

async function AiTab() {
  const { supabase, allowed } = await checkPageAccess('ai_settings.manage')
  if (!allowed) return <AccessRestricted feature="les Paramètres IA" />

  const { data: creators } = await supabase
    .from('creators')
    .select('id, display_name, creator_commercial_settings(full_ai_enabled, default_ai_mode)')
    .order('display_name', { ascending: true })

  const { data: switches } = await supabase
    .from('ai_kill_switches')
    .select('id, scope, creator_id, action_type, reason, created_at')
    .order('created_at', { ascending: false })

  const globalSwitch = (switches ?? []).find((s) => s.scope === 'global')
  const agencySwitches = (switches ?? []).filter((s) => s.scope !== 'global')

  const creatorRows = (creators ?? []).map((c) => {
    const settings = c.creator_commercial_settings as unknown as
      | { full_ai_enabled: boolean; default_ai_mode: string }[]
      | { full_ai_enabled: boolean; default_ai_mode: string }
      | null
    const row = Array.isArray(settings) ? settings[0] : settings
    return {
      id: c.id as string,
      displayName: c.display_name as string,
      fullAiEnabled: row?.full_ai_enabled ?? false,
      defaultAiMode: row?.default_ai_mode ?? 'copilot',
    }
  })

  const killSwitchRows = agencySwitches.map((s) => ({
    id: s.id as string,
    scope: s.scope as string,
    creatorId: s.creator_id as string | null,
    actionType: s.action_type as string | null,
    reason: s.reason as string | null,
  }))

  return (
    <div>
      {globalSwitch && (
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl border border-[color:var(--danger)]/40 p-4 text-sm text-[color:var(--danger)]">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Full AI est coupé globalement par OmniFlow{globalSwitch.reason ? ` — ${globalSwitch.reason}` : ''}. Aucune action Full AI
          ne peut s&apos;exécuter tant que cette coupure est active.
        </div>
      )}

      {!globalSwitch && (
        <div className="glass mb-6 flex items-center gap-2 rounded-2xl p-4 text-sm text-[color:var(--foreground-muted)]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[color:var(--success)]" />
          Aucune coupure globale active.
        </div>
      )}

      <AiSettingsPanel creators={creatorRows} killSwitches={killSwitchRows} />
    </div>
  )
}

async function BillingTab() {
  const { allowed } = await checkPageAccess('billing.view')
  if (!allowed) return <AccessRestricted feature="la Facturation" />

  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  const { data: appUser } = authUser
    ? await supabase.from('users').select('id').eq('auth_user_id', authUser.id).single()
    : { data: null }
  const { data: membership } = appUser
    ? await supabase
        .from('agency_memberships')
        .select('agency_id, agencies(id, plan_id, status, billing_provider, current_period_start, current_period_end)')
        .eq('user_id', appUser.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
    : { data: null }

  const agency = membership?.agencies as unknown as {
    id: string
    plan_id: string
    status: string
    billing_provider: string
    current_period_start: string
    current_period_end: string
  } | null

  const { data: plans } = await supabase.from('plans').select('id, display_name, monthly_price, commission_rate').eq('active', true)

  const currentPlan = (plans ?? []).find((p) => p.id === agency?.plan_id)
  const billingPeriod = new Date().toISOString().slice(0, 7)

  const { data: ledgerRows } = agency
    ? await supabase
        .from('commission_ledger')
        .select('id, eligible_amount, commission_amount, currency, status, billing_period, created_at')
        .eq('agency_id', agency.id)
        .eq('billing_period', billingPeriod)
        .order('created_at', { ascending: false })
    : { data: [] }

  const periodEligible = (ledgerRows ?? []).reduce((sum, r) => sum + (r.eligible_amount ?? 0), 0)
  const periodCommission = (ledgerRows ?? []).reduce((sum, r) => sum + (r.commission_amount ?? 0), 0)

  return (
    <div>
      <div className="glass mb-6 flex items-start gap-3 rounded-2xl p-5 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--cyan)]" />
        <p className="text-[color:var(--foreground-muted)]">
          OmniFlow prélève une <span className="text-[color:var(--foreground)] font-medium">commission de 2,5%</span> sur les
          ventes éligibles (achats de contenu, offres payantes) en plus de l&apos;abonnement mensuel. Les abonnements
          plateforme (ex: OnlyFans) ne sont pas concernés par cette commission.
        </p>
      </div>

      <div className="glass mb-6 rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <CreditCard className="h-4 w-4" />
          Offre actuelle
        </div>
        {agency && currentPlan ? (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[color:var(--border-strong)] bg-white/5 px-4 py-3">
            <div>
              <p className="font-medium">{currentPlan.display_name}</p>
              <p className="text-xs text-[color:var(--foreground-muted)]">
                {currentPlan.monthly_price}€/mois · commission {Math.round(currentPlan.commission_rate * 1000) / 10}% ·
                statut {agency.status} · fournisseur {agency.billing_provider === 'mock' ? 'Mock (test)' : agency.billing_provider}
              </p>
            </div>
          </div>
        ) : (
          <p className="mb-4 text-xs text-[color:var(--foreground-muted)]">Aucun abonnement actif.</p>
        )}
        <PlanSwitcher plans={plans ?? []} currentPlanId={agency?.plan_id ?? null} />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Commissions — période en cours ({billingPeriod})</h2>
          <span className="text-xs text-[color:var(--foreground-muted)]">
            {formatEuro(periodEligible)} éligible → {formatEuro(periodCommission)}
          </span>
        </div>
        {!ledgerRows || ledgerRows.length === 0 ? (
          <p className="text-xs text-[color:var(--foreground-muted)]">Aucune commission enregistrée sur cette période.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[color:var(--foreground-muted)]">
                <th className="pb-2 font-normal">Date</th>
                <th className="pb-2 font-normal text-right">Montant éligible</th>
                <th className="pb-2 font-normal text-right">Commission</th>
                <th className="pb-2 font-normal text-right">Statut</th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.map((r) => (
                <tr key={r.id} className="border-t border-[color:var(--border)]">
                  <td className="py-2">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 text-right">{formatEuro(r.eligible_amount)}</td>
                  <td className="py-2 text-right font-medium">{formatEuro(r.commission_amount)}</td>
                  <td className="py-2 text-right text-[color:var(--foreground-muted)]">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

async function TeamTab() {
  const { supabase, allowed } = await checkPageAccess('team.manage')
  if (!allowed) return <AccessRestricted feature="l'Équipe" />

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
    <div>
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
