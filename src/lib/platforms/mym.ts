/**
 * MYM.fans Integration (French creator platform)
 * Uses Bearer token authentication or email/password login
 */

export interface MYMCredentials {
  bearerToken: string
}

export interface MYMLoginRequest {
  email: string
  password: string
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

// MYM's creator platform (creators.mym.fans — a distinct app from the
// mym.fans consumer site, confirmed via live DevTools capture) authenticates
// through Amazon Cognito, not a custom login API — the previous guessed
// endpoints (mym.fans/api/auth/login etc.) were simply wrong. Confirmed live
// from a real captured request: host cognito-idp.eu-west-3.amazonaws.com,
// this specific Cognito App Client ID. This is AWS's own public, documented
// InitiateAuth API (https://docs.aws.amazon.com/cognito/...), not something
// reverse-engineered from MYM itself.
const COGNITO_REGION = 'eu-west-3'
const COGNITO_CLIENT_ID = '27hq9jdoc4t09pmvab18aaf1sh'

/**
 * Login to MYM.fans (creators.mym.fans) via Amazon Cognito and get a token
 * usable as a Bearer token for subsequent API calls.
 */
export async function loginAndGetToken(email: string, password: string): Promise<string> {
  const res = await fetch(`https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: password },
      ClientId: COGNITO_CLIENT_ID,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Cognito's error shape: { __type: "NotAuthorizedException", message: "..." }
    const type = data.__type || `HTTP ${res.status}`
    throw new Error(`Connexion MYM refusée (${type})${data.message ? ` — ${data.message}` : ''}`)
  }

  if (data.ChallengeName) {
    // e.g. NEW_PASSWORD_REQUIRED, SMS_MFA — direct password auth alone
    // can't complete these; not handled yet, see TECH_DEBT.md.
    throw new Error(`MYM demande une étape supplémentaire (${data.ChallengeName}) non gérée pour l'instant`)
  }

  const idToken = data.AuthenticationResult?.IdToken
  const accessToken = data.AuthenticationResult?.AccessToken
  const token = idToken || accessToken
  if (!token) throw new Error('Connexion MYM : aucun token dans la réponse Cognito')

  return token
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
 * Send a message to a fan conversation
 */
export async function sendMessage(
  creds: MYMCredentials,
  conversationId: string,
  message: string
): Promise<boolean> {
  try {
    const headers = buildMYMHeaders(creds)
    const response = await fetch(`https://mym.fans/api/v2/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: message, type: 'text' }),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get new/unread messages since a given timestamp
 */
export async function getNewMessages(
  creds: MYMCredentials,
  since?: string
): Promise<Array<{ conversationId: string; fanId: string; fanName: string; message: string; timestamp: string }>> {
  try {
    const conversations = await getConversations(creds, 50)
    const results = []
    
    for (const conv of conversations) {
      if (conv.unreadCount === 0) continue
      
      const messages = await getMessages(creds, conv.id, 5)
      const lastMsg = messages[messages.length - 1]
      
      if (!lastMsg) continue
      // Skip messages sent by the model (only process fan messages)
      if ((lastMsg as any).is_mine || (lastMsg as any).sender === 'model') continue
      
      results.push({
        conversationId: conv.id,
        fanId: conv.userId,
        fanName: conv.userName,
        message: (lastMsg as any).content || (lastMsg as any).text || '',
        timestamp: (lastMsg as any).created_at || new Date().toISOString(),
      })
    }
    
    return results
  } catch {
    return []
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
