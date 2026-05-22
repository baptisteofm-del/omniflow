import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateResponse } from '@/lib/ai/chatting'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      agencyId,
      modelId,
      fanId,
      platform,
      incomingMessage,
      mode, // 'auto' or 'supervised'
    } = await request.json()

    // Get fan profile
    const { data: fanProfile, error: fanError } = await supabase
      .from('fan_profiles')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('fan_id', fanId)
      .eq('platform', platform)
      .single()

    if (fanError) {
      return NextResponse.json({ error: 'Fan profile not found' }, { status: 404 })
    }

    // Get model personality
    const { data: personality, error: perError } = await supabase
      .from('model_personalities')
      .select('*')
      .eq('model_id', modelId)
      .single()

    if (perError) {
      return NextResponse.json({ error: 'Model personality not configured' }, { status: 400 })
    }

    // Get recent messages
    const { data: recentMessages } = await supabase
      .from('ai_messages')
      .select('direction, content')
      .eq('fan_profile_id', fanProfile.id)
      .order('sent_at', { ascending: false })
      .limit(10)

    // Get available scripts
    const { data: scripts } = await supabase
      .from('chat_scripts')
      .select('name, content, category')
      .eq('agency_id', agencyId)
      .eq('is_active', true)

    // Get recent agency feedbacks for this model
    const { data: feedbacks } = await supabase
      .from('chatting_feedback')
      .select('original_message, corrected_message, reason')
      .eq('agency_id', agencyId)
      .eq('model_id', modelId)
      .eq('action', 'correct')
      .order('created_at', { ascending: false })
      .limit(15)

    // Get list config for this platform
    const { data: listConfig } = await supabase
      .from('chatting_list_config')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('platform', platform)
      .single()

    // Get fan notes
    const { data: fanNotes } = await supabase
      .from('fan_notes')
      .select('note, category')
      .eq('fan_profile_id', fanProfile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Generate response
    const { response, upsellOpportunity } = await generateResponse(
      {
        fanName: fanProfile.fan_name || fanId,
        conversationSummary: fanProfile.conversation_summary || '',
        recentMessages: (recentMessages || []).map(m => ({
          role: m.direction === 'incoming' ? 'fan' : 'model',
          content: m.content,
        })),
        engagementLevel: fanProfile.engagement_level || 'cold',
        totalSpent: fanProfile.total_spent || 0,
        lastPurchaseAt: fanProfile.last_purchase_at,
      },
      {
        displayName: personality.display_name || '',
        personalityType: personality.personality_type || 'warm',
        communicationStyle: personality.communication_style || '',
        exampleMessages: personality.example_messages || [],
        languages: personality.languages || ['fr'],
        topicsToAvoid: personality.topics_to_avoid || [],
        ppvPriceRange: personality.ppv_price_range || '',
        tipsStrategy: personality.tips_strategy || '',
      },
      incomingMessage,
      (scripts || []).map(s => ({
        name: s.name,
        content: s.content,
        category: s.category,
      })),
      // Pass agency feedbacks for learning
      (feedbacks || []).map(f => ({
        original: f.original_message,
        corrected: f.corrected_message || '',
        reason: f.reason,
      })),
      // Pass list config
      listConfig ? {
        personalityType: listConfig.personality_type,
        ppvFrequency: listConfig.ppv_frequency,
        ppvPriceMin: listConfig.ppv_price_min,
        ppvPriceMax: listConfig.ppv_price_max,
        relationalMode: listConfig.relational_mode,
        toneNotes: listConfig.tone_notes,
      } : undefined,
      // Pass fan notes
      (fanNotes || []).map(n => ({
        note: n.note,
        category: n.category,
      }))
    )

    // Save message to database
    // Calculer send_after selon le délai configuré
    const delaySeconds = listConfig?.response_delay_seconds || (personality as Record<string, unknown> | null)?.response_delay_seconds as number || 60
    const sendAfter = new Date(Date.now() + delaySeconds * 1000).toISOString()

    const { data: messages, error: msgError } = await supabase.from('ai_messages').insert({
      agency_id: agencyId,
      model_id: modelId,
      fan_profile_id: fanProfile.id,
      platform: platform,
      direction: 'outgoing',
      content: response,
      ai_generated: true,
      approved: mode === 'auto' ? true : null,
      send_after: mode === 'auto' ? sendAfter : null,
    }).select('id')

    if (msgError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // If auto mode, send immediately
    if (mode === 'auto') {
      // TODO: Send via OF/MYM API
    }

    return NextResponse.json({
      response,
      messageId: messages && messages.length > 0 ? messages[0].id : undefined,
      upsellOpportunity,
      requiresApproval: mode === 'supervised',
    })
  } catch (error) {
    console.error('Error generating response:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
