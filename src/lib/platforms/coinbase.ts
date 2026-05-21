/**
 * Coinbase API Integration (Read-only)
 * Uses Bearer token authentication
 */

export interface CoinbaseCredentials {
  apiKey: string
}

export interface CoinbaseAccount {
  id: string
  name: string
  currency: string
  balance: number
  available: number
}

export interface CoinbaseTransaction {
  id: string
  type: string
  amount: string
  currency: string
  description?: string
  createdAt: string
  status: string
}

/**
 * Build Coinbase API headers
 */
function buildCoinbaseHeaders(apiKey: string): Headers {
  return new Headers({
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    'CB-VERSION': '2015-04-08',
  })
}

/**
 * Get Coinbase accounts
 */
export async function getAccounts(
  creds: CoinbaseCredentials
): Promise<CoinbaseAccount[]> {
  try {
    const headers = buildCoinbaseHeaders(creds.apiKey)
    const url = 'https://api.coinbase.com/v2/accounts'

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.data || [])
      .filter((acc: any) => parseFloat(acc.balance?.amount || 0) > 0)
      .map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        currency: acc.balance?.currency,
        balance: parseFloat(acc.balance?.amount || 0),
        available: parseFloat(acc.available?.amount || 0),
      }))
  } catch (error) {
    console.error('Error fetching Coinbase accounts:', error)
    throw error
  }
}

/**
 * Get transactions for an account
 */
export async function getTransactions(
  creds: CoinbaseCredentials,
  accountId: string,
  limit: number = 100
): Promise<CoinbaseTransaction[]> {
  try {
    const headers = buildCoinbaseHeaders(creds.apiKey)
    const url = new URL(`https://api.coinbase.com/v2/accounts/${accountId}/transactions`)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.data || []).map((txn: any) => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount?.amount,
      currency: txn.amount?.currency,
      description: txn.description,
      createdAt: txn.created_at,
      status: txn.status,
    }))
  } catch (error) {
    console.error('Error fetching Coinbase transactions:', error)
    throw error
  }
}
