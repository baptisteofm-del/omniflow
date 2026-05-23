import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Vous devez être connecté pour accepter une invitation' }, { status: 401 })

    const body = await request.json()
    const { token, agencyId } = body

    if (!token && !agencyId) {
      return NextResponse.json({ error: 'Token ou agencyId requis' }, { status: 400 })
    }

    // Chercher l'invitation par token OU par email + agencyId
    let invitation: any = null

    if (token) {
      const { data } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .maybeSingle()
      invitation = data
    }

    if (!invitation && agencyId) {
      // Fallback: chercher par email + agencyId
      const { data } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('email', user.email?.toLowerCase() || '')
        .maybeSingle()
      invitation = data
    }

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation introuvable ou expirée' }, { status: 404 })
    }

    // Vérifier expiration si le champ existe
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Ce lien d\'invitation a expiré' }, { status: 410 })
    }

    const targetAgencyId = invitation.agency_id

    // Vérifier si déjà membre
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('agency_id', targetAgencyId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingMember) {
      // Déjà membre → juste rediriger
      return NextResponse.json({ success: true, alreadyMember: true, agencyId: targetAgencyId })
    }

    // Créer le membre
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        agency_id: targetAgencyId,
        user_id: user.id,
        email: user.email?.toLowerCase(),
        role: invitation.role || 'member',
        permissions: invitation.permissions || [],
        status: 'active',
        joined_at: new Date().toISOString(),
      })

    if (memberError && memberError.code !== '23505') {
      // Ignorer les doublons, sinon erreur
      throw memberError
    }

    // Marquer l'invitation comme acceptée
    try {
      await supabase.from('team_invitations').update({ accepted: true, accepted_at: new Date().toISOString() }).eq('id', invitation.id)
    } catch {
      // Non bloquant si la colonne n'existe pas
    }

    // Récupérer le nom de l'agence pour le retour
    const { data: agency } = await supabase.from('agencies').select('name').eq('id', targetAgencyId).single()

    return NextResponse.json({
      success: true,
      agencyId: targetAgencyId,
      agencyName: agency?.name || 'OmniFlow',
      role: invitation.role,
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}
