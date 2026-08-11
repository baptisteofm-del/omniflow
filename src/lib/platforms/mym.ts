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
  // The fan's user id and the creator's own user id — direction is derived
  // by comparing senderId to the conversation's fan id (conversationId),
  // never by trusting a boolean flag from the API.
  senderId: string
  receiverId: string
  text: string
  createdAt: string
  hasMedia: boolean
}

export interface MYMConversation {
  id: string
  userId: string
  userName: string
  avatar?: string
  isSubscriber: boolean
  isOnline: boolean
  lastSeenAt: string | null
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

  // MYM's real API (styx.mym.fans) rejects the Cognito IdToken with a 403 —
  // confirmed live by inspecting the owner's own browser request headers.
  // It expects the AccessToken specifically (its JWT payload has
  // "token_use": "access"), not the IdToken, even though both come back
  // from the same InitiateAuth call.
  const accessToken = data.AuthenticationResult?.AccessToken
  const idToken = data.AuthenticationResult?.IdToken
  const token = accessToken || idToken
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

// Real MYM API host (styx.mym.fans, not mym.fans) confirmed live via the
// owner's own DevTools Network tab — same discovery process as the Cognito
// login above, nothing guessed. A conversation's real identifier, as used
// by this API, is the fan's user id (not a separate "conversation id"): the
// list endpoint returns rows shaped `{creatorId}#{fanId}`, and fetching a
// single conversation's messages is `GET /v1/chats/{fanId}`. So throughout
// this file and the adapter layer, `MYMConversation.id`/`conversationId` IS
// the fan's user id.
const STYX_BASE = 'https://styx.mym.fans/v1'

/**
 * Get all conversations
 */
export async function getConversations(
  creds: MYMCredentials,
  limit: number = 100,
  cursor?: string
): Promise<MYMConversation[]> {
  try {
    const headers = buildMYMHeaders(creds)
    const url = new URL(`${STYX_BASE}/chats`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('last_message_opts', 'light')
    if (cursor) url.searchParams.set('cursor', cursor)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }

    const data = await response.json()
    const rows: any[] = data.data || []

    return rows.map((row) => {
      // row.id is "{creatorId}#{fanId}" — the part after '#' is the fan's
      // user id, which doubles as our conversation id.
      const fanId = String(row.id || '').split('#')[1] || ''
      return {
        id: fanId,
        userId: fanId,
        userName: row.user?.nickname || row.user?.username || '',
        avatar: row.user?.avatar_url || undefined,
        isSubscriber: !!row.user?.is_subscriber,
        isOnline: !!row.user?.is_online,
        lastSeenAt: row.user?.last_seen_at || null,
        // The `last_message_opts=light` response doesn't include message
        // text, only its date/read state — getMessages() is the source of
        // truth for actual content.
        lastMessage: '',
        lastMessageAt: row.last_message?.date || new Date().toISOString(),
        unreadCount: row.is_read ? 0 : 1,
      }
    })
  } catch (error) {
    console.error('Error fetching MYM conversations:', error)
    throw error
  }
}

/**
 * Get messages from a conversation (conversationId = the fan's user id)
 */
export async function getMessages(
  creds: MYMCredentials,
  conversationId: string,
  limit: number = 100
): Promise<MYMMessage[]> {
  try {
    const headers = buildMYMHeaders(creds)
    const url = new URL(`${STYX_BASE}/chats/${conversationId}`)
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`MYM API error: ${response.status}`)
    }

    const data = await response.json()
    const rows: any[] = data.data?.messages || []

    // Real API returns newest-first (confirmed live).
    return rows.map((msg: any) => ({
      id: msg.id?.toString() || '',
      conversationId,
      senderId: msg.sender_id?.toString() || '',
      receiverId: msg.receiver_id?.toString() || '',
      text: msg.content || '',
      createdAt: msg.date || new Date().toISOString(),
      hasMedia: msg.type === 'private_media',
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
      // Newest-first — the most recent message is index 0.
      const lastMsg = messages[0]

      if (!lastMsg) continue
      // Only process messages actually sent by the fan (senderId === the
      // conversation's fan id), never our own outbound sends.
      if (lastMsg.senderId !== conv.userId) continue

      results.push({
        conversationId: conv.id,
        fanId: conv.userId,
        fanName: conv.userName,
        message: lastMsg.text,
        timestamp: lastMsg.createdAt,
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
