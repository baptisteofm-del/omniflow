import { NextRequest, NextResponse } from 'next/server'
import { getChats } from '@/lib/platforms/onlyfans'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { logAudit } from '@/lib/security/audit'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting: max 3 test attempts per minute per IP
    if (!checkRateLimit(`onlyfans-test:${ip}`, 3, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    
    // Decrypt sensitive fields
    const decrypted = decryptIntegrationData('onlyfans', body)
    const { userId, authId, sess, bcTokens, userAgent } = decrypted

    if (!userId || !authId || !sess || !bcTokens) {
      return NextResponse.json(
        { error: 'Missing required OnlyFans credentials' },
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
      // Try to fetch chats to verify credentials work
      await getChats({
        userId,
        authId,
        sess,
        bcTokens,
        userAgent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }, 1)
      isConnected = true
    } catch (err) {
      const message = `Erreur OnlyFans: ${err instanceof Error ? err.message : 'Unknown error'}`
      
      // Log failed test
      await logAudit({
        agencyId,
        action: 'integration.tested',
        resource: 'onlyfans',
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
      resource: 'onlyfans',
      ip,
      success: true,
      metadata: { result: 'success' }
    })

    return NextResponse.json({
      success: true,
      connected: true,
      message: 'OnlyFans connecté avec succès',
    })
  } catch (error) {
    console.error('OnlyFans test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
