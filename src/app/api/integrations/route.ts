import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit'
import { encryptIntegrationData, decryptIntegrationData } from '@/lib/crypto/sensitive-fields'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
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

    // Get integrations
    const { data: integrations, error } = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)

    if (error) throw error

    // Decrypt sensitive fields for response
    const decryptedIntegrations = integrations?.map(integration => ({
      ...integration,
      ...(integration.api_key && decryptIntegrationData(integration.tool, { api_key: integration.api_key }))
    })) || []

    return NextResponse.json({ integrations: decryptedIntegrations })
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
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: max 5 integrations changes per minute per IP
    if (!checkRateLimit(`integration:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

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
    const { tool, api_key, api_url, is_active } = body

    if (!tool || !api_key) {
      return NextResponse.json(
        { error: 'Missing required fields: tool, api_key' },
        { status: 400 }
      )
    }

    // Encrypt sensitive fields
    let dataToStore = body
    if (tool === 'onlyfans' || tool === 'binance' || tool === 'coinbase' || tool === 'stripe' || tool === 'geelark' || tool === 'adspower') {
      // For complex credentials, encrypt each sensitive field
      dataToStore = encryptIntegrationData(tool, body)
    }

    // Store all fields as JSON in api_key for complex integrations
    let storedKey = dataToStore.api_key || api_key
    if (tool === 'onlyfans' || tool === 'binance' || tool === 'coinbase') {
      // For complex credentials, store the entire object as JSON (encrypted)
      storedKey = JSON.stringify(dataToStore)
    }

    // Upsert integration
    const { data: integration, error } = await supabase
      .from('agency_integrations')
      .upsert(
        {
          agency_id: agency.id,
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

    // Log the integration connection
    await logAudit({
      agencyId: agency.id,
      action: 'integration.connected',
      resource: tool,
      ip,
      success: true,
      metadata: { tool, timestamp: new Date().toISOString() }
    })

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
