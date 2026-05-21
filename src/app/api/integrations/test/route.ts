import { NextRequest, NextResponse } from 'next/server'
import { listProfiles as adsPowerListProfiles } from '@/lib/posting/adspower'
import { listProfiles as geelarkListProfiles } from '@/lib/posting/geelark'
import { getChats as getOFChats } from '@/lib/platforms/onlyfans'
import { getConversations as getMYMConversations } from '@/lib/platforms/mym'
import { getUSDTBalance } from '@/lib/platforms/binance'
import { getAccounts as getCoinbaseAccounts } from '@/lib/platforms/coinbase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool } = body

    if (!tool) {
      return NextResponse.json(
        { error: 'Missing required field: tool' },
        { status: 400 }
      )
    }

    let isConnected = false
    let message = ''

    if (tool === 'adspower') {
      const { api_key, api_url } = body
      if (!api_key || !api_url) {
        return NextResponse.json(
          { error: 'AdsPower requires api_key and api_url' },
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
      const { api_key } = body
      if (!api_key) {
        return NextResponse.json(
          { error: 'GeeLark requires api_key' },
          { status: 400 }
        )
      }

      try {
        await geelarkListProfiles(api_key)
        isConnected = true
        message = 'GeeLark connecté avec succès'
      } catch (err) {
        message = `Erreur GeeLark: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'telegram') {
      const { api_key } = body
      if (!api_key) {
        return NextResponse.json(
          { error: 'Telegram requires api_key' },
          { status: 400 }
        )
      }

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
    } else if (tool === 'onlyfans') {
      const { userId, authId, sess, bcTokens, userAgent } = body
      if (!userId || !authId || !sess || !bcTokens) {
        return NextResponse.json(
          { error: 'OnlyFans requires userId, authId, sess, bcTokens' },
          { status: 400 }
        )
      }

      try {
        await getOFChats({
          userId,
          authId,
          sess,
          bcTokens,
          userAgent: userAgent || 'Mozilla/5.0',
        }, 1)
        isConnected = true
        message = 'OnlyFans connecté avec succès'
      } catch (err) {
        message = `Erreur OnlyFans: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'mym') {
      const { api_key } = body
      if (!api_key) {
        return NextResponse.json(
          { error: 'MYM requires api_key' },
          { status: 400 }
        )
      }

      try {
        await getMYMConversations({ bearerToken: api_key }, 1)
        isConnected = true
        message = 'MYM.fans connecté avec succès'
      } catch (err) {
        message = `Erreur MYM: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'binance') {
      const { api_key, secret_key } = body
      if (!api_key || !secret_key) {
        return NextResponse.json(
          { error: 'Binance requires api_key and secret_key' },
          { status: 400 }
        )
      }

      try {
        const balance = await getUSDTBalance({
          apiKey: api_key,
          secretKey: secret_key,
        })
        isConnected = true
        message = `Binance connecté avec succès. Solde USDT: ${balance}`
      } catch (err) {
        message = `Erreur Binance: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    } else if (tool === 'coinbase') {
      const { api_key } = body
      if (!api_key) {
        return NextResponse.json(
          { error: 'Coinbase requires api_key' },
          { status: 400 }
        )
      }

      try {
        const accounts = await getCoinbaseAccounts({ apiKey: api_key })
        isConnected = true
        message = `Coinbase connecté avec succès. ${accounts.length} compte(s) trouvé(s)`
      } catch (err) {
        message = `Erreur Coinbase: ${err instanceof Error ? err.message : 'Unknown error'}`
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
