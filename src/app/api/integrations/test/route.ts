import { NextRequest, NextResponse } from 'next/server'
import { listProfiles as adsPowerListProfiles } from '@/lib/posting/adspower'
import { listProfiles as geelarkListProfiles } from '@/lib/posting/geelark'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool, api_key, api_url } = body

    if (!tool || !api_key) {
      return NextResponse.json(
        { error: 'Missing required fields: tool, api_key' },
        { status: 400 }
      )
    }

    let isConnected = false
    let message = ''

    if (tool === 'adspower') {
      if (!api_url) {
        return NextResponse.json(
          { error: 'AdsPower requires api_url' },
          { status: 400 }
        )
      }

      try {
        await adsPowerListProfiles(api_key, api_url, 0, 1)
        isConnected = true
        message = 'AdsPower connecté avec succès'
      } catch (err) {
        message = `Erreur AdsPower: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'geelark') {
      try {
        await geelarkListProfiles(api_key)
        isConnected = true
        message = 'GeeLark connecté avec succès'
      } catch (err) {
        message = `Erreur GeeLark: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'telegram') {
      try {
        const res = await fetch('https://api.telegram.org/bot' + api_key + '/getMe', {
          method: 'POST',
        })
        const data = await res.json()
        if (data.ok) {
          isConnected = true
          message = `Telegram connecté: @${data.result.username}`
        } else {
          message = `Erreur Telegram: ${data.description}`
        }
      } catch (err) {
        message = `Erreur Telegram: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    }

    return NextResponse.json({
      success: isConnected,
      connected: isConnected,
      message,
    })
  } catch (error) {
    console.error('Integration test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    )
  }
}
