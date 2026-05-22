import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@/lib/supabase/server'

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', auth.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get models
    const { data: models, error } = await supabase
      .from('models')
      .select('id, name')
      .eq('agency_id', agency.id)
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
