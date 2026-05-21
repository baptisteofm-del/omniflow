import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get agency ID from user
    const { data: userData } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const contentType = formData.get('type') as string || 'video'
    const platform = formData.get('platform') as string || 'instagram'
    const modelId = formData.get('modelId') as string | null
    const spoofed = formData.get('spoofed') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileName = `${Date.now()}_${file.name}`
    const filePath = `content/${userData.agency_id}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      )
    }

    // Get signed URL
    const { data: urlData } = supabase.storage
      .from('content')
      .getPublicUrl(filePath)

    // Save content record to database
    const { data: contentData, error: dbError } = await supabase
      .from('content')
      .insert({
        agency_id: userData.agency_id,
        model_id: modelId,
        type: contentType,
        source_url: urlData.publicUrl,
        spoofed: spoofed,
        platform: platform,
        status: 'ready',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: contentData.id,
        url: urlData.publicUrl,
        fileName: file.name,
        size: file.size,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
