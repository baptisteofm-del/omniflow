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

    // Get team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id, email, role, joined_at')
      .eq('agency_id', agency.id)
      .order('joined_at', { ascending: false })

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

    // Fallback si pas de table profiles
    const ownerEmail = ownerProfile?.email || user.email || 'Propriétaire'

    return NextResponse.json({
      owner: {
        id: agency.owner_id,
        email: ownerEmail,
        name: ownerProfile?.full_name || null,
        role: 'owner',
        status: 'active',
        joined_at: null, // créateur de l'agence
      },
      members: members || [],
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

    const body = await req.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    if (!['member', 'admin', 'owner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('email', email)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Check if already invited
    const { data: existingInvitation } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('email', email)
      .eq('accepted', false)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .insert({
        agency_id: agency.id,
        email,
        role,
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Invitation error:', invitationError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // TODO: Send email invitation with token

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/settings/team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const body = await req.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
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
