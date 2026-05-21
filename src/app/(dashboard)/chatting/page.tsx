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
      <div className="p-8">
        <div className="text-center text-gray-400">Chargement...</div>
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

      {/* Integration banner */}
      {!hasIntegrations && (
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
          <Lightbulb className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-blue-300">Connectez OnlyFans ou MYM pour analyser vos vrais fans</p>
            <p className="text-sm text-blue-300/70 mt-1">Importez automatiquement vos messages, fans et gains pour des insights détaillés.</p>
            <Link href="/settings/integrations" className="inline-block mt-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm font-medium text-blue-300 transition-all">
              Aller aux intégrations →
            </Link>
          </div>
        </div>
      )}

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
