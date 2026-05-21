import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Profile error' }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.name || 'Mon Agence',
        avatar_url: profile?.avatar_url,
      },
      agency: {
        id: agency.id,
        name: agency.name,
      },
    })
  } catch (error) {
    console.error('GET /api/settings/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, timezone, currentPassword, newPassword, avatar_url } = body

    // Validate input
    if (newPassword && !currentPassword) {
      return NextResponse.json(
        { error: 'Current password required to change password' },
        { status: 400 }
      )
    }

    // Update agency name
    if (name) {
      const { error: updateError } = await supabase
        .from('agencies')
        .update({ name })
        .eq('owner_id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update agency' }, { status: 500 })
      }
    }

    // Update profile
    const profileUpdate: Record<string, any> = {}
    if (avatar_url) profileUpdate.avatar_url = avatar_url
    if (timezone) profileUpdate.timezone = timezone

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)

      if (profileError && profileError.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
    }

    // Update password if requested
    if (newPassword && currentPassword) {
      // Verify current password by attempting sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })

      if (signInError) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Update password
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updatePasswordError) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/settings/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
