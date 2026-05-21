/**
 * GET /api/trends
 * 
 * Récupère les trends sauvegardés en base pour l'agence connectée,
 * avec support des filtres : platform, category, limit.
 * 
 * Query params:
 * - platform: 'tiktok' | 'instagram' | 'twitter' | 'reddit' | 'all' (default)
 * - category: string (optional, e.g., 'fitness')
 * - limit: number (default 20)
 * 
 * Returns: { success: boolean; trends: Trend[]; total: number; error?: string }
 */

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

interface TrendRow {
  id: string
  platform: string
  title: string
  url: string
  thumbnail_url: string | null
  engagement: number
  category: string
  tags: string[]
  captured_at: string
}

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url)
    const platform = url.searchParams.get('platform') || 'all'
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)

    // Récupérer l'utilisateur depuis le token
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-auth-token')?.value

    if (!authToken) {
      return Response.json(
        { success: false, error: 'Unauthorized', trends: [], total: 0 },
        { status: 401 }
      )
    }

    // Initialiser Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      }
    )

    // Récupérer l'agence de l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return Response.json(
        { success: false, error: 'User not found', trends: [], total: 0 },
        { status: 401 }
      )
    }

    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', userData.user.id)
      .single()

    if (agencyError || !agencyData) {
      return Response.json(
        { success: false, error: 'Agency not found', trends: [], total: 0 },
        { status: 404 }
      )
    }

    const agencyId = agencyData.id

    // Construire la requête
    let query = supabase
      .from('trends')
      .select('*')
      .eq('agency_id', agencyId)
      .order('captured_at', { ascending: false })

    // Appliquer les filtres
    if (platform !== 'all') {
      query = query.eq('platform', platform)
    }

    if (category) {
      query = query.eq('category', category)
    }

    // Récupérer les données
    const { data: trendsData, error: trendsError, count } = await query.limit(limit)

    if (trendsError) {
      console.error('Supabase query error:', trendsError)
      return Response.json(
        { success: false, error: trendsError.message, trends: [], total: 0 },
        { status: 500 }
      )
    }

    // Transformer les données au format attendu
    const trends = (trendsData as TrendRow[]).map(t => ({
      id: t.id,
      platform: t.platform as 'tiktok' | 'instagram' | 'twitter' | 'reddit',
      title: t.title,
      url: t.url,
      thumbnailUrl: t.thumbnail_url,
      engagement: t.engagement,
      category: t.category,
      tags: t.tags || [],
      capturedAt: new Date(t.captured_at),
    }))

    return Response.json({
      success: true,
      trends,
      total: count || 0,
    })
  } catch (error) {
    console.error('Trends GET error:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        trends: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
