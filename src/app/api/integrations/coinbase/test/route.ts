import { NextRequest, NextResponse } from 'next/server'
import { getAccounts } from '@/lib/platforms/coinbase'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: max 3 test attempts per minute per IP
    if (!checkRateLimit(`coinbase-test:${ip}`, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    
    // Decrypt sensitive fields
    const decrypted = decryptIntegrationData('coinbase', body)
    const { api_key } = decrypted

    if (!api_key) {
      return NextResponse.json(
        { error: 'Missing Coinbase API key' },
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
      // Try to fetch accounts to verify credentials work
      const accounts = await getAccounts({ apiKey: api_key })
      isConnected = true

      // Log successful test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'coinbase',
        ip,
        success: true,
        metadata: { result: 'success', accountCount: accounts.length }
      })

      return NextResponse.json({
        success: true,
        connected: true,
        message: `Coinbase connecté avec succès. ${accounts.length} compte(s) trouvé(s)`,
        data: { accountCount: accounts.length },
      })
    } catch (err) {
      const message = `Erreur Coinbase: ${err instanceof Error ? err.message : 'Unknown error'}`
      
      // Log failed test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'coinbase',
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
  } catch (error) {
    console.error('Coinbase test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
