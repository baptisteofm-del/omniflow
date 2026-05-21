import { NextRequest, NextResponse } from 'next/server'
import { getAccounts } from '@/lib/platforms/coinbase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key } = body

    if (!api_key) {
      return NextResponse.json(
        { error: 'Missing Coinbase API key' },
        { status: 400 }
      )
    }

    try {
      // Try to fetch accounts to verify credentials work
      const accounts = await getAccounts({ apiKey: api_key })

      return NextResponse.json({
        success: true,
        connected: true,
        message: `Coinbase connecté avec succès. ${accounts.length} compte(s) trouvé(s)`,
        data: { accountCount: accounts.length },
      })
    } catch (err) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: `Erreur Coinbase: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
