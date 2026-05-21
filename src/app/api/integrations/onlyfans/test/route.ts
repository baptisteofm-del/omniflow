import { NextRequest, NextResponse } from 'next/server'
import { getChats } from '@/lib/platforms/onlyfans'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, authId, sess, bcTokens, userAgent } = body

    if (!userId || !authId || !sess || !bcTokens) {
      return NextResponse.json(
        { error: 'Missing required OnlyFans credentials' },
        { status: 400 }
      )
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

      return NextResponse.json({
        success: true,
        connected: true,
        message: 'OnlyFans connecté avec succès',
      })
    } catch (err) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: `Erreur OnlyFans: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }, { status: 400 })
    }
  } catch (error) {
    console.error('OnlyFans test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
