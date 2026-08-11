import type { PlatformAdapter, AdapterConversation, AdapterMessage } from '@/lib/platforms/adapter'
import { getConversations, getMessages, sendMessage as mymSendMessage, type MYMCredentials } from '@/lib/platforms/mym'

// Wraps the existing (already working in the old product) reverse-engineered
// MYM client in the new Adapter Contract shape — src/lib/platforms/mym.ts
// itself is untouched. V1 capability scope matches spec 47.115's Progressive
// Integration order: read conversations/messages and send plain text is
// covered; media/offers/purchase events are NOT — MYM's reverse-engineered
// endpoints for those aren't mapped yet, so this declares them unsupported
// rather than pretending they work (spec 47.114).
export const mymAdapter: PlatformAdapter<MYMCredentials> = {
  platformCode: 'MYM',
  capabilities: {
    readConversations: true,
    sendMessages: true,
    media: false,
    offers: false,
    purchaseEvents: false,
  },

  async testConnection(credentials) {
    try {
      await getConversations(credentials, 1)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Connexion MYM échouée' }
    }
  },

  async fetchConversations(credentials): Promise<AdapterConversation[]> {
    const conversations = await getConversations(credentials, 100)
    return conversations.map((c) => ({
      externalConversationId: c.id,
      externalFanId: c.userId,
      fanDisplayName: c.userName || 'Fan MYM',
      fanAvatarUrl: c.avatar ?? null,
      fanIsSubscriber: c.isSubscriber,
      fanIsOnline: c.isOnline,
      fanLastSeenAt: c.lastSeenAt,
      lastMessageAt: c.lastMessageAt || null,
    }))
  },

  async fetchMessages(credentials, externalConversationId): Promise<AdapterMessage[]> {
    const messages = await getMessages(credentials, externalConversationId, 100)
    // externalConversationId IS the fan's user id (see mym.ts) — a message
    // is inbound (from the fan) when it was sent by that same id.
    return messages.map((m) => ({
      externalMessageId: m.id,
      externalConversationId,
      direction: m.senderId === externalConversationId ? 'inbound' : 'outbound',
      text: m.text,
      sentAt: m.createdAt,
    }))
  },

  async sendMessage(credentials, externalConversationId, text) {
    const ok = await mymSendMessage(credentials, externalConversationId, text)
    if (!ok) throw new Error("Échec de l'envoi du message MYM")
    return {}
  },
}
