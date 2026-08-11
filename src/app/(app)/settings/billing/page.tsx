import { CreditCard, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PlanSwitcher } from '@/components/app/settings/PlanSwitcher'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

function formatEuro(n: number) {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`
}

// Billing Page (spec 22.17) + Commission Disclosure (spec 22.10/47.105 —
// "afficher clairement la commission dans le parcours pricing/contractuel").
// Mock billing provider (spec 22.61) — agencies.billing_provider stays
// 'mock' here; no real payment is processed.
export default async function BillingPage() {
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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Facturation</h1>
      <p className="mb-8 text-sm text-[color:var(--foreground-muted)]">
        Abonnement, commission sur les ventes éligibles, et journal des commissions.
      </p>

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
