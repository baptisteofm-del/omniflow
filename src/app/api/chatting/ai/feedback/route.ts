import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/chatting/ai/feedback
 * Submit feedback on an AI-generated message
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      messageId,
      action, // 'validate' | 'correct' | 'reject'
      correction, // corrected text (for action='correct')
      reason, // why it was corrected
    } = await request.json()

    // Validate inputs
    if (!messageId || !['validate', 'correct', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Get the message with its context
    const { data: message, error: msgError } = await supabase
      .from('ai_messages')
      .select('id, agency_id, model_id, fan_profile_id, content, direction')
      .eq('id', messageId)
      .single()

    if (msgError || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Get fan profile for context
    const { data: fanProfile } = await supabase
      .from('fan_profiles')
      .select('fan_name')
      .eq('id', message.fan_profile_id)
      .single()

    // Save feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('chatting_feedback')
      .insert({
        agency_id: message.agency_id,
        message_id: messageId,
        model_id: message.model_id,
        action,
        original_message: message.content,
        corrected_message: action === 'correct' ? correction : null,
        reason: action === 'correct' ? reason : null,
        fan_message: fanProfile?.fan_name || null,
      })
      .select('*')

    if (feedbackError) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    // Update message approval status
    if (action === 'validate' || action === 'correct') {
      await supabase
        .from('ai_messages')
        .update({ approved: true })
        .eq('id', messageId)
    } else if (action === 'reject') {
      await supabase
        .from('ai_messages')
        .update({ approved: false })
        .eq('id', messageId)
    }

    return NextResponse.json({
      success: true,
      feedback: feedback?.[0],
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/chatting/ai/feedback?modelId=xxx
 * Get recent feedbacks for an agency's model
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json({ error: 'modelId required' }, { status: 400 })
    }

    // Fetch recent feedback for this model
    // Limited to 'correct' actions (successful corrections)
    const { data: feedbacks, error } = await supabase
      .from('chatting_feedback')
      .select('*')
      .eq('model_id', modelId)
      .eq('action', 'correct')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }

    return NextResponse.json({
      feedbacks: feedbacks || [],
      count: feedbacks?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
