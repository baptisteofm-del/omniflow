import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { agencyId } = await request.json()
    
    if (!agencyId) {
      return NextResponse.json(
        { error: 'agencyId is required' },
        { status: 400 }
      )
    }

    // Verify user owns this agency
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('id, owner_id')
      .eq('id', agencyId)
      .single()

    if (fetchError || !agency || agency.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Agency not found or not owned by user' },
        { status: 403 }
      )
    }

    // Mark onboarding as completed
    const { error: updateError } = await supabase
      .from('agencies')
      .update({ onboarding_completed: true })
      .eq('id', agencyId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
