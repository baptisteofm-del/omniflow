import { NextRequest, NextResponse } from 'next/server'
import { getConversations } from '@/lib/platforms/mym'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key } = body

    if (!api_key) {
      return NextResponse.json(
        { error: 'Missing MYM API key' },
        { status: 400 }
      )
    }

    try {
      // Try to fetch conversations to verify credentials work
      await getConversations({ bearerToken: api_key }, 1)

      return NextResponse.json({
        success: true,
        connected: true,
        message: 'MYM.fans connecté avec succès',
      })
    } catch (err) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: `Erreur MYM: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }, { status: 400 })
    }
  } catch (error) {
    console.error('MYM test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
