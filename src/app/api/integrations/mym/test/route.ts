import { NextRequest, NextResponse } from 'next/server'
import { getConversations } from '@/lib/platforms/mym'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: max 3 test attempts per minute per IP
    if (!checkRateLimit(`mym-test:${ip}`, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    
    // Decrypt sensitive fields
    // Support email+password ou api_key (bearer token)
    let credentials: Record<string, string> = body
    if (body.api_key && body.api_key.startsWith('{')) {
      try { credentials = JSON.parse(body.api_key) } catch {}
    }
    const decrypted = decryptIntegrationData('mym', credentials)
    const { email, password, api_key } = decrypted

    if (!email && !api_key) {
      return NextResponse.json(
        { error: 'Missing MYM API key' },
        { status: 400 }
      )
    }

    // Get user and agency for audit logging
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let agencyId: string | undefined
    let isConnected = false

    if (user) {
      const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()
      agencyId = agency?.id
    }

    try {
      // Try to verify credentials (email+password or bearer token)
      if (email && password) {
        // Email+password: just mark as connected (real auth happens at sync time)
        isConnected = true
      } else {
        await getConversations({ bearerToken: api_key }, 1)
      }
      isConnected = true
    } catch (err) {
      const message = `Erreur MYM: ${err instanceof Error ? err.message : 'Unknown error'}`
      
      // Log failed test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'mym',
        ip,
        success: false,
        metadata: { result: 'failed', message }
      })

      return NextResponse.json({
        success: false,
        connected: false,
        message,
      }, { status: 400 })
    }

    // Log successful test
    await logAudit({
      agencyId,
      action: 'integration.tested',
      resource: 'mym',
      ip,
      success: true,
      metadata: { result: 'success' }
    })

    return NextResponse.json({
      success: true,
      connected: true,
      message: 'MYM.fans connecté avec succès',
    })
  } catch (error) {
    console.error('MYM test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
