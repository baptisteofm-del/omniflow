import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loginAndGetToken, getNewMessages, sendMessage } from '@/lib/platforms/mym'
import { generateResponse } from '@/lib/ai/chatting'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'
import { isAIActiveNow } from '@/lib/chatting/schedule'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Cron job that runs every 5 minutes to:
 * 1. Fetch new messages from MYM
 * 2. Generate AI responses
 * 3. In auto mode: send immediately
 * 4. In supervised mode: queue for approval
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const processed = []
  const errors = []

  try {
    // 1. Get all models with auto_mode enabled
    const { data: personalities } = await supabase
      .from('model_personalities')
      .select('model_id, agency_id, auto_mode, personality_type, communication_style, example_messages, languages, topics_to_avoid, tips_strategy, response_delay_seconds, schedule_enabled, schedule')
      .eq('auto_mode', true)

    if (!personalities || personalities.length === 0) {
      return NextResponse.json({ message: 'No active models', processed: 0 })
    }

    for (const personality of personalities) {
      try {
        // Verify schedule
        const scheduleActive = isAIActiveNow(
          personality.schedule as any,
          personality.schedule_enabled || false
        )
        if (!scheduleActive) continue

        // Get MYM credentials for this model
        const { data: integration } = await supabase
          .from('agency_integrations')
          .select('api_key')
          .eq('agency_id', personality.agency_id)
          .eq('model_id', personality.model_id)
          .eq('tool', 'mym')
          .eq('is_active', true)
          .single()

        if (!integration) continue

        // Decrypt and get bearer token
        let creds: Record<string, string> = {}
        try {
          creds = JSON.parse(integration.api_key)
          creds = decryptIntegrationData('mym', creds)
        } catch { continue }

        let bearerToken = creds.api_key || ''
        if (!bearerToken && creds.email && creds.password) {
          bearerToken = await loginAndGetToken(creds.email, creds.password)
        }
        if (!bearerToken) continue

        // Fetch new messages
        const newMessages = await getNewMessages({ bearerToken })

        for (const msg of newMessages) {
          try {
            if (!msg.message?.trim()) continue

            // Check if already responded recently (avoid duplicates)
            const { data: recent } = await supabase
              .from('ai_messages')
              .select('id')
              .eq('agency_id', personality.agency_id)
              .eq('model_id', personality.model_id)
              .eq('platform', 'mym')
              .gte('sent_at', new Date(Date.now() - 60000).toISOString())
              .limit(1)

            if (recent && recent.length > 0) continue

            // Generate AI response
            const { response } = await generateResponse(
              {
                fanName: msg.fanName || 'Fan',
                conversationSummary: '',
                recentMessages: [{ role: 'fan', content: msg.message }],
                engagementLevel: 'warm',
                totalSpent: 0,
              },
              {
                displayName: personality.personality_type,
                personalityType: personality.personality_type,
                communicationStyle: personality.communication_style || '',
                exampleMessages: personality.example_messages || [],
                languages: personality.languages || ['fr'],
                topicsToAvoid: personality.topics_to_avoid || [],
                ppvPriceRange: '',
                tipsStrategy: personality.tips_strategy || '',
              },
              msg.message,
              []
            )

            if (!response?.trim()) continue

            // Send via MYM
            const sent = await sendMessage({ bearerToken }, msg.conversationId, response)

            // Save to ai_messages
            await supabase.from('ai_messages').insert({
              agency_id: personality.agency_id,
              model_id: personality.model_id,
              platform: 'mym',
              direction: 'outgoing',
              content: response,
              ai_generated: true,
              approved: sent ? true : null,
              sent_at: sent ? new Date().toISOString() : null,
            })

            processed.push({ model: personality.model_id, fan: msg.fanName, sent })
          } catch (msgErr) {
            errors.push(`Message error: ${msgErr}`)
          }
        }
      } catch (modelErr) {
        errors.push(`Model error: ${modelErr}`)
      }
    }

    return NextResponse.json({ success: true, processed: processed.length, errors })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
