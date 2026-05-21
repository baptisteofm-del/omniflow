import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Get all prospects for this agency
    const { data: prospects } = await supabase
      .from('prospects')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    // Organize by status
    const pipeline = {
      discovered: prospects?.filter((p) => p.status === 'discovered') || [],
      contacted: prospects?.filter((p) => p.status === 'contacted') || [],
      discussing: prospects?.filter((p) => p.status === 'discussing') || [],
      signed: prospects?.filter((p) => p.status === 'signed') || [],
    }

    return NextResponse.json({ pipeline })
  } catch (error) {
    console.error('Error fetching pipeline:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { prospectId, status, notes } = await request.json()

    if (!prospectId || !status) {
      return NextResponse.json(
        { error: 'prospectId and status are required' },
        { status: 400 }
      )
    }

    // Verify prospect belongs to user's agency
    const { data: prospect } = await supabase
      .from('prospects')
      .select('agency_id')
      .eq('id', prospectId)
      .single()

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      )
    }

    // Verify agency belongs to user
    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('id', prospect.agency_id)
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update prospect
    const updateData: any = { status }
    if (notes !== undefined) {
      updateData.notes = notes
    }
    updateData.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from('prospects')
      .update(updateData)
      .eq('id', prospectId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, prospect: updated })
  } catch (error) {
    console.error('Error updating prospect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
