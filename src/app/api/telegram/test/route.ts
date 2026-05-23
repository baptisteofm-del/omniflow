import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const BOT_USERNAME = '@omniflowapp_bot'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { channel_id, channel_username, message } = await request.json()
    const chatId = channel_id || channel_username

    if (!chatId) return NextResponse.json({ error: 'channel_id ou channel_username requis' }, { status: 400 })

    const testMessage = message || `✅ Test de connexion OmniFlow\n\nLe bot ${BOT_USERNAME} est bien connecté à ce canal.\n\n🚀 Automatisation active.`

    if (!BOT_TOKEN) {
      // Mode démo sans token
      return NextResponse.json({ success: true, message_id: 999, demo: true })
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: testMessage, parse_mode: 'HTML' }),
    })

    const data = await res.json()
    if (!data.ok) throw new Error(data.description || 'Erreur Telegram API')

    return NextResponse.json({ success: true, message_id: data.result?.message_id })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send test', success: false }, { status: 500 })
  }
}
