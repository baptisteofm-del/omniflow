import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()
    if (!agency) return NextResponse.json({ error: 'Agence introuvable' }, { status: 404 })

    const { invitationId } = await request.json()
    if (!invitationId) return NextResponse.json({ error: 'invitationId requis' }, { status: 400 })

    const admin = await createAdminClient()

    // Récupérer l'invitation
    const { data: invitation } = await admin
      .from('team_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('agency_id', agency.id)
      .single()

    if (!invitation) return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 })

    // Renouveler le token et la date d'expiration
    const newToken = crypto.randomUUID()
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await admin
      .from('team_invitations')
      .update({ token: newToken, expires_at: newExpiry, accepted: false })
      .eq('id', invitationId)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'
    const inviteUrl = `${appUrl}/join?invitation=${newToken}&email=${encodeURIComponent(invitation.email)}&agency=${agency.id}`

    const ROLE_LABELS: Record<string, string> = {
      video_editor: 'Monteur Vidéo',
      chatting_manager: 'Manager Chatting',
      marketing_manager: 'Manager Marketing',
      admin: 'Administrateur',
      member: 'Membre',
    }
    const roleLabel = ROLE_LABELS[invitation.role] || invitation.role
    const agencyDisplayName = agency.name || 'votre agence'

    const emailHtml = `<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">
      <div style="background:linear-gradient(135deg,#7c3aed22,#0891b222);padding:40px">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#0891b2);border-radius:10px;margin-bottom:20px"></div>
        <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px">Invitation OmniFlow</h1>
        <p style="color:#9ca3af;font-size:14px;margin:0">${agencyDisplayName} vous invite à rejoindre OmniFlow</p>
      </div>
      <div style="padding:32px 40px">
        <p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 24px">
          Vous avez été invité(e) à rejoindre <strong style="color:white">${agencyDisplayName}</strong> sur OmniFlow en tant que <strong style="color:#a78bfa">${roleLabel}</strong>.
        </p>
        <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#0891b2);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px">Rejoindre l'agence →</a>
        <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.5">Ce lien expire dans 7 jours.<br>Si vous n'avez pas demandé cette invitation, ignorez cet email.</p>
      </div>
    </div>`

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY || '')
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'OmniFlow <hello@omniflowapp.ai>',
          to: invitation.email,
          subject: `${agencyDisplayName} vous invite à rejoindre OmniFlow`,
          html: emailHtml,
        })
      }
    } catch (emailErr) {
      console.warn('Email resend failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      inviteUrl,
      message: process.env.RESEND_API_KEY
        ? `Invitation renvoyée à ${invitation.email}`
        : `Lien renouvelé : ${inviteUrl}`,
    })
  } catch (error) {
    console.error('Resend invitation error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
