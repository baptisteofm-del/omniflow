import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification avec le client normal (respecte les cookies)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour accepter une invitation' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, agencyId } = body

    if (!token && !agencyId) {
      return NextResponse.json({ error: 'Token ou agencyId requis' }, { status: 400 })
    }

    // 2. Utiliser le client admin (service role) pour bypasser les RLS
    //    L'auth est déjà vérifiée ci-dessus — on agit au nom du serveur
    const admin = await createAdminClient()

    // 3. Chercher l'invitation par token
    let invitation: any = null

    if (token) {
      const { data } = await admin
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .maybeSingle()
      invitation = data
    }

    // Fallback : chercher par email + agencyId si le token ne matche pas
    if (!invitation && agencyId && user.email) {
      const { data } = await admin
        .from('team_invitations')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('email', user.email.toLowerCase())
        .maybeSingle()
      invitation = data
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable. Le lien est peut-être expiré ou invalide." },
        { status: 404 }
      )
    }

    // 4. Vérifier expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Ce lien d'invitation a expiré (7 jours). Demandez un nouveau lien." },
        { status: 410 }
      )
    }

    // 5. Vérifier que l'email de l'invitation correspond à celui de l'utilisateur
    if (invitation.email && user.email &&
        invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: `Cette invitation est destinée à ${invitation.email}. Connectez-vous avec ce compte.` },
        { status: 403 }
      )
    }

    const targetAgencyId = invitation.agency_id

    // 6. Vérifier si déjà membre
    const { data: existingMember } = await admin
      .from('team_members')
      .select('id')
      .eq('agency_id', targetAgencyId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        agencyId: targetAgencyId,
      })
    }

    // 7. Insérer le membre (admin bypasse la RLS)
    const memberData = {
      agency_id: targetAgencyId,
      user_id: user.id,
      email: user.email?.toLowerCase(),
      role: invitation.role || 'member',
      joined_at: new Date().toISOString(),
      status: 'active',
      permissions: [],
    }

    const { error: memberError } = await admin.from('team_members').insert(memberData)

    // Ignorer les erreurs de duplicate key (member existe déjà)
    if (memberError && memberError.code !== '23505') {
      console.error('Insert team member error:', memberError)
      throw memberError
    }

    // 8. Marquer l'invitation comme acceptée
    await admin
      .from('team_invitations')
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
        status: 'accepted',
      })
      .eq('id', invitation.id)

    // 9. Récupérer le nom de l'agence
    const { data: agency } = await admin
      .from('agencies')
      .select('name')
      .eq('id', targetAgencyId)
      .single()

    return NextResponse.json({
      success: true,
      agencyId: targetAgencyId,
      agencyName: agency?.name || 'OmniFlow',
      role: invitation.role,
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
