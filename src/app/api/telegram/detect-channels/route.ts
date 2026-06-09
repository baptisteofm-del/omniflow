import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

/**
 * GET /api/telegram/detect-channels
 * Détecte les canaux Telegram récents où le bot a été ajouté comme admin.
 * Utilise getUpdates — fonctionne sans webhook.
 * 
 * Note : seules les dernières mises à jour (non lues) sont retournées.
 * Si le bot a été ajouté il y a longtemps, utiliser la vérification manuelle.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!BOT_TOKEN) {
      return NextResponse.json({ channels: [], demo: true, message: 'TELEGRAM_BOT_TOKEN non configuré' })
    }

    // Récupérer les 100 dernières updates du bot
    const updRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100&allowed_updates=["my_chat_member","channel_post"]`,
      { cache: 'no-store' }
    )
    const updData = await updRes.json()

    if (!updData.ok) {
      return NextResponse.json({ channels: [], error: updData.description })
    }

    // Extraire les canaux uniques
    const channelsMap = new Map<string, { id: string; username: string | null; name: string; member_count: number }>()

    for (const update of updData.result || []) {
      // my_chat_member = bot ajouté/retiré d'un chat
      const chat = update.my_chat_member?.chat || update.channel_post?.chat
      if (!chat || chat.type !== 'channel') continue

      const newStatus = update.my_chat_member?.new_chat_member?.status
      // Garder seulement les chats où le bot est admin/creator
      if (update.my_chat_member && !['administrator', 'creator'].includes(newStatus || '')) continue

      const chatId = chat.id.toString()
      if (!channelsMap.has(chatId)) {
        channelsMap.set(chatId, {
          id: chatId,
          username: chat.username ? `@${chat.username}` : null,
          name: chat.title || chat.username || chatId,
          member_count: 0,
        })
      }
    }

    // Enrichir avec le nombre d'abonnés pour les canaux détectés
    const channels = await Promise.all(
      Array.from(channelsMap.values()).map(async (ch) => {
        try {
          const mcRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatMemberCount?chat_id=${ch.id}`
          )
          const mcData = await mcRes.json()
          return { ...ch, member_count: mcData.ok ? mcData.result : 0 }
        } catch {
          return ch
        }
      })
    )

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('detect-channels error:', error)
    return NextResponse.json({ error: 'Erreur serveur', channels: [] }, { status: 500 })
  }
}
