import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Get agency ID from user
    const { data: userData } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { contentId, platforms, caption, scheduledAt, modelId } = body

    if (!contentId || !platforms || !caption || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save scheduled post
    const { data: scheduledPost, error: dbError } = await supabase
      .from('scheduled_posts')
      .insert({
        agency_id: userData.agency_id,
        content_id: contentId,
        platforms: platforms,
        caption: caption,
        scheduled_at: scheduledAt,
        model_id: modelId || null,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: scheduledPost.id,
        scheduledAt: scheduledPost.scheduled_at,
        status: 'pending',
      },
    })
  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scheduling failed' },
      { status: 500 }
    )
  }
}
