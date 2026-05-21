import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { weeklyReportTemplate } from '@/lib/email/templates'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all agencies with active subscriptions
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('id, name, owner_id, subscription_status')
      .eq('subscription_status', 'active')

    if (agenciesError) {
      console.error('[Weekly Report] Error fetching agencies:', agenciesError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!agencies || agencies.length === 0) {
      return NextResponse.json({ success: true, message: 'No active agencies' })
    }

    const results = []

    // Process each agency
    for (const agency of agencies) {
      try {
        // Calculate week dates (last 7 days)
        const now = new Date()
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Fetch posts published this week
        const { data: posts, error: postsError } = await supabase
          .from('scheduled_posts')
          .select('id')
          .eq('agency_id', agency.id)
          .gte('created_at', lastWeek.toISOString())
          .eq('status', 'published')

        const postsPublished = posts?.length || 0

        // Fetch revenue from transactions (OnlyFans earnings)
        const { data: transactions, error: transError } = await supabase
          .from('finance_transactions')
          .select('amount')
          .eq('agency_id', agency.id)
          .gte('created_at', lastWeek.toISOString())
          .eq('type', 'earnings')

        const revenue = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

        // Fetch new fans from fan_interactions
        const { data: fanInteractions, error: fansError } = await supabase
          .from('fan_interactions')
          .select('id')
          .eq('agency_id', agency.id)
          .gte('created_at', lastWeek.toISOString())
          .eq('interaction_type', 'new_follow')

        const newFans = fanInteractions?.length || 0

        // Fetch AI generations
        const { data: aiGenerated, error: aiError } = await supabase
          .from('generated_content')
          .select('id')
          .eq('agency_id', agency.id)
          .gte('created_at', lastWeek.toISOString())

        const aiGenerations = aiGenerated?.length || 0

        // Fetch fans at risk (no activity for 14+ days)
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        const { data: riskFans, error: riskError } = await supabase
          .from('fan_interactions')
          .select('fan_id')
          .eq('agency_id', agency.id)
          .lt('created_at', twoWeeksAgo.toISOString())

        // Count unique fans at risk
        const uniqueRiskFans = new Set(riskFans?.map((f: any) => f.fan_id) || [])
        const riskCount = uniqueRiskFans.size

        // Get previous week revenue for comparison
        const twoWeeksAgo2 = new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
        const { data: prevTransactions } = await supabase
          .from('finance_transactions')
          .select('amount')
          .eq('agency_id', agency.id)
          .gte('created_at', twoWeeksAgo2.toISOString())
          .lt('created_at', lastWeek.toISOString())
          .eq('type', 'earnings')

        const previousRevenue = prevTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

        // Get owner email
        const { data: user } = await supabase.auth.admin.getUserById(agency.owner_id)

        if (!user?.user?.email) {
          console.warn(`[Weekly Report] No email for agency ${agency.id}`)
          continue
        }

        // Generate email from template
        const emailTemplate = weeklyReportTemplate(agency.name, {
          postsPublished,
          revenue,
          newFans,
          aiGenerations,
          riskFans: riskCount,
          previousRevenue,
        })

        // Send email via Resend
        const resend = getResend()
        const emailResponse = await resend.emails.send({
          from: 'OmniFlow <reports@omniflowapp.ai>',
          to: user.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        })

        results.push({
          agencyId: agency.id,
          agencyName: agency.name,
          email: user.user.email,
          success: emailResponse.error === undefined,
          error: emailResponse.error?.message || null,
          stats: {
            postsPublished,
            revenue,
            newFans,
            aiGenerations,
            riskFans: riskCount,
          },
        })

        console.log(`[Weekly Report] Sent report for ${agency.name} to ${user.user.email}`)
      } catch (error) {
        console.error(`[Weekly Report] Error processing agency ${agency.id}:`, error)
        results.push({
          agencyId: agency.id,
          agencyName: agency.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('[Weekly Report] Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // For testing: allow GET request to trigger the weekly report
  // In production, this should be restricted or removed
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Simple token check - use proper secret in production
  const token = authHeader.substring(7)
  if (token !== process.env.WEEKLY_REPORT_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Call POST handler
  return POST(req)
}
