import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const fanProfileId = searchParams.get('fanProfileId')

    if (!fanProfileId) {
      return NextResponse.json({ error: 'fanProfileId is required' }, { status: 400 })
    }

    // Get notes for this fan
    const { data: notes, error: notesError } = await supabase
      .from('fan_notes')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('fan_profile_id', fanProfileId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (notesError) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({
      notes: (notes || []).map(note => ({
        id: note.id,
        fanProfileId: note.fan_profile_id,
        note: note.note,
        category: note.category,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const { fanProfileId, note, category } = await request.json()

    if (!fanProfileId || !note) {
      return NextResponse.json(
        { error: 'fanProfileId and note are required' },
        { status: 400 }
      )
    }

    // Verify that fan profile belongs to this agency
    const { data: fanProfile, error: fanError } = await supabase
      .from('fan_profiles')
      .select('id')
      .eq('id', fanProfileId)
      .eq('agency_id', agency.id)
      .single()

    if (fanError || !fanProfile) {
      return NextResponse.json({ error: 'Fan profile not found' }, { status: 404 })
    }

    // Create note
    const { data: createdNote, error: createError } = await supabase
      .from('fan_notes')
      .insert({
        agency_id: agency.id,
        fan_profile_id: fanProfileId,
        note,
        category: category || 'general',
      })
      .select()
      .single()

    if (createError) {
      console.error('Create error:', createError)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    return NextResponse.json(
      {
        id: createdNote.id,
        fanProfileId: createdNote.fan_profile_id,
        note: createdNote.note,
        category: createdNote.category,
        createdAt: createdNote.created_at,
        updatedAt: createdNote.updated_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json({ error: 'noteId is required' }, { status: 400 })
    }

    // Verify note belongs to this agency
    const { data: note, error: noteError } = await supabase
      .from('fan_notes')
      .select('id')
      .eq('id', noteId)
      .eq('agency_id', agency.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Delete note
    const { error: deleteError } = await supabase
      .from('fan_notes')
      .delete()
      .eq('id', noteId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
