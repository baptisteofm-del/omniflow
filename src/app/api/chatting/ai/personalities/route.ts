import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('modelId')

    if (!modelId) {
      return NextResponse.json({ error: 'modelId required' }, { status: 400 })
    }

    const { data: personality, error } = await supabase
      .from('model_personalities')
      .select('*')
      .eq('model_id', modelId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ personality })
  } catch (error) {
    console.error('Error fetching personality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', auth.user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const {
      modelId,
      displayName,
      personalityType,
      communicationStyle,
      exampleMessages,
      languages,
      topicsToAvoid,
      ppvPriceRange,
      tipsStrategy,
      autoMode,
      responseDelay,
    } = await request.json()

    // Check if personality exists
    const { data: existing } = await supabase
      .from('model_personalities')
      .select('id')
      .eq('model_id', modelId)
      .single()

    if (existing) {
      // Update
      const { data: updated, error } = await supabase
        .from('model_personalities')
        .update({
          display_name: displayName,
          personality_type: personalityType,
          communication_style: communicationStyle,
          example_messages: exampleMessages,
          languages: languages,
          topics_to_avoid: topicsToAvoid,
          ppv_price_range: ppvPriceRange,
          tips_strategy: tipsStrategy,
          auto_mode: autoMode,
          response_delay_seconds: responseDelay || 60,
          updated_at: new Date().toISOString(),
        })
        .eq('model_id', modelId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ personality: updated?.[0] })
    } else {
      // Create
      const { data: created, error } = await supabase
        .from('model_personalities')
        .insert({
          model_id: modelId,
          agency_id: agency.id,
          display_name: displayName,
          personality_type: personalityType,
          communication_style: communicationStyle,
          example_messages: exampleMessages,
          languages: languages,
          topics_to_avoid: topicsToAvoid,
          ppv_price_range: ppvPriceRange,
          tips_strategy: tipsStrategy,
          auto_mode: autoMode,
          response_delay_seconds: responseDelay || 60,
        })
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ personality: created?.[0] })
    }
  } catch (error) {
    console.error('Error creating/updating personality:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
