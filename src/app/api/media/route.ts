import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)

    const filterType = searchParams.get('type')
    const filterSource = searchParams.get('source')
    const modelId = searchParams.get('model_id')

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

    let query = supabase
      .from('media_files')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    if (filterType && filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    if (filterSource && filterSource !== 'all') {
      query = query.eq('source', filterSource)
    }

    if (modelId) {
      query = query.eq('model_id', modelId)
    }

    const { data: files, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ files: files || [] })
  } catch (error) {
    console.error('[Media API] GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await req.formData()

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

    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${agency.id}/${fileName}`

    const buffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Determine file type
    const type = file.type.startsWith('video') ? 'video' : 'image'

    // Insert into database
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media_files')
      .insert([
        {
          agency_id: agency.id,
          name: file.name,
          storage_path: filePath,
          public_url: publicUrl,
          type,
          size_bytes: file.size,
          source: 'upload',
          tags: [],
        },
      ])
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json(mediaRecord, { status: 201 })
  } catch (error) {
    console.error('[Media API] POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }

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

    // Get media file info
    const { data: mediaFile } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', mediaId)
      .eq('agency_id', agency.id)
      .single()

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from storage
    if (mediaFile.storage_path) {
      await supabase.storage.from('media').remove([mediaFile.storage_path])
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', mediaId)
      .eq('agency_id', agency.id)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Media API] DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
