import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TELEGRAM_BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_TELEGRAM_ID   = process.env.SUPPORT_TELEGRAM_CHAT_ID

async function notifyAdmin(ticket: {
  subject: string
  description: string
  priority: string
  category: string
  ticketNumber: string
  userEmail?: string
}) {
  if (!TELEGRAM_BOT_TOKEN || !ADMIN_TELEGRAM_ID) return

  const priorityEmoji: Record<string, string> = {
    low: '🟢', normal: '🔵', high: '🟠', urgent: '🔴',
  }

  const categoryEmoji: Record<string, string> = {
    technical: '🔧', billing: '💳', account: '👤', other: '💡',
  }

  const text =
    `🎫 *Nouveau ticket #${ticket.ticketNumber}*\n\n` +
    `${priorityEmoji[ticket.priority] || '⚪'} *Priorité :* ${ticket.priority.toUpperCase()}\n` +
    `${categoryEmoji[ticket.category] || '📁'} *Catégorie :* ${ticket.category}\n` +
    `📌 *Sujet :* ${ticket.subject}\n\n` +
    `💬 *Description :*\n${ticket.description}\n\n` +
    (ticket.userEmail ? `📧 *Utilisateur :* ${ticket.userEmail}\n\n` : '') +
    `⏰ ${new Date().toLocaleString('fr-FR')}`

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_TELEGRAM_ID,
      text,
      parse_mode: 'Markdown',
    }),
  }).catch(() => { /* Silently ignore Telegram errors */ })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, description, priority = 'normal', category = 'other' } = body

    if (!subject?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Sujet et description requis' }, { status: 400 })
    }

    // Generate ticket number
    const ticketNumber = `OFW-${Date.now().toString(36).toUpperCase()}`

    // Try to get user info from Supabase (optional)
    let userId: string | null = null
    let userEmail: string | null = null
    let agencyId: string | null = null

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email ?? null
        const { data: agency } = await supabase
          .from('agencies')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()
        agencyId = agency?.id ?? null
      }
    } catch { /* Auth is optional */ }

    // Save to Supabase if available
    try {
      const supabase = await createClient()
      await supabase.from('support_tickets').insert({
        ticket_number: ticketNumber,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        category,
        status: 'new',
        user_id: userId,
        agency_id: agencyId,
        user_email: userEmail,
      })
    } catch { /* DB insert is optional — don't fail the request */ }

    // Notify admin via Telegram
    await notifyAdmin({ subject, description, priority, category, ticketNumber, userEmail: userEmail ?? undefined })

    return NextResponse.json({ success: true, ticketNumber })
  } catch (error) {
    console.error('[Support Tickets API Error]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Check admin
    const isAdmin = user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const limit  = parseInt(url.searchParams.get('limit') || '50', 10)

    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ tickets: data ?? [] })
  } catch (error) {
    console.error('[Support Tickets GET Error]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const isAdmin = user.email === process.env.ADMIN_EMAIL
    if (!isAdmin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const { id, status, priority } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    const updates: Record<string, string> = {}
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (status === 'resolved') updates.resolved_at = new Date().toISOString()

    const { error } = await supabase.from('support_tickets').update(updates).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Support Tickets PATCH Error]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
