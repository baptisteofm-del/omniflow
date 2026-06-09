import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVideo } from '@/lib/kling/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { prompt, negativePrompt, model, duration, aspectRatio, imageUrl } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })

  try {
    // Vérifier quota générations IA
    const { data: agencyForLimit } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (agencyForLimit) {
      const { checkLimit, limitReachedResponse } = await import('@/lib/plans/limits')
      const quotaCheck = await checkLimit(agencyForLimit.id, 'aiGenerations')
      if (!quotaCheck.allowed) {
        return NextResponse.json(limitReachedResponse(quotaCheck, 'Génération Kling'), { status: 429 })
      }
    }

    const taskId = await generateVideo({ prompt, negativePrompt, model, duration, aspectRatio, imageUrl })

    // Sauvegarder en base
    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (agency) {
      await supabase.from('content').insert({
        agency_id: agency.id,
        type: 'video',
        status: 'processing',
        source_url: `kling:${taskId}`,
        platform: 'omniflow',
      })
    }

    return NextResponse.json({ taskId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur génération'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
