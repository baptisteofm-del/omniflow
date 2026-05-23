'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, Lightbulb, Flame, TrendingUp, MessageSquare,
  DollarSign, Target, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { ChattingKPIs } from '@/components/dashboard/chatting/ChattingKPIs'
import { UnhappyFansCard } from '@/components/dashboard/chatting/UnhappyFansCard'
import { MissedOpportunitiesCard } from '@/components/dashboard/chatting/MissedOpportunitiesCard'
import { TopPerformersCard } from '@/components/dashboard/chatting/TopPerformersCard'
import { DailyReportCard } from '@/components/dashboard/chatting/DailyReportCard'
import toast from 'react-hot-toast'

export default function ChattingPage() {
  const [reports, setReports] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasIntegrations, setHasIntegrations] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Check integrations first
      const integRes = await fetch('/api/integrations')
      if (integRes.ok) {
        const integData = await integRes.json()
        const hasOForMYM = integData.integrations?.some(
          (i: any) => (i.tool === 'onlyfans' || i.tool === 'mym') && i.is_active
        )
        setHasIntegrations(hasOForMYM)
      }

      const [reportsRes, insightsRes] = await Promise.all([
        fetch('/api/chatting/reports'),
        fetch('/api/chatting/insights'),
      ])

      if (!reportsRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch')
      }

      const reportsData = await reportsRes.json()
      const insightsData = await insightsRes.json()

      setReports(reportsData)
      setInsights(insightsData)
    } catch (error) {
      console.error('Error fetching chatting data:', error)
      toast.error('Erreur lors du chargement des rapports de chatting')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  if (!hasIntegrations) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rapports Chatting</h1>
          <p className="text-gray-400 mt-1">Analyse complète de vos interactions et performances</p>
        </div>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="glass rounded-2xl p-10 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap size={28} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connexion requise</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              Les rapports chatting analysent vos vraies conversations, fans et performances.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Pour y accéder, connectez au moins une plateforme <span className="text-white font-medium">OnlyFans</span> ou <span className="text-white font-medium">MYM</span> dans vos intégrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/settings/integrations"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-[1.02]">
                <Zap size={15} />
                Connecter OnlyFans / MYM
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-white/10 transition-all">
                Retour au dashboard
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-5">
              Une fois connecté, vos données se synchronisent automatiquement.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rapports Chatting</h1>
        <p className="text-gray-400 mt-1">Analyse complète de vos interactions et performances</p>
      </div>

      {/* KPIs */}
      <ChattingKPIs reports={reports} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* Unhappy Fans */}
          <UnhappyFansCard insights={insights} />

          {/* Missed Opportunities */}
          <MissedOpportunitiesCard insights={insights} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Performers */}
          <TopPerformersCard insights={insights} />

          {/* Daily Report */}
          <DailyReportCard reports={reports} insights={insights} />
        </div>
      </div>
    </div>
  )
}
