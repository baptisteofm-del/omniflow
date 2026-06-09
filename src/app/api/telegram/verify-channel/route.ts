import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

/**
 * POST /api/telegram/verify-channel
 * Vérifie qu'un canal est accessible par le bot et retourne ses infos.
 * Accepte @username ou un ID numérique (-100xxxxxxxxx).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { channel_identifier } = await request.json()
    if (!channel_identifier?.trim()) {
      return NextResponse.json({ error: 'channel_identifier requis' }, { status: 400 })
    }

    // Mode démo si pas de token configuré
    if (!BOT_TOKEN) {
      return NextResponse.json({
        verified: true,
        demo: true,
        name: channel_identifier.replace('@', ''),
        username: channel_identifier.startsWith('@') ? channel_identifier : null,
        chat_id: channel_identifier,
        member_count: 0,
        message: 'Mode démo (TELEGRAM_BOT_TOKEN non configuré)',
      })
    }

    // Appel getChat — vérifie que le bot est membre/admin du canal
    const chatRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${encodeURIComponent(channel_identifier)}`,
      { cache: 'no-store' }
    )
    const chatData = await chatRes.json()

    if (!chatData.ok) {
      const msg = chatData.description || 'Canal introuvable'
      const hint = msg.includes('chat not found')
        ? 'Canal introuvable. Vérifiez que le bot est bien ajouté comme administrateur.'
        : msg.includes('bot was kicked')
          ? 'Le bot a été retiré du canal. Réajoutez-le comme administrateur.'
          : msg
      return NextResponse.json({ verified: false, error: hint }, { status: 400 })
    }

    const chat = chatData.result

    // Vérifier que c'est bien un canal (pas un groupe ou DM)
    if (chat.type !== 'channel') {
      return NextResponse.json({
        verified: false,
        error: `Ce chat est de type "${chat.type}" — seuls les canaux Telegram sont supportés.`,
      }, { status: 400 })
    }

    // Récupérer le nombre d'abonnés
    let memberCount = 0
    try {
      const mcRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${encodeURIComponent(channel_identifier)}`
      )
      const mcData = await mcRes.json()
      if (mcData.ok) memberCount = mcData.result
    } catch {}

    return NextResponse.json({
      verified: true,
      name: chat.title || chat.username || channel_identifier,
      username: chat.username ? `@${chat.username}` : null,
      chat_id: chat.id.toString(),
      member_count: memberCount,
      type: chat.type,
    })
  } catch (error) {
    console.error('verify-channel error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
