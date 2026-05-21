import { NextRequest, NextResponse } from 'next/server'
import { analyzeScript } from '@/lib/ai/chatting'
import { getAuth } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth()
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scriptContent, category } = await request.json()

    if (!scriptContent || !category) {
      return NextResponse.json(
        { error: 'Missing scriptContent or category' },
        { status: 400 }
      )
    }

    const analysis = await analyzeScript(scriptContent, category)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing script:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
