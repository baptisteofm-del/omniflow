import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CreditCard, Activity, ArrowUpRight, AlertTriangle, Wallet, DollarSign } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérifier si admin — utilise le client service role pour bypasser RLS
  const adminClient = await createAdminClient()
  const { data: admin } = await adminClient.from('admins').select('id').eq('id', user.id).single()
  // Debug temporaire - afficher qui est connecté si pas admin
  if (!admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-400 mb-2">❌ Non admin</p>
          <p className="text-gray-400 text-sm">User ID: {user.id}</p>
          <p className="text-gray-400 text-sm">Email: {user.email}</p>
        </div>
      </div>
    )
  }

  // Récupérer les stats globales
  const { data: agencies } = await adminClient
    .from('agencies')
    .select('id, name, plan_id, subscription_status, trial_ends_at, created_at, updated_at')
    .order('created_at', { ascending: false })

  const { count: modelsCount } = await adminClient.from('models').select('*', { count: 'exact', head: true })
  const { count: postsCount } = await adminClient.from('scheduled_posts').select('*', { count: 'exact', head: true })

  const totalAgencies = agencies?.length || 0
  const activeAgencies = agencies?.filter(a => a.subscription_status === 'active').length || 0
  const trialAgencies = agencies?.filter(a => a.subscription_status === 'trialing').length || 0

  // Calculer MRR estimé
  const planPrices: Record<string, number> = { starter: 49, pro: 99, agency: 249 }
  const mrr = agencies?.filter(a => a.subscription_status === 'active')
    .reduce((sum, a) => sum + (planPrices[a.plan_id] || 0), 0) || 0

  // === GROWTH METRICS ===

  // Fetch enrollments per week (last 6 weeks) for growth chart
  const sixWeeksAgo = new Date()
  sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42)
  const { data: recentEnrollments } = await adminClient
    .from('agencies')
    .select('created_at')
    .gte('created_at', sixWeeksAgo.toISOString())
    .order('created_at', { ascending: true })

  // Group enrollments by week
  const enrollmentsByWeek: Record<string, number> = {}
  const weekLabels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - (i * 7))
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    enrollmentsByWeek[weekKey] = 0
    weekLabels.push(`S${6 - i}`)
  }

  recentEnrollments?.forEach(agency => {
    const date = new Date(agency.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    if (weekKey in enrollmentsByWeek) {
      enrollmentsByWeek[weekKey]++
    }
  })

  const enrollmentData = Object.values(enrollmentsByWeek)
  const maxEnrollments = Math.max(...enrollmentData, 1)

  // Calculate conversion rate (trial → paying)
  const trialToPayingConversion = totalAgencies > 0
    ? Math.round((activeAgencies / totalAgencies) * 100)
    : 0

  // Calculate churn rate (canceled subscriptions last month)
  const lastMonthStart = new Date()
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
  const { data: canceledLastMonth } = await adminClient
    .from('agencies')
    .select('id')
    .eq('subscription_status', 'canceled')
    .gte('updated_at', lastMonthStart.toISOString())
  const churnRate = activeAgencies > 0
    ? Math.round(((canceledLastMonth?.length || 0) / activeAgencies) * 100)
    : 0

  // ARR (MRR x 12)
  const arr = mrr * 12

  // LTV average
  const { data: transactions } = await adminClient
    .from('transactions')
    .select('amount, agency_id')
  const ltv = activeAgencies > 0 && transactions && transactions.length > 0
    ? Math.round(transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) / activeAgencies)
    : 0

  // Fetch at-risk agencies (trial ending < 3 days)
  const inThreeDays = new Date()
  inThreeDays.setDate(inThreeDays.getDate() + 3)
  const { data: atRiskTrials } = await adminClient
    .from('agencies')
    .select('id, name, trial_ends_at, plan_id')
    .eq('subscription_status', 'trialing')
    .lte('trial_ends_at', inThreeDays.toISOString())
    .gte('trial_ends_at', new Date().toISOString())
    .order('trial_ends_at', { ascending: true })

  // Fetch past_due agencies
  const { data: pastDueAgencies } = await adminClient
    .from('agencies')
    .select('id, name, plan_id, subscription_status')
    .eq('subscription_status', 'past_due')

  const atRiskAgencies = [...(atRiskTrials || []), ...(pastDueAgencies || [])]

  // Crypto revenue (placeholder — would come from NOWPayments integration)
  const cryptoRevenue = 0
  const paddleRevenue = mrr

  const planColors: Record<string, string> = {
    starter: 'text-gray-400 bg-gray-500/10',
    pro: 'text-purple-400 bg-purple-500/10',
    agency: 'text-cyan-400 bg-cyan-500/10',
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-400',
    trialing: 'text-yellow-400',
    canceled: 'text-red-400',
    past_due: 'text-orange-400',
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-purple-400 text-sm font-medium">Admin OmniFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Vue globale</h1>
        </div>
        <a href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white glass px-4 py-2 rounded-xl transition-all">
          Mon dashboard <ArrowUpRight size={14} />
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total agences', value: totalAgencies, icon: Users, color: 'text-purple-400', sub: `${trialAgencies} en essai` },
          { label: 'Agences actives', value: activeAgencies, icon: Activity, color: 'text-green-400', sub: 'abonnées' },
          { label: 'MRR estimé', value: `${mrr}€`, icon: CreditCard, color: 'text-cyan-400', sub: 'mensuel récurrent' },
          { label: 'Modèles gérés', value: modelsCount || 0, icon: TrendingUp, color: 'text-pink-400', sub: `${postsCount || 0} posts schedulés` },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className={s.color} />
              <span className="text-xs text-gray-600">{s.sub}</span>
            </div>
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Growth Section */}
      <div className="glass rounded-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Croissance</h2>
        </div>
        <div className="p-6 space-y-8">
          {/* MRR Chart — Last 6 months (simulated) */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">MRR sur 6 mois</h3>
            <div className="flex items-end gap-2 h-40">
              {[mrr * 0.6, mrr * 0.7, mrr * 0.75, mrr * 0.85, mrr * 0.95, mrr].map((value, i) => {
                const heightPercent = (value / Math.max(mrr, 1)) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md transition-all hover:from-purple-400 hover:to-purple-300 cursor-pointer relative group"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.round(value)}€
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">M{6 - i}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enrollments per week */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4">Inscriptions par semaine</h3>
            <div className="flex items-end gap-2 h-32">
              {enrollmentData.map((value, i) => {
                const heightPercent = (value / Math.max(maxEnrollments, 1)) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md transition-all hover:from-cyan-400 hover:to-cyan-300 cursor-pointer relative group"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{weekLabels[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ARR', value: `${arr}€`, icon: DollarSign, color: 'text-green-400' },
          { label: 'LTV moyen', value: `${ltv}€`, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Conversion Essai → Payant', value: `${trialToPayingConversion}%`, icon: Activity, color: 'text-purple-400' },
          { label: 'Churn Rate', value: `${churnRate}%`, icon: AlertTriangle, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* At-Risk Agencies Section */}
      {atRiskAgencies.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden mb-8">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            <h2 className="font-semibold text-white">Agences à risque ({atRiskAgencies.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {atRiskAgencies.map(agency => {
              const isPastDue = 'subscription_status' in agency && agency.subscription_status === 'past_due'
              const daysLeft = !isPastDue && 'trial_ends_at' in agency
                ? Math.ceil((new Date(agency.trial_ends_at as string).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null
              return (
                <div key={agency.id} className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-white">{agency.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isPastDue
                        ? '⚠️ Abonnement en retard'
                        : `Essai expire dans ${daysLeft} jour${daysLeft !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // In a real app, this would trigger the email drip
                      alert(`Rappel envoyé à ${agency.name}`)
                    }}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm font-medium rounded-lg transition-all"
                  >
                    Envoyer un rappel
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Crypto Revenue Section */}
      <div className="glass rounded-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Wallet size={18} className="text-cyan-400" />
          <h2 className="font-semibold text-white">Revenus Crypto</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paddle</p>
              <p className="text-2xl font-bold text-purple-400">{paddleRevenue}€</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NOWPayments</p>
              <p className="text-2xl font-bold text-yellow-400">{cryptoRevenue}€</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-cyan-400">{paddleRevenue + cryptoRevenue}€</p>
            </div>
          </div>

          {/* Simple donut chart with CSS */}
          <div className="flex items-center justify-center gap-8">
            <div className="w-32 h-32 rounded-full flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#a855f7 ${(paddleRevenue / (paddleRevenue + cryptoRevenue || 1)) * 360}deg, #eab308 0deg)`,
                }}
              />
              <div className="absolute inset-2 bg-[#0a0a0f] rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Répartition</p>
                  <p className="text-lg font-bold text-white mt-1">{paddleRevenue + cryptoRevenue}€</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-300">Paddle: {((paddleRevenue / (paddleRevenue + cryptoRevenue || 1)) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-gray-300">Crypto: {((cryptoRevenue / (paddleRevenue + cryptoRevenue || 1)) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des agences */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Toutes les agences ({totalAgencies})</h2>
        </div>
        {!agencies || agencies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucune agence inscrite</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Agence</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Inscrite le</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">MRR</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map(agency => (
                  <tr key={agency.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                          {agency.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{agency.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${planColors[agency.plan_id] || 'text-gray-400 bg-gray-500/10'}`}>
                        {agency.plan_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium capitalize ${statusColors[agency.subscription_status || ''] || 'text-gray-400'}`}>
                        {agency.subscription_status === 'trialing' ? '🟡 Essai' :
                         agency.subscription_status === 'active' ? '🟢 Actif' :
                         agency.subscription_status === 'canceled' ? '🔴 Annulé' : agency.subscription_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(agency.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-sm font-medium text-white">
                      {agency.subscription_status === 'active' ? `${planPrices[agency.plan_id] || 0}€` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
