import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listProfiles as adsPowerListProfiles } from '@/lib/posting/adspower'
import { listProfiles as geelarkListProfiles } from '@/lib/posting/geelark'

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

    const body = await request.json()
    const { model_id, tool } = body

    if (!model_id || !tool) {
      return NextResponse.json(
        { error: 'Missing required fields: model_id, tool' },
        { status: 400 }
      )
    }

    // Get integration for this tool
    const { data: integration, error: integError } = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('tool', tool)
      .single()

    if (integError || !integration) {
      return NextResponse.json(
        { error: `No ${tool} integration found for your agency` },
        { status: 404 }
      )
    }

    let profiles: Array<{ id: string; name: string }> = []

    if (tool === 'adspower') {
      const adsPowerProfiles = await adsPowerListProfiles(
        integration.api_key,
        integration.api_url || 'http://local.adspower.net:50325'
      )
      profiles = adsPowerProfiles.map(p => ({
        id: p.id,
        name: p.name,
      }))
    } else if (tool === 'geelark') {
      const geelarkProfiles = await geelarkListProfiles(integration.api_key)
      profiles = geelarkProfiles.map(p => ({
        id: p.profileId,
        name: p.name,
      }))
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Import profiles error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import profiles' },
      { status: 500 }
    )
  }
}
