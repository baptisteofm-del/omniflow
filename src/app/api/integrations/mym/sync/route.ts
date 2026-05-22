import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConversations, getMessages } from '@/lib/platforms/mym'

// Sentiment analysis: simple word-based approach
const NEGATIVE_WORDS = ['cancel', 'refund', 'scam', 'fake', 'disappointed', 'unsubscribe', 'waste', 'boring']
const POSITIVE_WORDS = ['love', 'amazing', 'worth', 'best', '❤️', '🔥', '💕', 'perfect', 'excellent']

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase()
  
  let positiveCount = 0
  let negativeCount = 0

  POSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) positiveCount++
  })

  NEGATIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) negativeCount++
  })

  if (negativeCount > positiveCount) return 'negative'
  if (positiveCount > negativeCount) return 'positive'
  return 'neutral'
}

function getRiskLevel(sentiment: string): 'low' | 'medium' | 'high' {
  if (sentiment === 'negative') return 'high'
  if (sentiment === 'positive') return 'low'
  return 'medium'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get MYM credentials
    const { data: integration } = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('tool', 'mym')
      .single()

    if (!integration) {
      return NextResponse.json({ error: 'MYM not connected' }, { status: 404 })
    }

    const bearerToken = integration.api_key

    try {
      // Fetch conversations
      const conversations = await getConversations({ bearerToken })
      
      // Sync each conversation
      for (const conv of conversations) {
        const messages = await getMessages({ bearerToken }, conv.id)
        const lastMessage = messages[0]?.text || conv.lastMessage

        const sentiment = analyzeSentiment(lastMessage)
        const riskLevel = getRiskLevel(sentiment)

        // Upsert fan interaction
        await supabase.from('fan_interactions').upsert(
          {
            agency_id: agency.id,
            platform: 'mym',
            fan_id: conv.userId,
            fan_name: conv.userName,
            last_message: lastMessage,
            sentiment,
            risk_level: riskLevel,
            last_interaction_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'agency_id,platform,fan_id' }
        )
      }

      return NextResponse.json({
        success: true,
        synced: conversations.length,
        message: `${conversations.length} fans synchronisés depuis MYM`,
      })
    } catch (err) {
      throw new Error(`MYM sync error: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  } catch (error) {
    console.error('MYM sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
