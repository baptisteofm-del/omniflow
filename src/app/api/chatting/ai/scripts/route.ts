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

    // Get user's agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', auth.user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get scripts
    const { data: scripts, error } = await supabase
      .from('chat_scripts')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scripts })
  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, category, content, variables } = await request.json()

    // Get user's agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', auth.user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Create script
    const { data: script, error } = await supabase
      .from('chat_scripts')
      .insert({
        agency_id: agency.id,
        name,
        category,
        content,
        variables: variables || [],
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ script: script?.[0] })
  } catch (error) {
    console.error('Error creating script:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scriptId } = await request.json()

    const { error } = await supabase
      .from('chat_scripts')
      .delete()
      .eq('id', scriptId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting script:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
