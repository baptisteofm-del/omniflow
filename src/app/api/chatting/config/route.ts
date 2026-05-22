import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get agency ID from user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get config for both platforms
    const { data: configs, error: configError } = await supabase
      .from('chatting_list_config')
      .select('*')
      .eq('agency_id', agency.id)
      .in('platform', ['onlyfans', 'mym'])

    if (configError) {
      return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 })
    }

    const configMap = configs.reduce(
      (acc, config) => {
        acc[config.platform] = {
          id: config.id,
          platform: config.platform,
          personalityType: config.personality_type,
          ppvFrequency: config.ppv_frequency,
          ppvPriceMin: config.ppv_price_min,
          ppvPriceMax: config.ppv_price_max,
          relationalMode: config.relational_mode,
          toneNotes: config.tone_notes,
          responseDelaySeconds: config.response_delay_seconds,
        }
        return acc
      },
      {} as Record<string, any>
    )

    return NextResponse.json({
      onlyfans: configMap['onlyfans'] || null,
      mym: configMap['mym'] || null,
    })
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const {
      platform,
      personalityType,
      ppvFrequency,
      ppvPriceMin,
      ppvPriceMax,
      relationalMode,
      toneNotes,
      responseDelaySeconds,
    } = await request.json()

    if (!platform || !['onlyfans', 'mym'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Upsert config
    const { data: config, error: configError } = await supabase
      .from('chatting_list_config')
      .upsert(
        {
          agency_id: agency.id,
          platform,
          personality_type: personalityType,
          ppv_frequency: ppvFrequency,
          ppv_price_min: ppvPriceMin,
          ppv_price_max: ppvPriceMax,
          relational_mode: relationalMode,
          tone_notes: toneNotes,
          response_delay_seconds: responseDelaySeconds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'agency_id,platform' }
      )
      .select()
      .single()

    if (configError) {
      console.error('Config error:', configError)
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }

    return NextResponse.json({
      id: config.id,
      platform: config.platform,
      personalityType: config.personality_type,
      ppvFrequency: config.ppv_frequency,
      ppvPriceMin: config.ppv_price_min,
      ppvPriceMax: config.ppv_price_max,
      relationalMode: config.relational_mode,
      toneNotes: config.tone_notes,
      responseDelaySeconds: config.response_delay_seconds,
    })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
