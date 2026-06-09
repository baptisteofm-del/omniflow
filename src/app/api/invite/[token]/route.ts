import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/invite/[token]
 * 
 * Endpoint PUBLIC pour vérifier une invitation
 * Retourne les infos de l'invitation et la marque comme "opened"
 * 
 * Réponse:
 * - 200: Invitation valide { agency_name, email, role, status }
 * - 404: Token invalide
 * - 410: Invitation expirée/annulée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Récupérer l'invitation
    const { data: invitation, error: invError } = await admin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (invError) {
      console.error('Invitation query error:', invError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'invitation' },
        { status: 500 }
      )
    }

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation introuvable ou invalide' },
        { status: 404 }
      )
    }

    // Vérifier le statut et expiration
    if (invitation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cette invitation a été annulée' },
        { status: 410 }
      )
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Cette invitation a déjà été acceptée' },
        { status: 410 }
      )
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      // Marquer comme expirée
      await admin
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'Cette invitation a expiré (7 jours). Demandez un nouveau lien.' },
        { status: 410 }
      )
    }

    // Marquer comme "opened" si en statut "pending"
    if (invitation.status === 'pending') {
      await admin
        .from('team_invitations')
        .update({ status: 'opened', opened_at: new Date().toISOString() })
        .eq('id', invitation.id)
    }

    // Récupérer le nom de l'agence
    const { data: agency } = await admin
      .from('agencies')
      .select('name')
      .eq('id', invitation.agency_id)
      .single()

    return NextResponse.json({
      success: true,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      agency_name: agency?.name || 'OmniFlow',
      agency_id: invitation.agency_id,
      expires_at: invitation.expires_at,
    })
  } catch (error) {
    console.error('GET /api/invite/[token]:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
