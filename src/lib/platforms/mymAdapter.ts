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
      lastMessageAt: c.lastMessageAt || null,
    }))
  },

  async fetchMessages(credentials, externalConversationId): Promise<AdapterMessage[]> {
    const messages = await getMessages(credentials, externalConversationId, 100)
    return messages.map((m) => ({
      externalMessageId: m.id,
      externalConversationId,
      // The old client's raw API response doesn't reliably expose sender
      // side — see TECH_DEBT.md. Conservative default: treat as inbound
      // (fan) unless proven otherwise, since silently mislabeling an
      // inbound fan message as our own outbound send would be worse (it
      // would suppress a reply Full AI/Copilot should have reacted to).
      direction: 'inbound',
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
