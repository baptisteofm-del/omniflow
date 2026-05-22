import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const approved = searchParams.get('approved')

    // Get user's agency
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', auth.user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    let query = supabase
      .from('ai_messages')
      .select(
        `
        id,
        content,
        direction,
        ai_generated,
        approved,
        sent_at,
        fan_profile:fan_profile_id(fan_name)
      `
      )
      .eq('agency_id', agency.id)
      .eq('direction', 'outgoing')

    // Filter by approval status
    if (approved === 'null') {
      query = query.is('approved', null)
    } else if (approved === 'true') {
      query = query.eq('approved', true)
    } else if (approved === 'false') {
      query = query.eq('approved', false)
    }

    const { data: messages, error } = await query
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
