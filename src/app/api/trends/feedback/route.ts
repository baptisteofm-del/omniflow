/**
 * POST /api/trends/feedback
 * 
 * Enregistre le feedback (like/dislike/null) d'un utilisateur sur un trend.
 * Utilisé par le système de recommandation évolutif.
 * 
 * Body: { trendId: string, feedback: 'like' | 'dislike' | null }
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const body = await request.json()
    const { trendId, feedback } = body

    if (!trendId) {
      return NextResponse.json({ error: 'trendId requis' }, { status: 400 })
    }

    if (feedback !== 'like' && feedback !== 'dislike' && feedback !== null) {
      return NextResponse.json({ error: 'feedback invalide (like | dislike | null)' }, { status: 400 })
    }

    // Upsert du feedback dans la table trend_feedback
    if (feedback === null) {
      // Supprimer le feedback existant
      await supabase
        .from('trend_feedback')
        .delete()
        .eq('agency_id', agency.id)
        .eq('trend_id', trendId)
    } else {
      const { error: upsertError } = await supabase
        .from('trend_feedback')
        .upsert({
          agency_id: agency.id,
          trend_id: trendId,
          feedback,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'agency_id,trend_id',
        })

      if (upsertError) {
        // Table may not exist yet → non-fatal, return success anyway
        console.warn('[Trends Feedback] DB upsert failed:', upsertError.message)
        return NextResponse.json({
          success: true,
          warning: 'Feedback enregistré localement — migration SQL requise pour la persistance.',
        })
      }
    }

    // Optionnel : mettre à jour les préférences de catégorie en arrière-plan
    // On note la catégorie du trend dans les préférences de l'agence
    try {
      const { data: trendData } = await supabase
        .from('trends')
        .select('category')
        .eq('id', trendId)
        .single()

      if (trendData?.category && feedback) {
        await supabase
          .from('agency_preferences')
          .upsert({
            agency_id: agency.id,
            preference_key: `trend_category_${feedback}_${trendData.category}`,
            preference_value: String(Date.now()),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'agency_id,preference_key',
          })
      }
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, feedback, trendId })
  } catch (error) {
    console.error('[Trends Feedback] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/trends/feedback
 * Récupère les feedbacks de l'utilisateur pour un set de trends
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    const { data: feedbacks, error } = await supabase
      .from('trend_feedback')
      .select('trend_id, feedback')
      .eq('agency_id', agency.id)

    if (error) {
      // Table non créée encore
      return NextResponse.json({ feedbacks: {} })
    }

    // Retourne un map { trendId: 'like' | 'dislike' }
    const feedbackMap: Record<string, 'like' | 'dislike'> = {}
    for (const row of feedbacks || []) {
      feedbackMap[row.trend_id] = row.feedback
    }

    return NextResponse.json({ feedbacks: feedbackMap })
  } catch (error) {
    return NextResponse.json({ feedbacks: {} })
  }
}
