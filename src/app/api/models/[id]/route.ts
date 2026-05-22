import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Verify model belongs to agency
    const { data: model } = await supabase
      .from('models')
      .select('id, agency_id')
      .eq('id', id)
      .single()

    if (!model || model.agency_id !== agency.id) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      avatar_url,
      bio,
      chatting_platforms,
      social_networks,
      linked_integration_id,
      linked_platform,
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (bio !== undefined) updateData.bio = bio
    if (chatting_platforms !== undefined) updateData.chatting_platforms = chatting_platforms
    if (social_networks !== undefined) updateData.social_networks = social_networks
    if (linked_integration_id !== undefined) updateData.linked_integration_id = linked_integration_id
    if (linked_platform !== undefined) updateData.linked_platform = linked_platform

    const { data: updatedModel, error: updateError } = await supabase
      .from('models')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      model: updatedModel,
    })
  } catch (error) {
    console.error('Model update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get agency ID
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency?.id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Verify model belongs to agency
    const { data: model, error: fetchError } = await supabase
      .from('models')
      .select('id, agency_id')
      .eq('id', id)
      .single()

    if (fetchError || !model || model.agency_id !== agency.id) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Delete model (cascade will handle model_profiles)
    const { error: deleteError } = await supabase
      .from('models')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Model delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete model' },
      { status: 500 }
    )
  }
}
