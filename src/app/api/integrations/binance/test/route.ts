import { NextRequest, NextResponse } from 'next/server'
import { getUSDTBalance } from '@/lib/platforms/binance'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: max 3 test attempts per minute per IP
    if (!checkRateLimit(`binance-test:${ip}`, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    
    // Decrypt sensitive fields
    const decrypted = decryptIntegrationData('binance', body)
    const { api_key, secret_key } = decrypted

    if (!api_key || !secret_key) {
      return NextResponse.json(
        { error: 'Missing Binance API credentials' },
        { status: 400 }
      )
    }

    // Get user and agency for audit logging
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let agencyId: string | undefined
    let isConnected = false

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single()
      agencyId = profile?.agency_id
    }

    try {
      // Try to fetch USDT balance to verify credentials work
      const usdtBalance = await getUSDTBalance({
        apiKey: api_key,
        secretKey: secret_key,
      })
      isConnected = true

      // Log successful test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'binance',
        ip,
        success: true,
        metadata: { result: 'success', usdtBalance }
      })

      return NextResponse.json({
        success: true,
        connected: true,
        message: `Binance connecté avec succès. Solde USDT: ${usdtBalance}`,
        data: { usdtBalance },
      })
    } catch (err) {
      const message = `Erreur Binance: ${err instanceof Error ? err.message : 'Unknown error'}`
      
      // Log failed test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'binance',
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
    console.error('Binance test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
