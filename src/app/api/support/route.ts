import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
// ID Telegram de l'admin (Baptiste) — à configurer
const ADMIN_TELEGRAM_ID = process.env.SUPPORT_TELEGRAM_CHAT_ID!

export async function POST(req: NextRequest) {
  const { name, subject, message } = await req.json()

  if (!name || !message) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const text = `🆕 *Nouveau message support OmniFlow*\n\n` +
    `👤 *De :* ${name}\n` +
    `📌 *Sujet :* ${subject || 'Non précisé'}\n\n` +
    `💬 *Message :*\n${message}\n\n` +
    `⏰ ${new Date().toLocaleString('fr-FR')}`

  try {
    // Envoyer via le bot Telegram
    if (TELEGRAM_BOT_TOKEN && ADMIN_TELEGRAM_ID) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_TELEGRAM_ID,
          text,
          parse_mode: 'Markdown',
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true }) // On répond toujours OK côté client
  }
}
