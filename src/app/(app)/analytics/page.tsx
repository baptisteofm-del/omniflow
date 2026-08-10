import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { resolveRange, RANGE_LABELS, type RangeKey } from '@/lib/analytics/dateRange'
import {
  getRevenueMetrics,
  getCreatorComparison,
  getScriptPerformance,
  getCopilotMetrics,
  getFullAiMetrics,
  getFanSegments,
} from '@/lib/analytics/metrics'
import { FAN_FLOW_LABELS } from '@/lib/fans/fanFlow'

function formatEuro(n: number) {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

function formatPercent(n: number | null) {
  if (n === null) return '—'
  return `${Math.round(n * 100)}%`
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: rangeParam } = await searchParams
  const range = resolveRange(rangeParam)
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
        .select('agency_id')
        .eq('user_id', appUser.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
    : { data: null }

  const agencyId = (membership?.agency_id as string | undefined) ?? ''

  const [revenue, creators, scripts, copilot, fullAi, fanSegments] = await Promise.all([
    getRevenueMetrics(supabase, agencyId, range),
    getCreatorComparison(supabase, agencyId, range),
    getScriptPerformance(supabase, agencyId, range),
    getCopilotMetrics(supabase, agencyId, range),
    getFullAiMetrics(supabase, agencyId, range),
    getFanSegments(supabase, agencyId),
  ])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">
            Une seule définition par indicateur — voir <code>docs/implementation/METRIC_REGISTRY.md</code>.
          </p>
        </div>
        <div className="flex gap-1">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
            <Link
              key={key}
              href={`/analytics?range=${key}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                range.key === key
                  ? 'border-[color:var(--border-strong)] bg-white/10'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)]'
              }`}
            >
              {RANGE_LABELS[key]}
            </Link>
          ))}
        </div>
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
        <KpiCard label="Ventes" value={String(revenue.salesCount)} sub={`${range.key === 'all' ? 'depuis le début' : RANGE_LABELS[range.key]}`} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Créatrices</h2>
          {creators.length === 0 ? (
            <p className="text-xs text-[color:var(--foreground-muted)]">Aucune créatrice.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[color:var(--foreground-muted)]">
                  <th className="pb-2 font-normal">Créatrice</th>
                  <th className="pb-2 font-normal text-right">Ventes</th>
                  <th className="pb-2 font-normal text-right">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((c) => (
                  <tr key={c.id} className="border-t border-[color:var(--border)]">
                    <td className="py-2">{c.displayName}</td>
                    <td className="py-2 text-right">{c.salesCount}</td>
                    <td className="py-2 text-right font-medium">{formatEuro(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Segments fans</h2>
          <div className="space-y-2">
            {(Object.keys(FAN_FLOW_LABELS) as (keyof typeof FAN_FLOW_LABELS)[]).map((stage) => {
              const total = Object.values(fanSegments).reduce((a, b) => a + b, 0)
              const count = fanSegments[stage]
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={stage} className="flex items-center gap-3 text-xs">
                  <span className="w-24 shrink-0 text-[color:var(--foreground-muted)]">{FAN_FLOW_LABELS[stage]}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="gradient-bg-signature h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mb-8 glass rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold">Scripts — diagnostic</h2>
        {scripts.length === 0 ? (
          <p className="text-xs text-[color:var(--foreground-muted)]">Aucun script.</p>
        ) : (
          <div className="space-y-5">
            {scripts.map((s) => (
              <div key={s.id} className="border-t border-[color:var(--border)] pt-4 first:border-t-0 first:pt-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-xs text-[color:var(--foreground-muted)]">
                    {s.runs} lancement(s) · {s.converted} converti(s) · {formatEuro(s.revenue)}
                  </span>
                </div>
                {s.steps.length > 0 && (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-left text-[color:var(--foreground-muted)]">
                        <th className="pb-1 font-normal">Étape</th>
                        <th className="pb-1 font-normal text-right">Entrées</th>
                        <th className="pb-1 font-normal text-right">Offres</th>
                        <th className="pb-1 font-normal text-right">Achetées</th>
                        <th className="pb-1 font-normal text-right">Refusées</th>
                        <th className="pb-1 font-normal text-right">Arrêtées</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.steps.map((step) => (
                        <tr key={step.nodeId} className="border-t border-[color:var(--border)]">
                          <td className="py-1.5">{step.title}</td>
                          <td className="py-1.5 text-right">{step.entered}</td>
                          <td className="py-1.5 text-right">{step.offerSent}</td>
                          <td className="py-1.5 text-right">{step.purchased}</td>
                          <td className="py-1.5 text-right">{step.notPurchased}</td>
                          <td className="py-1.5 text-right">{step.stopped}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Copilot</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Stat label="Suggestions générées" value={String(copilot.generated)} />
            <Stat label="Taux d'acceptation" value={formatPercent(copilot.acceptanceRate)} />
            <Stat label="Envoyées telles quelles" value={String(copilot.sent)} />
            <Stat label="Envoyées après édition" value={String(copilot.editedSent)} />
            <Stat label="Taux d'édition" value={formatPercent(copilot.editRate)} />
            <Stat label="Écartées / régénérées" value={String(copilot.discardedOrRegenerated)} />
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 text-sm font-semibold">Full AI</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Stat label="Messages envoyés" value={String(fullAi.messagesSent)} />
            <Stat label="Offres envoyées" value={String(fullAi.offersSent)} />
            <Stat label="Ventes ratées (esquivées)" value={String(fullAi.missedOpportunities)} />
            <Stat label="Escalades vers un humain" value={String(fullAi.escalations)} />
            <Stat label="Activations Full AI" value={String(fullAi.fullAiActivations)} />
            <Stat label="Taux de prise de contrôle" value={formatPercent(fullAi.takeoverRate)} />
          </div>
          {fullAi.topEscalationReasons.length > 0 && (
            <div className="mt-4 border-t border-[color:var(--border)] pt-3">
              <p className="mb-1.5 text-[10px] text-[color:var(--foreground-muted)]">Principales raisons d&apos;escalade</p>
              <ul className="space-y-1 text-[11px]">
                {fullAi.topEscalationReasons.map((r) => (
                  <li key={r.reason} className="flex justify-between gap-2">
                    <span className="truncate text-[color:var(--foreground-muted)]">{r.reason}</span>
                    <span className="shrink-0 font-medium">{r.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-[color:var(--foreground-muted)]">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  )
}
