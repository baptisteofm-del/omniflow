import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cron job that runs every 2 minutes to:
 * 1. Fetch new messages from OnlyFans/MYM
 * 2. Generate AI responses
 * 3. In auto mode: send immediately
 * 4. In supervised mode: queue for approval
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('authorization')
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all agencies with active chatting AI
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id')
      .eq('subscription_status', 'active')

    if (!agencies) {
      return NextResponse.json({ processed: 0 })
    }

    let totalProcessed = 0

    for (const agency of agencies) {
      // Get models with auto_mode enabled
      const { data: personalities } = await supabase
        .from('model_personalities')
        .select('model_id, auto_mode, response_delay_seconds')
        .eq('agency_id', agency.id)
        .eq('auto_mode', true)

      if (!personalities) continue

      for (const personality of personalities) {
        // TODO: Fetch new messages from OF/MYM API
        // For each incoming message:
        // 1. Get fan profile
        // 2. Generate response
        // 3. Save and optionally send

        totalProcessed++
      }
    }

    return NextResponse.json({ processed: totalProcessed })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json({ error: 'Cron job failed', details: error }, { status: 500 })
  }
}
