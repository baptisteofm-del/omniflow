import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CreditCard, Activity, ArrowUpRight } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérifier si admin
  const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()
  if (!admin) redirect('/dashboard')

  // Récupérer les stats globales
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name, plan_id, subscription_status, trial_ends_at, created_at')
    .order('created_at', { ascending: false })

  const { count: modelsCount } = await supabase.from('models').select('*', { count: 'exact', head: true })
  const { count: postsCount } = await supabase.from('scheduled_posts').select('*', { count: 'exact', head: true })

  const totalAgencies = agencies?.length || 0
  const activeAgencies = agencies?.filter(a => a.subscription_status === 'active').length || 0
  const trialAgencies = agencies?.filter(a => a.subscription_status === 'trialing').length || 0

  // Calculer MRR estimé
  const planPrices: Record<string, number> = { starter: 49, pro: 99, agency: 249 }
  const mrr = agencies?.filter(a => a.subscription_status === 'active')
    .reduce((sum, a) => sum + (planPrices[a.plan_id] || 0), 0) || 0

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
            <span className="text-purple-400 text-sm font-medium">Admin Omniflow</span>
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
