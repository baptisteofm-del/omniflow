import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/invite-register
 *
 * Création de compte pour un utilisateur invité.
 * Utilise le client admin Supabase pour :
 *   1. Valider le token d'invitation
 *   2. Créer le compte avec email_confirm: true (bypass confirmation email)
 *   3. Accepter automatiquement l'invitation (insertion dans team_members)
 *
 * Le client peut ensuite appeler signInWithPassword immédiatement.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, token, agencyId } = body

    // ── Validation des champs ────────────────────────────────
    if (!email || !password || !token || !agencyId) {
      return NextResponse.json(
        { error: 'Champs requis : email, password, token, agencyId' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // ── 1. Valider l'invitation ──────────────────────────────
    const { data: invitation } = await admin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle()

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable. Le lien est invalide ou a expiré." },
        { status: 404 }
      )
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Ce lien d'invitation a expiré. Demandez un nouveau lien à l'administrateur." },
        { status: 410 }
      )
    }

    if (invitation.accepted) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée." },
        { status: 409 }
      )
    }

    // Vérifier que l'email correspond
    if (invitation.email && invitation.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: `Cette invitation est destinée à ${invitation.email}. Utilisez cette adresse email.` },
        { status: 403 }
      )
    }

    const targetAgencyId = invitation.agency_id || agencyId

    // ── 2. Vérifier si le compte existe déjà ────────────────
    const { data: existingUsers } = await admin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string

    if (existingUser) {
      // L'utilisateur existe déjà → vérifier s'il est déjà membre
      userId = existingUser.id
      const { data: existingMember } = await admin
        .from('team_members')
        .select('id')
        .eq('agency_id', targetAgencyId)
        .eq('user_id', userId)
        .maybeSingle()

      if (existingMember) {
        // Déjà membre → marquer invitation comme acceptée et laisser le client se connecter
        await admin
          .from('team_invitations')
          .update({ accepted: true, accepted_at: new Date().toISOString() })
          .eq('id', invitation.id)
        return NextResponse.json({ success: true, alreadyMember: true })
      }
    } else {
      // ── 3. Créer le compte avec email confirmé ─────────────
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,   // ← Bypass de la confirmation email
        user_metadata: {
          full_name: name || '',
          is_team_member: true,
          agency_id: targetAgencyId,
        },
      })

      if (createError) {
        console.error('createUser error:', createError)
        // Erreur "already exists" → récupérer l'user
        if (createError.message?.includes('already')) {
          return NextResponse.json(
            { error: 'Un compte existe déjà avec cet email. Utilisez "Se connecter".' },
            { status: 409 }
          )
        }
        throw createError
      }

      if (!newUser?.user) {
        throw new Error('Création du compte échouée')
      }

      userId = newUser.user.id

      // Créer le profil (uniquement les colonnes qui existent)
      await admin.from('profiles').upsert({
        id: userId,
        full_name: name || '',
      }).eq('id', userId)
    }

    // ── 4. Ajouter le membre à l'agence ─────────────────────
    // Note: colonnes minimales compatibles avec le schéma existant
    const memberData: any = {
      agency_id: targetAgencyId,
      user_id: userId,
      email: email.toLowerCase(),
      role: invitation.role || 'member',
      joined_at: new Date().toISOString(),
    }
    // Ajouter status/permissions uniquement si les colonnes existent (migration future)
    // Ces colonnes seront ignorées si absentes grâce au try/catch
    let memberError: any = null
    try {
      const res1 = await admin.from('team_members').insert({ ...memberData, status: 'active' })
      memberError = res1.error
      if (memberError && (memberError.code === '42703' || memberError.message?.includes('column'))) {
        // Colonne status absente → insérer sans
        const res2 = await admin.from('team_members').insert(memberData)
        memberError = res2.error
      }
    } catch (e) {
      memberError = e
    }

    if (memberError && memberError.code !== '23505') {
      console.error('Insert team member error:', memberError)
      throw memberError
    }

    // ── 5. Marquer l'invitation comme acceptée ───────────────
    await admin
      .from('team_invitations')
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    // ── 6. Récupérer le nom de l'agence ─────────────────────
    const { data: agency } = await admin
      .from('agencies')
      .select('name')
      .eq('id', targetAgencyId)
      .single()

    return NextResponse.json({
      success: true,
      agencyName: agency?.name || 'OmniFlow',
      role: invitation.role,
    })
  } catch (error) {
    console.error('invite-register error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
