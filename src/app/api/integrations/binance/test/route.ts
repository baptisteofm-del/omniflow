import { NextRequest, NextResponse } from 'next/server'
import { getUSDTBalance } from '@/lib/platforms/binance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { api_key, secret_key } = body

    if (!api_key || !secret_key) {
      return NextResponse.json(
        { error: 'Missing Binance API credentials' },
        { status: 400 }
      )
    }

    try {
      // Try to fetch USDT balance to verify credentials work
      const usdtBalance = await getUSDTBalance({
        apiKey: api_key,
        secretKey: secret_key,
      })

      return NextResponse.json({
        success: true,
        connected: true,
        message: `Binance connecté avec succès. Solde USDT: ${usdtBalance}`,
        data: { usdtBalance },
      })
    } catch (err) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: `Erreur Binance: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
