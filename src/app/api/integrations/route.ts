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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const toolFilter = searchParams.get('tool')
    const isActive = searchParams.get('is_active')

    // Build query
    let query = supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)

    // Apply tool filter if provided (can be comma-separated for multiple)
    if (toolFilter) {
      const tools = toolFilter.split(',')
      query = query.in('tool', tools)
    }

    // Apply is_active filter if provided
    if (isActive !== null) {
      const isActiveBoolean = isActive === 'true'
      query = query.eq('is_active', isActiveBoolean)
    }

    const { data: integrations, error } = await query

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
    const { tool, api_key, api_url, is_active, email, password, model_id, ...rest } = body

    if (!tool) {
      return NextResponse.json(
        { error: 'Missing required field: tool' },
        { status: 400 }
      )
    }

    // MYM et OF utilisent email+password
    const usesEmailPassword = ['mym', 'onlyfans'].includes(tool) && email
    if (!usesEmailPassword && !api_key) {
      return NextResponse.json(
        { error: `${tool} required api_key` },
        { status: 400 }
      )
    }

    // Construire les données à stocker
    let dataToStore: Record<string, string> = {}
    if (usesEmailPassword) {
      dataToStore = { email, password, ...rest }
    } else {
      dataToStore = { api_key, ...rest }
    }

    // Chiffrer les champs sensibles
    dataToStore = encryptIntegrationData(tool, dataToStore)

    // Stocker en JSON dans api_key
    let storedKey = JSON.stringify(dataToStore)

    // OF et MYM sont par modèle, les autres sont par agence
    const isPerModel = ['onlyfans', 'mym'].includes(tool)
    const effectiveModelId = isPerModel ? (model_id || null) : null

    // Upsert integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .upsert(
        {
          agency_id: agency.id,
          tool,
          model_id: effectiveModelId,
          api_key: storedKey,
          api_url: api_url || null,
          is_active: is_active !== false,
        },
        { onConflict: 'agency_id,tool,model_id', ignoreDuplicates: false }
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
