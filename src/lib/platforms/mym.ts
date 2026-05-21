/**
 * MYM.fans Integration (French creator platform)
 * Uses Bearer token authentication
 */

export interface MYMCredentials {
  bearerToken: string
}

export interface MYMMessage {
  id: string
  conversationId: string
  userId: string
  userName: string
  text: string
  createdAt: string
  hasMedia: boolean
}

export interface MYMConversation {
  id: string
  userId: string
  userName: string
  avatar?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface MYMEarnings {
  totalEarnings: number
  pendingEarnings: number
  currency: string
  lastUpdated: string
}

/**
 * Build MYM API headers
 */
function buildMYMHeaders(creds: MYMCredentials): Headers {
  const headers = new Headers({
    'Authorization': `Bearer ${creds.bearerToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'OmniFlow/1.0',
  })
  return headers
}

/**
 * Get all conversations
 */
export async function getConversations(
  creds: MYMCredentials,
  limit: number = 100,
  offset: number = 0
): Promise<MYMConversation[]> {
  try {
    const headers = buildMYMHeaders(creds)
    const url = new URL('https://mym.fans/api/v2/conversations')
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('offset', offset.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.conversations || data || []).map((conv: any) => ({
      id: conv.id?.toString() || '',
      userId: conv.userId?.toString() || '',
      userName: conv.userName || conv.username || '',
      avatar: conv.avatar || undefined,
      lastMessage: conv.lastMessage || '',
      lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
      unreadCount: conv.unreadCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching MYM conversations:', error)
    throw error
  }
}

/**
 * Get messages from a conversation
 */
export async function getMessages(
  creds: MYMCredentials,
  conversationId: string,
  limit: number = 100
): Promise<MYMMessage[]> {
  try {
    const headers = buildMYMHeaders(creds)
    const url = new URL(`https://mym.fans/api/v2/conversations/${conversationId}/messages`)
    url.searchParams.append('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }

    const data = await response.json()

    return (data.messages || data || []).map((msg: any) => ({
      id: msg.id?.toString() || '',
      conversationId: conversationId,
      userId: msg.userId?.toString() || '',
      userName: msg.userName || msg.username || '',
      text: msg.text || msg.content || '',
      createdAt: msg.createdAt || msg.date || new Date().toISOString(),
      hasMedia: msg.hasMedia || msg.mediaCount > 0 || false,
    }))
  } catch (error) {
    console.error('Error fetching MYM messages:', error)
    throw error
  }
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(
  creds: MYMCredentials,
  conversationId: string,
  text: string
): Promise<void> {
  try {
    const headers = buildMYMHeaders(creds)

    const response = await fetch(`https://mym.fans/api/v2/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }
  } catch (error) {
    console.error('Error sending MYM message:', error)
    throw error
  }
}

/**
 * Get earnings summary
 */
export async function getEarnings(creds: MYMCredentials): Promise<MYMEarnings> {
  try {
    const headers = buildMYMHeaders(creds)

    const response = await fetch('https://mym.fans/api/v2/earnings/summary', {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      totalEarnings: parseFloat(data.totalEarnings) || 0,
      pendingEarnings: parseFloat(data.pendingEarnings) || 0,
      currency: data.currency || 'EUR',
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error fetching MYM earnings:', error)
    throw error
  }
}
