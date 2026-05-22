import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { loginAndGetToken, getConversations, getMessages } from '@/lib/platforms/mym'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SyncConversationsRequest {
  modelId: string
}

interface SyncConversationsResponse {
  success: boolean
  conversationsAnalyzed: number
  feedbackSaved: number
  learnings: string[]
  error?: string
}

/**
 * POST /api/chatting/ai/sync-conversations
 * Sync and analyze conversations from MYM.fans
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modelId } = (await request.json()) as SyncConversationsRequest

    if (!modelId) {
      return NextResponse.json({ error: 'Missing modelId' }, { status: 400 })
    }

    // Get model details
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id, name, agency_id')
      .eq('id', modelId)
      .single()

    if (modelError || !model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Get MYM credentials from agency_integrations
    const { data: integration, error: integError } = await supabase
      .from('agency_integrations')
      .select('api_key, api_url')
      .eq('agency_id', model.agency_id)
      .eq('tool', 'mym')
      .single()

    if (integError || !integration) {
      return NextResponse.json(
        { error: 'MYM integration not configured for this agency' },
        { status: 400 }
      )
    }

    // The API key should contain email:password or be decrypted
    // For now, assume it's stored as email:password
    const [email, password] = integration.api_key.split(':')

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            'Invalid MYM credentials format. Expected email:password',
        },
        { status: 400 }
      )
    }

    // Login to MYM and get token
    let bearerToken: string
    try {
      bearerToken = await loginAndGetToken(email, password)
    } catch (loginError) {
      return NextResponse.json(
        {
          error: `MYM login failed: ${loginError instanceof Error ? loginError.message : 'Unknown error'}`,
        },
        { status: 401 }
      )
    }

    // Get conversations (limit 20 as per spec)
    const conversations = await getConversations(
      { bearerToken },
      20,
      0
    )

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        success: true,
        conversationsAnalyzed: 0,
        feedbackSaved: 0,
        learnings: ['No conversations found to analyze'],
      })
    }

    let totalFeedbackSaved = 0
    const learnings: string[] = []

    // For each conversation, get messages and prepare for analysis
    for (const conversation of conversations) {
      try {
        const messages = await getMessages(
          { bearerToken },
          conversation.id,
          100
        )

        if (!messages || messages.length === 0) {
          continue
        }

        // Format conversation for analysis
        const conversationText = messages
          .map((msg) => {
            // Alternate between Fan and Chatter based on userId
            const role = msg.userId === model.id ? 'Chatter' : 'Fan'
            return `${role}: ${msg.text}`
          })
          .join('\n')

        // Call the analyze endpoint
        const analyzeRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chatting/ai/analyze`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `auth-token=${token}`,
            },
            body: JSON.stringify({
              conversation: conversationText,
              modelId: modelId,
              platform: 'mym',
            }),
          }
        )

        if (!analyzeRes.ok) {
          console.error(
            `Failed to analyze conversation ${conversation.id}:`,
            await analyzeRes.text()
          )
          learnings.push(
            `Failed to analyze conversation with ${conversation.userName}`
          )
          continue
        }

        const analysisResult = await analyzeRes.json()

        // Count saved feedback
        if (analysisResult.feedbackExamplesSaved) {
          totalFeedbackSaved += analysisResult.feedbackExamplesSaved
        }

        learnings.push(
          `Analyzed conversation with ${conversation.userName}: ${analysisResult.feedbackExamplesSaved || 0} feedback examples saved`
        )
      } catch (convError) {
        console.error(
          `Error processing conversation ${conversation.id}:`,
          convError
        )
        learnings.push(
          `Error processing conversation: ${convError instanceof Error ? convError.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      conversationsAnalyzed: conversations.length,
      feedbackSaved: totalFeedbackSaved,
      learnings,
    })
  } catch (error) {
    console.error('Error syncing conversations:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
