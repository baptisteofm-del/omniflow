import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getChats, getMessages, getSubscribers } from '@/lib/platforms/onlyfans'

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get OnlyFans credentials
    const { data: integration } = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .eq('tool', 'onlyfans')
      .single()

    if (!integration) {
      return NextResponse.json({ error: 'OnlyFans not connected' }, { status: 404 })
    }

    const creds = JSON.parse(integration.api_key)

    try {
      // Fetch chats and messages
      const chats = await getChats(creds)
      
      // Sync each fan/chat
      for (const chat of chats) {
        const messages = await getMessages(creds, chat.userId)
        const lastMessage = messages[0]?.text || chat.lastMessage

        const sentiment = analyzeSentiment(lastMessage)
        const riskLevel = getRiskLevel(sentiment)

        // Upsert fan interaction
        await supabase.from('fan_interactions').upsert(
          {
            agency_id: profile.agency_id,
            platform: 'onlyfans',
            fan_id: chat.userId,
            fan_name: chat.userName,
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
        synced: chats.length,
        message: `${chats.length} fans synchronisés depuis OnlyFans`,
      })
    } catch (err) {
      throw new Error(`OnlyFans sync error: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  } catch (error) {
    console.error('OnlyFans sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
