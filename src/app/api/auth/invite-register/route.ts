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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }
    // Valider le nom (pas de caractères de contrôle, longueur raisonnable)
    const cleanName = (name || '').trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 100)
    if (!cleanName) {
      // Fallback: utiliser la partie locale de l'email comme nom
      const fallbackName = email.split('@')[0].replace(/[._+-]/g, ' ').trim()
      Object.assign(body, { name: fallbackName })
    } else {
      Object.assign(body, { name: cleanName })
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

    // ── 2. Créer le compte ou récupérer l'utilisateur existant ───
    let userId: string
    let isNewUser = false

    // Essayer de créer le compte
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
      
      // Erreur "already exists" → récupérer l'user via admin API
      if (createError.message?.includes('already') || createError.code === 'user_already_exists') {
        try {
          // Chercher l'utilisateur existant
          const { data: existingUsersData } = await admin.auth.admin.listUsers()
          const existingUser = existingUsersData?.users?.find(
            u => u.email?.toLowerCase() === email.toLowerCase()
          )
          
          if (existingUser) {
            userId = existingUser.id
            console.log(`User already exists: ${userId}`)
          } else {
            return NextResponse.json(
              { error: 'Un compte existe déjà avec cet email. Utilisez "Se connecter".' },
              { status: 409 }
            )
          }
        } catch (listError) {
          console.error('Error listing users:', listError)
          return NextResponse.json(
            { error: 'Erreur lors de la vérification du compte existant' },
            { status: 500 }
          )
        }
      } else {
        // Autres erreurs Supabase
        console.error('Supabase auth error:', createError)
        return NextResponse.json(
          { error: `Erreur lors de la création du compte: ${createError.message || 'Unknown error'}` },
          { status: 400 }
        )
      }
    } else {
      if (!newUser?.user) {
        return NextResponse.json(
          { error: 'Création du compte échouée' },
          { status: 500 }
        )
      }
      userId = newUser.user.id
      isNewUser = true
    }

    // ── 3. Corriger le profil et supprimer l'agence fantôme ──────
    // IMPORTANT: Le trigger handle_new_user crée automatiquement une
    // agence + profil pour chaque nouvel utilisateur. Pour les invités,
    // on doit corriger le profil et supprimer l'agence fantôme.
    if (isNewUser) {
      try {
        // Récupérer les agences fantômes créées par le trigger
        const { data: phantomAgencies } = await admin
          .from('agencies')
          .select('id')
          .eq('owner_id', userId)

        // Mettre à jour le profil pour pointer vers la bonne agence
        const { error: profileUpsertError } = await admin
          .from('profiles')
          .upsert({
            id: userId,
            full_name: body.name || email.split('@')[0],
            role: invitation.role || 'member',
            agency_id: targetAgencyId,
          }, { onConflict: 'id' })

        if (profileUpsertError) {
          console.warn('Profile upsert warning:', profileUpsertError)
        }

        // Supprimer les agences fantômes (différentes de targetAgencyId)
        for (const phantom of (phantomAgencies || [])) {
          if (phantom.id !== targetAgencyId) {
            try {
              // Mettre à jour le profil d'abord pour éviter les FK violations
              // (déjà fait ci-dessus), puis supprimer l'agence fantôme
              await admin.from('agencies').delete().eq('id', phantom.id)
            } catch (delErr) {
              console.warn('Could not delete phantom agency:', phantom.id, delErr)
            }
          }
        }
      } catch (cleanupError) {
        console.warn('Post-creation cleanup warning:', cleanupError)
        // Ne pas bloquer — l'utilisateur peut quand même se connecter
      }
    } else {
      // Utilisateur existant: s'assurer que le profil est correct
      try {
        await admin
          .from('profiles')
          .update({ agency_id: targetAgencyId, role: invitation.role || 'member' })
          .eq('id', userId)
      } catch (profileUpdateError) {
        console.warn('Profile update warning:', profileUpdateError)
      }
    }

    // ── 4. Vérifier si l'utilisateur est déjà membre de l'agence ──
    const { data: existingMember } = await admin
      .from('team_members')
      .select('id')
      .eq('agency_id', targetAgencyId)
      .eq('user_id', userId)
      .maybeSingle()

    // ── 5. Ajouter le membre à l'agence (si pas déjà membre) ──────
    if (!existingMember) {
      const memberData = {
        agency_id: targetAgencyId,
        user_id: userId,
        email: email.toLowerCase(),
        role: invitation.role || 'member',
        joined_at: new Date().toISOString(),
        status: 'active',
        permissions: [],
      }

      const { error: memberError } = await admin.from('team_members').insert(memberData)

      if (memberError) {
        // Si c'est un duplicate key error (23505), ignorer car le membre existe déjà
        if (memberError.code === '23505') {
          console.log('Member already exists (duplicate)')
        } else {
          console.error('Insert team member error:', memberError)
          throw memberError
        }
      }
    }

    // ── 6. Marquer l'invitation comme acceptée ───────────────
    await admin
      .from('team_invitations')
      .update({
        accepted: true,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    // ── 7. Récupérer le nom de l'agence ─────────────────────
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
