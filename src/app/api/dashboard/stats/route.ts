import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get user's agency ID
    const { data: userData } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!userData?.agency_id) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const agencyId = userData.agency_id

    // Get agency name
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', agencyId)
      .single()

    // Check if agency has active integrations
    const { count: activeIntegrations } = await supabase
      .from('agency_integrations')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId)
      .eq('is_active', true)

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
    let activeModelsCount = 0
    try {
      const { data: models, error: modelsError } = await supabase
        .from('models')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('is_active', true)

      if (!modelsError) {
        activeModelsCount = models?.length || 0
      }
    } catch (e) {
      console.error('Error fetching active models:', e)
    }

    // 2. Posts this month count
    let postsThisMonth = 0
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: posts, error: postsError } = await supabase
        .from('scheduled_posts')
        .select('id')
        .eq('agency_id', agencyId)
        .gte('created_at', monthStart)

      if (!postsError) {
        postsThisMonth = posts?.length || 0
      }
    } catch (e) {
      console.error('Error fetching posts this month:', e)
    }

    // 3. Monthly revenue
    let monthlyRevenue = 0
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: transactions, error: txError } = await supabase
        .from('finance_transactions')
        .select('amount')
        .eq('agency_id', agencyId)
        .eq('type', 'income')
        .gte('created_at', monthStart)

      if (!txError && transactions) {
        monthlyRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      }
    } catch (e) {
      console.error('Error fetching revenue:', e)
    }

    // 4. Trends captured count
    let trendsCount = 0
    try {
      const { data: trends, error: trendsError } = await supabase
        .from('trends')
        .select('id')
        .eq('agency_id', agencyId)

      if (!trendsError) {
        trendsCount = trends?.length || 0
      }
    } catch (e) {
      console.error('Error fetching trends:', e)
    }

    // 5. AI messages this month
    let aiMessagesCount = 0
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: messages, error: messagesError } = await supabase
        .from('ai_messages')
        .select('id')
        .eq('agency_id', agencyId)
        .gte('created_at', monthStart)

      if (!messagesError) {
        aiMessagesCount = messages?.length || 0
      }
    } catch (e) {
      console.error('Error fetching AI messages:', e)
    }

    // 6. At-risk fans count
    let atRiskFans = 0
    try {
      const { data: fans, error: fansError } = await supabase
        .from('fan_profiles')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('engagement_level', 'at_risk')

      if (!fansError) {
        atRiskFans = fans?.length || 0
      }
    } catch (e) {
      console.error('Error fetching at-risk fans:', e)
    }

    // Fetch recent AI activity
    let recentActivity: any[] = []
    try {
      const { data: messages, error: activityError } = await supabase
        .from('ai_messages')
        .select('id, direction, content, model_id, sent_at')
        .eq('agency_id', agencyId)
        .order('sent_at', { ascending: false })
        .limit(4)

      if (!activityError && messages) {
        recentActivity = messages.map((msg: any) => ({
          id: msg.id,
          direction: msg.direction,
          content: msg.content ? msg.content.substring(0, 50) : '',
          model_id: msg.model_id,
          sent_at: msg.sent_at,
        }))
      }
    } catch (e) {
      console.error('Error fetching recent activity:', e)
    }

    // Fetch upcoming posts
    let upcomingPosts: any[] = []
    try {
      const now = new Date().toISOString()
      const { data: posts, error: upcomingError } = await supabase
        .from('scheduled_posts')
        .select('id, title, model_id, scheduled_at, platforms')
        .eq('agency_id', agencyId)
        .gt('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(3)

      if (!upcomingError && posts) {
        upcomingPosts = posts
      }
    } catch (e) {
      console.error('Error fetching upcoming posts:', e)
    }

    // Fetch integrations
    let connections: any[] = []
    try {
      const { data: integrations, error: intError } = await supabase
        .from('agency_integrations')
        .select('tool, is_active')
        .eq('agency_id', agencyId)

      if (!intError && integrations) {
        const toolsToDisplay = ['OnlyFans', 'MYM', 'AdsPower', 'GeeLark']
        const integrationMap = new Map(integrations.map((i: any) => [i.tool, i.is_active]))

        connections = toolsToDisplay.map((tool) => ({
          name: tool,
          status: integrationMap.get(tool) ? 'connected' : 'disconnected',
          color: integrationMap.get(tool) ? 'green' : 'red',
        }))
      }
    } catch (e) {
      console.error('Error fetching integrations:', e)
    }

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
