import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const modelId = formData.get('modelId') as string

    if (!file || !modelId) {
      return NextResponse.json(
        { error: 'Missing file or modelId' },
        { status: 400 }
      )
    }

    // Verify model belongs to agency
    const { data: model } = await supabase
      .from('models')
      .select('id, agency_id')
      .eq('id', modelId)
      .single()

    if (!model || model.agency_id !== agency.id) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get file extension
    const ext = file.type.split('/')[1] || 'jpg'
    const fileName = `${agency.id}/${modelId}.${ext}`

    // Upload to Supabase Storage (admin client bypasses RLS)
    const adminSupabase = await createAdminClient()
    const { error: uploadError } = await adminSupabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = adminSupabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const avatarUrl = data.publicUrl

    // Update model with avatar URL
    const { error: updateError } = await supabase
      .from('models')
      .update({ avatar_url: avatarUrl })
      .eq('id', modelId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
