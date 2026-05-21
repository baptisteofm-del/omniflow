import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 404 })
    }

    // Verify model belongs to agency
    const { data: model, error: fetchError } = await supabase
      .from('models')
      .select('id, agency_id')
      .eq('id', id)
      .single()

    if (fetchError || !model || model.agency_id !== profile.agency_id) {
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
