// Platform Adapter Contract (spec 47.113: "OnlyFans et MYM doivent
// implémenter le même contrat métier autant que possible"). MYM is the
// first real implementation (src/lib/platforms/mymAdapter.ts); a future
// OnlyFans adapter (via a third-party provider like OFAuth/OnlyFansAPI.com —
// see docs/implementation/TECH_DEBT.md) implements the same shape.
//
// `capabilities` makes gaps explicit rather than silent (spec 47.114:
// "si une plateforme ne supporte pas une capability, la déclarer
// explicitement") — code that wants to send a paid offer, for instance,
// should check `capabilities.offers` before assuming an adapter can do it.

export interface AdapterConversation {
  externalConversationId: string
  externalFanId: string
  fanDisplayName: string
  fanAvatarUrl?: string | null
  fanIsSubscriber?: boolean
  fanIsOnline?: boolean
  fanLastSeenAt?: string | null
  lastMessageAt: string | null
}

export interface AdapterMessage {
  externalMessageId: string
  externalConversationId: string
  direction: 'inbound' | 'outbound'
  text: string
  sentAt: string
}

export interface AdapterCapabilities {
  readConversations: boolean
  sendMessages: boolean
  media: boolean
  offers: boolean
  purchaseEvents: boolean
}

export interface PlatformAdapter<TCredentials> {
  platformCode: 'MYM' | 'ONLYFANS'
  capabilities: AdapterCapabilities

  testConnection(credentials: TCredentials): Promise<{ ok: boolean; error?: string }>
  fetchConversations(credentials: TCredentials): Promise<AdapterConversation[]>
  fetchMessages(credentials: TCredentials, externalConversationId: string): Promise<AdapterMessage[]>
  sendMessage(credentials: TCredentials, externalConversationId: string, text: string): Promise<{ externalMessageId?: string }>
}
