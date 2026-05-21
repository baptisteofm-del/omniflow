import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // Get integrations
    const { data: integrations, error } = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', profile.agency_id)

    if (error) throw error

    return NextResponse.json({ integrations })
  } catch (error) {
    console.error('Integrations error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
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

    const body = await request.json()
    const { tool, api_key, api_url, is_active } = body

    if (!tool || !api_key) {
      return NextResponse.json(
        { error: 'Missing required fields: tool, api_key' },
        { status: 400 }
      )
    }

    // Store all fields as JSON in api_key for complex integrations
    let storedKey = api_key
    if (tool === 'onlyfans' || tool === 'binance' || tool === 'coinbase') {
      // For complex credentials, store the entire object as JSON
      storedKey = JSON.stringify(body)
    }

    // Upsert integration
    const { data: integration, error } = await supabase
      .from('agency_integrations')
      .upsert(
        {
          agency_id: profile.agency_id,
          tool,
          api_key: storedKey,
          api_url: api_url || null,
          is_active: is_active !== false,
        },
        { onConflict: 'agency_id,tool' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        api_key: '***' // Never return the key
      }
    })
  } catch (error) {
    console.error('Integration save error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save integration' },
      { status: 500 }
    )
  }
}
