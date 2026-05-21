/**
 * OnlyFans Integration via Session Tokens
 * No official API — using reverse-engineered endpoints like Infloww, GoRocket, etc.
 * Agency provides their own session tokens (legal approach)
 */

export interface OFCredentials {
  userId: string
  authId: string      // Cookie: auth_id
  sess: string        // Cookie: sess
  bcTokens: string    // Cookie: bc-tokens-p11
  userAgent: string   // Important to avoid bans
}

export interface OFMessage {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
  hasMedia: boolean
}

export interface OFSubscriber {
  id: string
  name: string
  username: string
  avatar?: string
  isActive: boolean
  subscribedAt: string
}

export interface OFChat {
  id: string
  userId: string
  userName: string
  lastMessage: string
  unreadCount: number
  lastMessageAt: string
}

export interface OFTransaction {
  id: string
  type: 'subscription' | 'tip' | 'ppv'
  amount: number
  currency: string
  date: string
  userName: string
}

export interface OFEarnings {
  totalEarnings: number
  pendingEarnings: number
  currency: string
  lastUpdated: string
}

/**
 * Build standard OnlyFans headers with session tokens
 */
function buildOFHeaders(creds: OFCredentials): Headers {
  const headers = new Headers({
    'User-Agent': creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': `auth_id=${creds.authId}; sess=${creds.sess}; bc-tokens-p11=${creds.bcTokens}`,
    'Referer': 'https://onlyfans.com/',
    'Origin': 'https://onlyfans.com',
  })
  return headers
}

/**
 * Get all active subscribers
 */
export async function getSubscribers(
  creds: OFCredentials,
  limit: number = 100,
  offset: number = 0
): Promise<OFSubscriber[]> {
  try {
    const headers = buildOFHeaders(creds)
    const url = new URL('https://onlyfans.com/api2/v2/subscriptions/subscribes')
    url.searchParams.append('type', 'active')
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('offset', offset.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Parse response array of subscribers
    return (data || []).map((sub: any) => ({
      id: sub.id?.toString() || '',
      name: sub.name || sub.username || '',
      username: sub.username || '',
      avatar: sub.avatar || undefined,
      isActive: true,
      subscribedAt: sub.subscribedAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching OnlyFans subscribers:', error)
    throw error
  }
}

/**
 * Get all chats/conversations
 */
export async function getChats(
  creds: OFCredentials,
  limit: number = 100
): Promise<OFChat[]> {
  try {
    const headers = buildOFHeaders(creds)
    const url = new URL('https://onlyfans.com/api2/v2/chats')
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('offset', '0')
    url.searchParams.append('sort', 'recent')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((chat: any) => ({
      id: chat.id?.toString() || '',
      userId: chat.userId?.toString() || '',
      userName: chat.userName || chat.username || '',
      lastMessage: chat.lastMessage || '',
      unreadCount: chat.unreadCount || 0,
      lastMessageAt: chat.lastMessageAt || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching OnlyFans chats:', error)
    throw error
  }
}

/**
 * Get messages from a specific fan or all messages
 */
export async function getMessages(
  creds: OFCredentials,
  fanId?: string,
  limit: number = 100
): Promise<OFMessage[]> {
  try {
    const headers = buildOFHeaders(creds)
    
    let url: string
    if (fanId) {
      url = `https://onlyfans.com/api2/v2/users/${fanId}/messages?limit=${limit}`
    } else {
      url = `https://onlyfans.com/api2/v2/chats?limit=${limit}&offset=0&sort=recent`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((msg: any) => ({
      id: msg.id?.toString() || '',
      userId: msg.userId?.toString() || msg.from?.toString() || '',
      userName: msg.userName || msg.username || '',
      text: msg.text || msg.message || '',
      createdAt: msg.createdAt || msg.date || new Date().toISOString(),
      hasMedia: msg.hasMedia || msg.mediaCount > 0 || false,
    }))
  } catch (error) {
    console.error('Error fetching OnlyFans messages:', error)
    throw error
  }
}

/**
 * Send a message to a fan
 */
export async function sendMessage(
  creds: OFCredentials,
  fanId: string,
  text: string
): Promise<void> {
  try {
    const headers = buildOFHeaders(creds)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(`https://onlyfans.com/api2/v2/users/${fanId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
      }),
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }
  } catch (error) {
    console.error('Error sending OnlyFans message:', error)
    throw error
  }
}

/**
 * Get transaction history
 */
export async function getTransactions(
  creds: OFCredentials,
  days: number = 30
): Promise<OFTransaction[]> {
  try {
    const headers = buildOFHeaders(creds)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const url = new URL('https://onlyfans.com/api2/v2/payments/transactions')
    url.searchParams.append('startDate', startDate.toISOString().split('T')[0])

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }

    const data = await response.json()

    return (data || []).map((txn: any) => ({
      id: txn.id?.toString() || '',
      type: txn.type || 'subscription',
      amount: parseFloat(txn.amount) || 0,
      currency: txn.currency || 'USD',
      date: txn.date || new Date().toISOString(),
      userName: txn.userName || txn.username || '',
    }))
  } catch (error) {
    console.error('Error fetching OnlyFans transactions:', error)
    throw error
  }
}

/**
 * Get earnings summary
 */
export async function getEarnings(creds: OFCredentials): Promise<OFEarnings> {
  try {
    const headers = buildOFHeaders(creds)

    const response = await fetch('https://onlyfans.com/api2/v2/earning', {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`OnlyFans API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      totalEarnings: parseFloat(data.totalEarnings) || 0,
      pendingEarnings: parseFloat(data.pendingEarnings) || 0,
      currency: data.currency || 'USD',
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching OnlyFans earnings:', error)
    throw error
  }
}
