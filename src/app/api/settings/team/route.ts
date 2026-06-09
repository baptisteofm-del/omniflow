import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency (avec owner_id pour identifier le propriétaire)
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, owner_id, name')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get team members — exclure le propriétaire pour éviter les doublons
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id, email, role, joined_at, user_id, status, permissions')
      .eq('agency_id', agency.id)
      .order('joined_at', { ascending: false })

    // Résoudre l'email du propriétaire maintenant pour le filtrage
    const ownerUserEmail = user.email || ''

    // Filtrer le propriétaire des membres
    const filteredMembers = (members || []).filter((m: any) =>
      m.user_id !== agency.owner_id &&
      m.email?.toLowerCase() !== ownerUserEmail.toLowerCase()
    )

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    // Get pending invitations — utilise le client admin pour bypasser tout problème RLS
    let invitations: any[] = []
    try {
      const admin = await createAdminClient()
      const { data: inv, error: invErr } = await admin
        .from('team_invitations')
        .select('id, email, role, created_at, status, expires_at')
        .eq('agency_id', agency.id)
        .in('status', ['pending', 'opened'])  // invitations non acceptées
        .order('created_at', { ascending: false })

      if (invErr) {
        console.error('team_invitations query error:', invErr)
      }
      invitations = inv || []
    } catch (e) {
      console.error('team_invitations fetch failed:', e)
      invitations = []
    }

    // Tous les membres filtrés sont actifs (pas de colonne status dans le schéma actuel)
    const invitedMembers: any[] = []
    const activeMembers = filteredMembers

    // Fusionner : éviter les doublons entre invitations et invited members
    const invitedEmails = new Set(invitations.map((i: any) => i.email?.toLowerCase()))
    const extraInvitations = invitedMembers
      .filter((m: any) => !invitedEmails.has(m.email?.toLowerCase()))
      .map((m: any) => ({ id: m.id, email: m.email, role: m.role, created_at: m.joined_at }))

    const allInvitations = [...invitations, ...extraInvitations]

    // Récupérer le profil du propriétaire
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', agency.owner_id)
      .single()

    // Email final pour l'affichage owner
    const ownerEmail = ownerProfile?.email || ownerUserEmail || 'Propriétaire'

    return NextResponse.json({
      owner: {
        id: agency.owner_id,
        email: ownerEmail,
        name: ownerProfile?.full_name || null,
        role: 'owner',
        status: 'active',
        joined_at: null, // créateur de l'agence
      },
      members: activeMembers,
      invitations: allInvitations,
      isOwner: user.id === agency.owner_id,
    })
  } catch (error) {
    console.error('GET /api/settings/team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id, name').eq('owner_id', user.id).single()
    if (!agency) return NextResponse.json({ error: 'Agence introuvable' }, { status: 404 })

    const body = await req.json()
    const { email, role, permissions = [] } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const VALID_ROLES = ['member', 'admin', 'video_editor', 'chatting_manager', 'marketing_manager', 'accountant', 'community_manager', 'chatter']
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Rôle invalide. Choisissez parmi : ${VALID_ROLES.join(', ')}` }, { status: 400 })
    }

    // Check doublon dans members
    const { data: existingMember } = await supabase.from('team_members').select('id').eq('agency_id', agency.id).eq('email', email.toLowerCase()).maybeSingle()
    if (existingMember) return NextResponse.json({ error: "Ce membre fait déjà partie de l'équipe" }, { status: 400 })

    // Générer un token d'invitation unique
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours

    // Insérer dans team_invitations via client admin (bypasse RLS pour garantir l'écriture)
    const admin = await createAdminClient()
    const insertData: any = {
      agency_id: agency.id,
      email: email.toLowerCase(),
      role,
      token,
      accepted: false,
      status: 'pending',
      expires_at: expiresAt,
    }
    const { data: invitation, error: insertError } = await admin
      .from('team_invitations')
      .insert(insertData)
      .select('id, email, role, created_at, status')
      .single()

    if (insertError) {
      console.error('team_invitations insert error:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'invitation : ' + insertError.message },
        { status: 500 }
      )
    }

    // Envoyer l'email d'invitation via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'
    const inviteUrl = appUrl + '/join?invitation=' + token + '&email=' + encodeURIComponent(email) + '&agency=' + agency.id

    // Labels de rôles lisibles
    const ROLE_LABELS: Record<string, string> = {
      video_editor: 'Monteur Vidéo',
      chatting_manager: 'Manager Chatting',
      marketing_manager: 'Manager Marketing',
      admin: 'Administrateur',
      member: 'Membre',
    }
    const roleLabel = ROLE_LABELS[role] || role
    const agencyDisplayName = agency.name || 'votre agence'
    const subjectLine = agencyDisplayName + ' vous invite à rejoindre OmniFlow'

    const emailHtml = '<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">'
      + '<div style="background:linear-gradient(135deg,#7c3aed22,#0891b222);padding:40px">'
      + '<div style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#0891b2);border-radius:10px;margin-bottom:20px"></div>'
      + '<h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px">Invitation OmniFlow</h1>'
      + '<p style="color:#9ca3af;font-size:14px;margin:0">' + agencyDisplayName + ' vous invite à rejoindre OmniFlow</p>'
      + '</div>'
      + '<div style="padding:32px 40px">'
      + '<p style="color:#d1d5db;font-size:15px;line-height:1.6;margin:0 0 24px">'
      + 'Vous avez été invité(e) à rejoindre <strong style="color:white">' + agencyDisplayName + '</strong> sur OmniFlow en tant que <strong style="color:#a78bfa">' + roleLabel + '</strong>.'
      + '</p>'
      + '<a href="' + inviteUrl + '" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#0891b2);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px">Accepter l\'invitation →</a>'
      + '<p style="color:#6b7280;font-size:12px;margin:0;line-height:1.5">Ce lien expire dans 7 jours.<br>Si vous n\'avez pas demandé cette invitation, ignorez cet email.</p>'
      + '</div></div>'

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY || '')
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'OmniFlow <hello@omniflowapp.ai>',
          to: email,
          subject: subjectLine,
          html: emailHtml,
        })
      }
    } catch (emailErr) {
      console.warn('Email send failed (non-blocking):', emailErr)
    }

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl,
      message: process.env.RESEND_API_KEY
        ? 'Invitation envoyée à ' + email
        : 'Invitation créée. Lien à partager : ' + inviteUrl
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/settings/team:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur serveur lors de l'invitation" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Support query params (?id=xxx&type=xxx) ET body JSON
    const { searchParams } = new URL(req.url)
    const idFromQuery = searchParams.get('id')
    const typeFromQuery = searchParams.get('type') // 'member' | 'invitation'

    let memberId = idFromQuery
    let deleteType = typeFromQuery || 'member'

    if (!memberId) {
      try {
        const body = await req.json()
        memberId = body.memberId || body.id
        deleteType = body.type || deleteType
      } catch {}
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Si c'est une invitation, supprimer de team_invitations
    if (deleteType === 'invitation') {
      await supabase.from('team_invitations').delete().eq('id', memberId).eq('agency_id', agency.id)
      return NextResponse.json({ success: true })
    }

    // Get member to check if they're the owner
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('role, agency_id')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the owner from the team' },
        { status: 400 }
      )
    }

    if (member.agency_id !== agency.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/settings/team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const { id, role, permissions } = await req.json()
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { error } = await supabase
      .from('team_members')
      .update({ role, permissions })
      .eq('id', id)
      .eq('agency_id', agency.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}
