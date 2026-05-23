import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const { data: channels, error } = await supabase
      .from('telegram_channels')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    if (error && error.message.includes('does not exist')) {
      return NextResponse.json({ channels: [] })
    }
    if (error) throw error

    // Stats globales
    const totalPosts = (channels || []).reduce((s: number, c: any) => s + (c.total_posts || 0), 0)
    const postsPerDay = (channels || []).filter((c: any) => c.is_active).reduce((s: number, c: any) => s + (c.posts_per_day || 0), 0)
    const activeCount = (channels || []).filter((c: any) => c.is_active).length

    return NextResponse.json({
      channels: channels || [],
      stats: { activeCount, totalPosts, postsPerDay, channelCount: (channels || []).length },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const body = await request.json()
    const { channel_username, channel_name, model_id, posts_per_day, content_type, post_times, automation_level } = body

    if (!channel_username) return NextResponse.json({ error: 'channel_username requis' }, { status: 400 })

    const { data: channel, error } = await supabase
      .from('telegram_channels')
      .insert({
        agency_id: agency.id,
        channel_username: channel_username.startsWith('@') ? channel_username : `@${channel_username}`,
        channel_name: channel_name || channel_username,
        model_id: model_id || null,
        posts_per_day: posts_per_day || 3,
        content_type: content_type || 'text_image',
        post_times: post_times || ['09:00', '15:00', '21:00'],
        automation_level: automation_level || 'manual',
        is_active: true,
        total_posts: 0,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes('does not exist')) {
        // Table n'existe pas encore — on retourne un objet simulé
        return NextResponse.json({
          channel: { id: `local-${Date.now()}`, channel_username, channel_name: channel_name || channel_username, posts_per_day: posts_per_day || 3, is_active: true, total_posts: 0 },
          warning: 'Table telegram_channels non trouvée — données en mode démo',
        })
      }
      throw error
    }

    return NextResponse.json({ channel })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    const body = await request.json()
    const { id, ...patch } = body

    const { data, error } = await supabase
      .from('telegram_channels')
      .update(patch)
      .eq('id', id)
      .eq('agency_id', agency?.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ channel: data })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const { error } = await supabase.from('telegram_channels').delete().eq('id', id).eq('agency_id', agency?.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
