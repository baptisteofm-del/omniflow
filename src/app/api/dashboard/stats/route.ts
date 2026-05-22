import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper functions for safe queries
const safeCount = async (query: any): Promise<number> => {
  try {
    const { count, error } = await query
    if (error) return 0
    return count || 0
  } catch {
    return 0
  }
}

const safeSelect = async (query: any): Promise<any[]> => {
  try {
    const { data, error } = await query
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

const safeSum = async (query: any): Promise<number> => {
  try {
    const { data, error } = await query
    if (error || !data) return 0
    return data[0]?.sum || 0
  } catch {
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's agency
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, name, plan_id')
      .eq('owner_id', user.id)
      .single()

    if (!agencyData?.id) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const agencyId = agencyData.id

    // Check if agency has active integrations
    const activeIntegrations = await safeCount(
      supabase
        .from('agency_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', agencyId)
        .eq('is_active', true)
    )

    // If no active integrations, return all stats as 0
    if (!activeIntegrations || activeIntegrations === 0) {
      return NextResponse.json({
        agency: {
          name: agencyData?.name || 'Omniflow',
        },
        stats: [
          {
            label: 'Modèles actifs',
            value: '0',
            change: '+0 ce mois',
            icon: 'Users',
            color: 'text-purple-400',
          },
          {
            label: 'Posts ce mois',
            value: '0',
            change: '+0%',
            icon: 'Calendar',
            color: 'text-cyan-400',
          },
          {
            label: 'Revenus (mois)',
            value: '0,00 €',
            change: '+0%',
            icon: 'BarChart3',
            color: 'text-green-400',
          },
          {
            label: 'Trends captés',
            value: '0',
            change: 'nouveau',
            icon: 'Eye',
            color: 'text-pink-400',
          },
          {
            label: 'Messages IA',
            value: '0',
            change: 'ce mois',
            icon: 'MessageSquare',
            color: 'text-blue-400',
          },
          {
            label: 'Fans à risque',
            value: '0',
            change: 'à action',
            icon: 'AlertCircle',
            color: 'text-red-400',
          },
        ],
        recentActivity: [],
        upcomingPosts: [],
        connections: [],
      })
    }

    // 1. Active models count
    const models = await safeSelect(
      supabase
        .from('models')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('is_active', true)
    )
    const activeModelsCount = models.length

    // 2. Posts this month count
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const posts = await safeSelect(
      supabase
        .from('scheduled_posts')
        .select('id')
        .eq('agency_id', agencyId)
        .gte('created_at', monthStart)
    )
    const postsThisMonth = posts.length

    // 3. Monthly revenue
    const transactions = await safeSelect(
      supabase
        .from('finance_transactions')
        .select('amount')
        .eq('agency_id', agencyId)
        .eq('type', 'income')
        .gte('created_at', monthStart)
    )
    const monthlyRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)

    // 4. Trends captured count
    const trends = await safeSelect(
      supabase
        .from('trends')
        .select('id')
        .eq('agency_id', agencyId)
    )
    const trendsCount = trends.length

    // 5. AI messages this month
    const messages = await safeSelect(
      supabase
        .from('ai_messages')
        .select('id')
        .eq('agency_id', agencyId)
        .gte('created_at', monthStart)
    )
    const aiMessagesCount = messages.length

    // 6. At-risk fans count
    const fans = await safeSelect(
      supabase
        .from('fan_profiles')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('engagement_level', 'at_risk')
    )
    const atRiskFans = fans.length

    // Fetch recent AI activity
    const recentActivityData = await safeSelect(
      supabase
        .from('ai_messages')
        .select('id, direction, content, model_id, sent_at')
        .eq('agency_id', agencyId)
        .order('sent_at', { ascending: false })
        .limit(4)
    )
    const recentActivity = recentActivityData.map((msg: any) => ({
      id: msg.id,
      direction: msg.direction,
      content: msg.content ? msg.content.substring(0, 50) : '',
      model_id: msg.model_id,
      sent_at: msg.sent_at,
    }))

    // Fetch upcoming posts
    const now2 = new Date().toISOString()
    const upcomingPostsData = await safeSelect(
      supabase
        .from('scheduled_posts')
        .select('id, title, model_id, scheduled_at, platforms')
        .eq('agency_id', agencyId)
        .gt('scheduled_at', now2)
        .order('scheduled_at', { ascending: true })
        .limit(3)
    )
    const upcomingPosts = upcomingPostsData

    // Fetch integrations
    const integrationsData = await safeSelect(
      supabase
        .from('agency_integrations')
        .select('tool, is_active')
        .eq('agency_id', agencyId)
    )
    const toolsToDisplay = ['OnlyFans', 'MYM', 'AdsPower', 'GeeLark']
    const integrationMap = new Map(integrationsData.map((i: any) => [i.tool, i.is_active]))
    const connections = toolsToDisplay.map((tool) => ({
      name: tool,
      status: integrationMap.get(tool) ? 'connected' : 'disconnected',
      color: integrationMap.get(tool) ? 'green' : 'red',
    }))

    // Format revenue for display
    const formattedRevenue = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(monthlyRevenue)

    // Format large numbers
    const formatLargeNumber = (num: number): string => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
      return num.toString()
    }

    return NextResponse.json({
      agency: {
        name: agencyData?.name || 'Omniflow',
      },
      stats: [
        {
          label: 'Modèles actifs',
          value: activeModelsCount.toString(),
          change: '+0 ce mois',
          icon: 'Users',
          color: 'text-purple-400',
        },
        {
          label: 'Posts ce mois',
          value: formatLargeNumber(postsThisMonth),
          change: '+0%',
          icon: 'Calendar',
          color: 'text-cyan-400',
        },
        {
          label: 'Revenus (mois)',
          value: formattedRevenue,
          change: '+0%',
          icon: 'BarChart3',
          color: 'text-green-400',
        },
        {
          label: 'Trends captés',
          value: formatLargeNumber(trendsCount),
          change: 'nouveau',
          icon: 'Eye',
          color: 'text-pink-400',
        },
        {
          label: 'Messages IA',
          value: formatLargeNumber(aiMessagesCount),
          change: 'ce mois',
          icon: 'MessageSquare',
          color: 'text-blue-400',
        },
        {
          label: 'Fans à risque',
          value: atRiskFans.toString(),
          change: 'à action',
          icon: 'AlertCircle',
          color: 'text-red-400',
        },
      ],
      recentActivity,
      upcomingPosts,
      connections,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
