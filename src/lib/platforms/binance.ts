/**
 * Binance API Integration (Read-only)
 * Uses HMAC-SHA256 signature for secure authentication
 */

import crypto from 'crypto'

export interface BinanceCredentials {
  apiKey: string
  secretKey: string
}

export interface BinanceBalance {
  asset: string
  free: number
  locked: number
  total: number
}

export interface BinanceTransaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'trade'
  asset: string
  amount: number
  fee: number
  status: string
  timestamp: string
}

export interface BinanceDeposit {
  coin: string
  amount: number
  status: number // 0=pending, 1=success
  insertTime: string
  txId?: string
  address?: string
}

export interface BinanceWithdraw {
  coin: string
  amount: number
  status: number // 0=Email Sent, 1=Cancelled, 2=Awaiting Approval, etc.
  withdrawOrderId?: string
  applyTime: string
  txId?: string
  network?: string
}

/**
 * Generate HMAC-SHA256 signature for Binance API
 */
function generateSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex')
}

/**
 * Build Binance request headers
 */
function buildBinanceHeaders(apiKey: string): Headers {
  return new Headers({
    'Accept': 'application/json',
    'X-MBX-APIKEY': apiKey,
  })
}

/**
 * Get account balances
 */
export async function getBalance(creds: BinanceCredentials): Promise<BinanceBalance[]> {
  try {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`
    const signature = generateSignature(queryString, creds.secretKey)

    const headers = buildBinanceHeaders(creds.apiKey)
    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.balances || [])
      .filter((bal: any) => parseFloat(bal.free) > 0 || parseFloat(bal.locked) > 0)
      .map((bal: any) => ({
        asset: bal.asset,
        free: parseFloat(bal.free),
        locked: parseFloat(bal.locked),
        total: parseFloat(bal.free) + parseFloat(bal.locked),
      }))
  } catch (error) {
    console.error('Error fetching Binance balance:', error)
    throw error
  }
}

/**
 * Get deposit history
 */
export async function getDepositHistory(
  creds: BinanceCredentials,
  days: number = 30
): Promise<BinanceDeposit[]> {
  try {
    const now = Date.now()
    const startTime = now - days * 24 * 60 * 60 * 1000
    const timestamp = now

    const queryString = `startTime=${startTime}&timestamp=${timestamp}`
    const signature = generateSignature(queryString, creds.secretKey)

    const headers = buildBinanceHeaders(creds.apiKey)
    const url = `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${queryString}&signature=${signature}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((dep: any) => ({
      coin: dep.coin,
      amount: parseFloat(dep.amount),
      status: dep.status,
      insertTime: new Date(dep.insertTime).toISOString(),
      txId: dep.txId,
      address: dep.address,
    }))
  } catch (error) {
    console.error('Error fetching Binance deposit history:', error)
    throw error
  }
}

/**
 * Get withdrawal history
 */
export async function getWithdrawHistory(
  creds: BinanceCredentials,
  days: number = 30
): Promise<BinanceWithdraw[]> {
  try {
    const now = Date.now()
    const startTime = now - days * 24 * 60 * 60 * 1000
    const timestamp = now

    const queryString = `startTime=${startTime}&timestamp=${timestamp}`
    const signature = generateSignature(queryString, creds.secretKey)

    const headers = buildBinanceHeaders(creds.apiKey)
    const url = `https://api.binance.com/sapi/v1/capital/withdraw/history?${queryString}&signature=${signature}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((wd: any) => ({
      coin: wd.coin,
      amount: parseFloat(wd.amount),
      status: wd.status,
      withdrawOrderId: wd.withdrawOrderId,
      applyTime: new Date(wd.applyTime).toISOString(),
      txId: wd.txId,
      network: wd.network,
    }))
  } catch (error) {
    console.error('Error fetching Binance withdrawal history:', error)
    throw error
  }
}

/**
 * Get USDT balance specifically
 */
export async function getUSDTBalance(creds: BinanceCredentials): Promise<number> {
  try {
    const balances = await getBalance(creds)
    const usdt = balances.find((b) => b.asset === 'USDT')
    return usdt?.total || 0
  } catch (error) {
    console.error('Error fetching USDT balance:', error)
    throw error
  }
}

/**
 * Get transaction history (combined deposits and withdrawals)
 */
export async function getTransactionHistory(
  creds: BinanceCredentials,
  days: number = 30
): Promise<BinanceTransaction[]> {
  try {
    const [deposits, withdrawals] = await Promise.all([
      getDepositHistory(creds, days),
      getWithdrawHistory(creds, days),
    ])

    const transactions: BinanceTransaction[] = []

    deposits.forEach((dep) => {
      transactions.push({
        id: `dep-${dep.insertTime}`,
        type: 'deposit',
        asset: dep.coin,
        amount: dep.amount,
        fee: 0,
        status: dep.status === 1 ? 'success' : 'pending',
        timestamp: dep.insertTime,
      })
    })

    withdrawals.forEach((wd) => {
      transactions.push({
        id: `wd-${wd.applyTime}`,
        type: 'withdrawal',
        asset: wd.coin,
        amount: wd.amount,
        fee: 0,
        status: wd.status === 0 ? 'success' : 'pending',
        timestamp: wd.applyTime,
      })
    })

    // Sort by timestamp descending
    return transactions.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Error fetching Binance transaction history:', error)
    throw error
  }
}
