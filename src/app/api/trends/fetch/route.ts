/**
 * POST /api/trends/fetch
 * 
 * Récupère les trends depuis les sources publiques et les sauvegarde
 * dans la base de données Supabase pour l'agence actuelle.
 * 
 * Returns: { success: boolean; trendsCount: number; error?: string }
 */

import { createClient } from '@supabase/supabase-js'
import { fetchAllTrends } from '@/lib/trends/fetcher'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Récupérer l'utilisateur depuis le token d'authentification
    const cookieStore = await cookies()
    const authToken = cookieStore.get('sb-auth-token')?.value

    if (!authToken) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'User not found' },
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
        { success: false, error: 'Agency not found' },
        { status: 404 }
      )
    }

    const agencyId = agencyData.id

    // Récupérer tous les trends depuis les sources publiques
    const trends = await fetchAllTrends()

    // Préparer les données pour Supabase
    const trendsData = trends.map(trend => ({
      agency_id: agencyId,
      platform: trend.platform,
      title: trend.title,
      url: trend.url,
      thumbnail_url: trend.thumbnailUrl || null,
      engagement: trend.engagement,
      category: trend.category,
      tags: trend.tags,
      captured_at: new Date().toISOString(),
    }))

    // Insérer dans la base de données
    const { data: insertedTrends, error: insertError } = await supabase
      .from('trends')
      .insert(trendsData)
      .select('id')

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return Response.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      trendsCount: insertedTrends?.length || 0,
    })
  } catch (error) {
    console.error('Trends fetch error:', error)
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
