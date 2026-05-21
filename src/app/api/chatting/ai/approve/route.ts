import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId, action, modifiedContent } = await request.json()

    // action: 'approve', 'reject', or 'modify'

    if (action === 'approve') {
      const { error } = await supabase
        .from('ai_messages')
        .update({ approved: true })
        .eq('id', messageId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // TODO: Send via OF/MYM API

      return NextResponse.json({ success: true, status: 'approved' })
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('ai_messages')
        .update({ approved: false })
        .eq('id', messageId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, status: 'rejected' })
    }

    if (action === 'modify') {
      const { error } = await supabase
        .from('ai_messages')
        .update({ content: modifiedContent, approved: true })
        .eq('id', messageId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // TODO: Send via OF/MYM API with modified content

      return NextResponse.json({ success: true, status: 'modified' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error approving message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
