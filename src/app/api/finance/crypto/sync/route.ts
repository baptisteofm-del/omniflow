import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTransactionHistory } from '@/lib/platforms/binance'
import { getTransactions as getCoinbaseTransactions, getAccounts } from '@/lib/platforms/coinbase'

/**
 * Get EUR exchange rate for cryptocurrencies (using free CoinGecko API)
 */
async function getExchangeRate(currency: string): Promise<number> {
  try {
    // Map common crypto symbols to CoinGecko IDs
    const coinGeckoIds: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'BNB': 'binancecoin',
    }

    const coinId = coinGeckoIds[currency] || currency.toLowerCase()

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!res.ok) {
      console.warn(`Could not fetch rate for ${currency}`)
      return 0
    }

    const data = await res.json()
    return data[coinId]?.eur || 0
  } catch (error) {
    console.error(`Error fetching exchange rate for ${currency}:`, error)
    return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    let syncedCount = 0
    const errors: string[] = []

    // Sync Binance transactions
    const binanceIntegration = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('tool', 'binance')
      .single()

    if (binanceIntegration.data) {
      try {
        const creds = JSON.parse(binanceIntegration.data.api_key)
        const transactions = await getTransactionHistory(creds, 90)

        for (const txn of transactions) {
          const exchangeRate = await getExchangeRate(txn.asset)
          const amountEur = txn.amount * exchangeRate

          // Determine transaction type
          let category = 'crypto_transfer'
          let type: 'income' | 'expense' = txn.type === 'deposit' ? 'income' : 'expense'

          // Upsert transaction
          await supabase.from('transactions').upsert(
            {
              agency_id: agency.id,
              type: txn.type,
              amount: amountEur,
              currency: 'EUR',
              category,
              description: `${type === 'income' ? 'Dépôt' : 'Retrait'} ${txn.asset} via Binance`,
              platform: 'binance',
              date: txn.timestamp.split('T')[0],
            },
            {
              onConflict: 'agency_id,platform,date,type,amount',
            }
          )

          syncedCount++
        }
      } catch (err) {
        errors.push(`Binance: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Sync Coinbase transactions
    const coinbaseIntegration = await supabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('tool', 'coinbase')
      .single()

    if (coinbaseIntegration.data) {
      try {
        const accounts = await getAccounts({ apiKey: coinbaseIntegration.data.api_key })

        for (const account of accounts) {
          const transactions = await getCoinbaseTransactions(
            { apiKey: coinbaseIntegration.data.api_key },
            account.id
          )

          for (const txn of transactions) {
            const exchangeRate = await getExchangeRate(txn.currency)
            const amountUsd = parseFloat(txn.amount)
            const amountEur = amountUsd * exchangeRate // Assuming amount is in USD

            // Determine category
            let category = 'crypto_transfer'
            if (txn.type.includes('send')) category = 'crypto_send'
            if (txn.type.includes('receive')) category = 'crypto_receive'

            // Upsert transaction
            await supabase.from('transactions').upsert(
              {
                agency_id: agency.id,
                type: txn.type,
                amount: amountEur,
                currency: 'EUR',
                category,
                description: `${txn.description || txn.type} (${txn.currency}) via Coinbase`,
                platform: 'coinbase',
                date: new Date(txn.createdAt).toISOString().split('T')[0],
              },
              {
                onConflict: 'agency_id,platform,date,type,amount',
              }
            )

            syncedCount++
          }
        }
      } catch (err) {
        errors.push(`Coinbase: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      synced: syncedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: syncedCount > 0
        ? `${syncedCount} transactions crypto synchronisées`
        : 'Aucune transaction à synchroniser',
    })
  } catch (error) {
    console.error('Crypto sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
