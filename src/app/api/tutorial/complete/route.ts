import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tutorialId } = await request.json()

    if (!tutorialId || typeof tutorialId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid tutorialId' },
        { status: 400 }
      )
    }

    // Get agency ID
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Insert or ignore if already exists
    const { data, error } = await supabase
      .from('tutorial_progress')
      .insert({
        agency_id: agency.id,
        tutorial_id: tutorialId,
      })
      .select()

    if (error && error.code !== '23505') { // 23505 = unique violation
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Tutorial marked as completed' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Tutorial Complete]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
