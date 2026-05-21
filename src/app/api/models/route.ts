import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Get models with their profiles
    const { data: models, error: modelError } = await supabase
      .from('models')
      .select('*')
      .eq('agency_id', profile.agency_id)

    if (modelError) throw modelError

    // Get all profiles for these models
    const modelIds = models?.map(m => m.id) || []
    let profiles: any[] = []
    if (modelIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('model_profiles')
        .select('*')
        .in('model_id', modelIds)

      if (profileError) throw profileError
      profiles = profileData || []
    }

    // Combine models with their profiles
    const enrichedModels = models?.map(m => ({
      ...m,
      profiles: profiles.filter(p => p.model_id === m.id),
    })) || []

    return NextResponse.json({ models: enrichedModels })
  } catch (error) {
    console.error('Models error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, chatting_platforms, social_networks } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    if ((!chatting_platforms || chatting_platforms.length === 0) && 
        (!social_networks || social_networks.length === 0)) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    // Create model with both platform types
    const { data: model, error: modelError } = await supabase
      .from('models')
      .insert({
        agency_id: profile.agency_id,
        name,
        chatting_platforms: chatting_platforms || [],
        social_networks: social_networks || [],
        status: 'active',
      })
      .select()
      .single()

    if (modelError) throw modelError

    return NextResponse.json({
      success: true,
      model,
    })
  } catch (error) {
    console.error('Model create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create model' },
      { status: 500 }
    )
  }
}
