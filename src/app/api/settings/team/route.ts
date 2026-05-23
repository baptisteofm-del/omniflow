import { createClient } from '@/lib/supabase/server'
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
      .select('id, email, role, joined_at, user_id')
      .eq('agency_id', agency.id)
      .order('joined_at', { ascending: false })

    // Résoudre l'email du propriétaire maintenant pour le filtrage
    const ownerUserEmail = user.email || ''

    // Filtrer le propriétaire des membres (il peut être dans team_members avec un ancien rôle)
    const filteredMembers = (members || []).filter(m =>
      m.user_id !== agency.owner_id &&
      m.email?.toLowerCase() !== ownerUserEmail.toLowerCase()
    )

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    // Get pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select('id, email, role, created_at')
      .eq('agency_id', agency.id)
      .eq('accepted', false)
      .order('created_at', { ascending: false })

    if (invitationsError) {
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

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
      members: filteredMembers,
      invitations: invitations || [],
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

    const VALID_ROLES = ['member', 'admin', 'video_editor', 'chatting_manager', 'marketing_manager']
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Rôle invalide. Choisissez parmi : ${VALID_ROLES.join(', ')}` }, { status: 400 })
    }

    // Check doublon dans members
    const { data: existingMember } = await supabase.from('team_members').select('id').eq('agency_id', agency.id).eq('email', email.toLowerCase()).maybeSingle()
    if (existingMember) return NextResponse.json({ error: "Ce membre fait déjà partie de l'équipe" }, { status: 400 })

    // Générer un token d'invitation unique
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours

    // Essayer d'insérer dans team_invitations (gestion souple des colonnes)
    let invitation: any = null
    const insertData: any = { agency_id: agency.id, email: email.toLowerCase(), role, token, expires_at: expiresAt }
    if (permissions.length > 0) insertData.permissions = permissions

    // Tentative 1 : avec accepted column
    const { data: inv1, error: err1 } = await supabase.from('team_invitations').insert({ ...insertData, accepted: false }).select().single()
    if (!err1) {
      invitation = inv1
    } else {
      // Tentative 2 : sans accepted (colonne peut-être absente)
      const { data: inv2, error: err2 } = await supabase.from('team_invitations').insert(insertData).select().single()
      if (!err2) {
        invitation = inv2
      } else {
        // Fallback : insérer directement dans team_members avec status invited
        const { data: member } = await supabase.from('team_members').insert({ agency_id: agency.id, email: email.toLowerCase(), role, permissions, status: 'invited', joined_at: new Date().toISOString() }).select().single()
        invitation = member || { id: token, email, role, created_at: new Date().toISOString() }
      }
    }

    // Envoyer l'email d'invitation via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'
    const inviteUrl = `${appUrl}/join?invitation=${token}&email=${encodeURIComponent(email)}&agency=${agency.id}`
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY || '')
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'hello@omniflowapp.ai',
          to: email,
          subject: `Invitation à rejoindre \${agency.name || 'OmniFlow'}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0f; color: white; border-radius: 12px;">
              <h1 style="color: #a855f7; margin-bottom: 16px;">Invitation OmniFlow</h1>
              <p style="color: #9ca3af; margin-bottom: 24px;">
                Vous avez été invité(e) à rejoindre <strong style="color: white;">\${agency.name || 'votre agence'}</strong> sur OmniFlow en tant que <strong style="color: #a78bfa;">\${({'video_editor':'Monteur Vidéo','chatting_manager':'Manager Chatting','marketing_manager':'Manager Marketing','admin':'Administrateur','member':'Membre'})[role] || role}</strong>.
              </p>
              <a href="\${inviteUrl}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #0891b2); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
                Accepter l'invitation
              </a>
              <p style="color: #6b7280; font-size: 12px;">Ce lien expire dans 7 jours. Si vous n'avez pas demandé cette invitation, ignorez cet email.</p>
            </div>
          `
        })
      }
    } catch (emailErr) {
      // L'email a échoué mais l'invitation est créée - non bloquant
      console.warn('Email send failed (non-blocking):', emailErr)
    }

    return NextResponse.json({
      success: true,
      invitation,
      inviteUrl, // utile pour tests
      message: process.env.RESEND_API_KEY
        ? `Invitation envoyée à \${email}`
        : `Invitation créée pour \${email} (email non configuré — partagez ce lien : \${inviteUrl})`
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
