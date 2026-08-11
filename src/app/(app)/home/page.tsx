import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, Bell, MessageSquareWarning, PlugZap, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getRevenueMetrics, getRevenueTimeSeries, getCreatorComparison, getFanSegments } from '@/lib/analytics/metrics'
import { DASHBOARD_RANGE_LABELS, resolveDashboardRange, type DashboardRangeKey } from '@/lib/analytics/dashboardRange'
import { RevenueChart } from '@/components/app/dashboard/RevenueChart'
import { FAN_FLOW_LABELS, FAN_FLOW_BG_CLASSES } from '@/lib/fans/fanFlow'
import { formatEuro, formatPercent, formatRelativeTime } from '@/lib/format'

// The Dashboard's job is signal, not navigation — every other tool is
// already one click away in the Sidebar, so this page doesn't repeat that
// as a grid of link cards (that's what the previous version of this page
// was, and the owner correctly flagged it as not earning its place). What
// it adds instead: what needs a human right now, and how the agency is
// doing right now, both computed from the same metric functions Analytics
// uses (src/lib/analytics/metrics.ts) — never a second, drifting definition.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const { range: rangeParam, from: fromParam, to: toParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: appUser } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('auth_user_id', authUser.id)
    .single()

  const { data: membership } = await supabase
    .from('agency_memberships')
    .select('agency_id, agencies(name, plan_id), roles(name)')
    .eq('user_id', appUser?.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  const agency = membership?.agencies as unknown as { name: string; plan_id: string } | null
  const role = membership?.roles as unknown as { name: string } | null
  const agencyId = (membership?.agency_id as string | undefined) ?? ''

  const { key: rangeKey, range, customFrom, customTo } = resolveDashboardRange(rangeParam, fromParam, toParam)

  const [
    revenue,
    revenueSeries,
    topCreators,
    fanSegments,
    { data: convRows },
    { data: brokenConnections },
    { data: notifications },
    { data: platforms },
    { count: activeScriptsCount },
  ] = await Promise.all([
    getRevenueMetrics(supabase, agencyId, range),
    getRevenueTimeSeries(supabase, agencyId, range),
    getCreatorComparison(supabase, agencyId, range),
    getFanSegments(supabase, agencyId),
    supabase.from('conversations').select('id, platform_id, last_inbound_at, last_outbound_at'),
    supabase
      .from('platform_connections')
      .select('creator_id, platform_credentials(last_error), creators(display_name)')
      .eq('status', 'error'),
    supabase
      .from('agency_notifications')
      .select('id, type, title, body, conversation_id, read_at, created_at')
      .eq('agency_id', agencyId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('platforms').select('id, code'),
    supabase.from('scripts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  // Test/simulation conversations never count as "needs your attention" —
  // see src/lib/analytics/metrics.ts's getMockConversationIds for the same
  // rule applied to revenue.
  const mockPlatformId = (platforms ?? []).find((p) => p.code === 'MOCK')?.id
  const realConversations = (convRows ?? []).filter((c) => c.platform_id !== mockPlatformId)
  const activeConversationsCount = realConversations.length
  const awaitingReplyCount = realConversations.filter((c) => {
    const lastInbound = c.last_inbound_at as string | null
    const lastOutbound = c.last_outbound_at as string | null
    return !!lastInbound && (!lastOutbound || lastInbound > lastOutbound)
  }).length

  const connectionIssues = (brokenConnections ?? []).map((c) => {
    const creator = c.creators as unknown as { display_name: string } | null
    const credRow = c.platform_credentials as unknown as { last_error: string | null }[] | { last_error: string | null } | null
    const lastError = (Array.isArray(credRow) ? credRow[0] : credRow)?.last_error ?? null
    return { creatorId: c.creator_id as string, creatorName: creator?.display_name ?? '—', lastError }
  })

  const hasAlerts = awaitingReplyCount > 0 || connectionIssues.length > 0 || (notifications ?? []).length > 0
  const totalFanSegments = Object.values(fanSegments).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Bonjour{appUser?.display_name ? `, ${appUser.display_name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            {agency?.name ?? '—'} · Plan {agency?.plan_id === 'full_ai' ? 'Full AI' : 'Copilot'} · {role?.name ?? '—'}
          </p>
        </div>
      </div>

      <div className="mb-8 glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-[color:var(--cyan)]" />À traiter
        </div>
        {!hasAlerts ? (
          <p className="text-sm text-[color:var(--foreground-muted)]">Rien qui attend une action de votre part pour l&apos;instant.</p>
        ) : (
          <div className="space-y-2">
            {awaitingReplyCount > 0 && (
              <Link
                href="/inbox"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <MessageSquareWarning className="h-4 w-4 text-[color:var(--cyan)]" />
                  {awaitingReplyCount} conversation{awaitingReplyCount > 1 ? 's' : ''} en attente de réponse
                </span>
                <ArrowRight className="h-4 w-4 text-[color:var(--foreground-muted)]" />
              </Link>
            )}
            {connectionIssues.map((c) => (
              <Link
                key={c.creatorId}
                href={`/creators/${c.creatorId}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <PlugZap className="h-4 w-4 text-[color:var(--danger)]" />
                  Connexion MYM en erreur — {c.creatorName}
                  {c.lastError && <span className="text-[color:var(--foreground-muted)]">({c.lastError})</span>}
                </span>
                <ArrowRight className="h-4 w-4 text-[color:var(--foreground-muted)]" />
              </Link>
            ))}
            {(notifications ?? []).map((n) => (
              <Link
                key={n.id}
                href={n.conversation_id ? `/inbox/${n.conversation_id}` : '/inbox'}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[color:var(--violet)]" />
                  {n.title}
                </span>
                <span className="shrink-0 text-xs text-[color:var(--foreground-muted)]">{formatRelativeTime(n.created_at as string)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[color:var(--violet)]" />
          <h2 className="text-sm font-semibold">Chiffre d&apos;affaires</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {(Object.keys(DASHBOARD_RANGE_LABELS) as DashboardRangeKey[])
            .filter((key) => key !== 'custom')
            .map((key) => (
              <Link
                key={key}
                href={`/home?range=${key}`}
                className={`rounded-full border px-3 py-1 text-xs ${
                  rangeKey === key
                    ? 'border-[color:var(--border-strong)] bg-white/10'
                    : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'
                }`}
              >
                {DASHBOARD_RANGE_LABELS[key]}
              </Link>
            ))}
          <details className="relative">
            <summary
              className={`cursor-pointer list-none rounded-full border px-3 py-1 text-xs ${
                rangeKey === 'custom'
                  ? 'border-[color:var(--border-strong)] bg-white/10'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'
              }`}
            >
              {rangeKey === 'custom' && customFrom && customTo ? `${customFrom} → ${customTo}` : 'Personnalisé'}
            </summary>
            <form
              action="/home"
              className="glass absolute right-0 top-8 z-10 flex flex-col gap-2 rounded-xl p-3"
              style={{ width: 220 }}
            >
              <input type="hidden" name="range" value="custom" />
              <label className="text-[10px] text-[color:var(--foreground-muted)]">
                Du
                <input
                  type="date"
                  name="from"
                  defaultValue={customFrom}
                  className="mt-0.5 w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
              </label>
              <label className="text-[10px] text-[color:var(--foreground-muted)]">
                Au
                <input
                  type="date"
                  name="to"
                  defaultValue={customTo}
                  className="mt-0.5 w-full rounded-lg border border-[color:var(--border)] bg-white/5 px-2 py-1 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
                />
              </label>
              <button type="submit" className="gradient-bg-signature rounded-lg py-1.5 text-xs font-medium text-white">
                Appliquer
              </button>
            </form>
          </details>
        </div>
      </div>

      <div className="glass mb-8 rounded-2xl p-5">
        <RevenueChart points={revenueSeries} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[color:var(--foreground-muted)]">
          Indicateurs — {DASHBOARD_RANGE_LABELS[rangeKey]}
        </h2>
        <Link href="/analytics" className="text-xs text-[color:var(--cyan)] hover:underline">
          Voir tout l&apos;Analytics →
        </Link>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenu" value={formatEuro(revenue.totalRevenue)} sub={`${revenue.salesCount} vente(s)`} />
        <KpiCard
          label="Revenu attribué à l'IA"
          value={formatEuro(revenue.aiAttributedRevenue)}
          sub={revenue.totalRevenue > 0 ? `${Math.round((revenue.aiAttributedRevenue / revenue.totalRevenue) * 100)}% du revenu` : '—'}
        />
        <KpiCard
          label="Conversion offres"
          value={formatPercent(revenue.conversionRate)}
          sub={`${revenue.offersPurchasedCount}/${revenue.offersSentCount} offres`}
        />
        <KpiCard label="Conversations actives" value={String(activeConversationsCount)} sub={`${activeScriptsCount ?? 0} script(s) actif(s)`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Top créatrices — {DASHBOARD_RANGE_LABELS[rangeKey]}</h2>
          {topCreators.every((c) => c.revenue === 0) ? (
            <p className="text-xs text-[color:var(--foreground-muted)]">Aucune vente sur cette période.</p>
          ) : (
            <div className="space-y-2">
              {topCreators.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/creators/${c.id}`}
                  className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
                >
                  <span>{c.displayName}</span>
                  <span className="font-medium">{formatEuro(c.revenue)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Segments fans</h2>
          {totalFanSegments === 0 ? (
            <p className="text-xs text-[color:var(--foreground-muted)]">Aucun fan pour l&apos;instant.</p>
          ) : (
            <div className="space-y-2">
              {(Object.keys(FAN_FLOW_LABELS) as (keyof typeof FAN_FLOW_LABELS)[]).map((stage) => {
                const count = fanSegments[stage]
                const pct = totalFanSegments > 0 ? Math.round((count / totalFanSegments) * 100) : 0
                return (
                  <div key={stage} className="flex items-center gap-3 text-xs">
                    <span className="w-24 shrink-0 text-[color:var(--foreground-muted)]">{FAN_FLOW_LABELS[stage]}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${FAN_FLOW_BG_CLASSES[stage]}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {agency?.plan_id !== 'full_ai' && (
        <div className="mt-8 glass gradient-bg-signature flex items-center justify-between rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Passez au plan Full AI pour laisser l&apos;IA vendre en autonomie sur les conversations que vous lui confiez.
          </div>
          <Link href="/settings/billing" className="shrink-0 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium hover:bg-white/25">
            Voir les plans
          </Link>
        </div>
      )}
    </div>
  )
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs text-[color:var(--foreground-muted)]">{label}</p>
      <p className="gradient-text mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-[color:var(--foreground-muted)]">{sub}</p>
    </div>
  )
}
