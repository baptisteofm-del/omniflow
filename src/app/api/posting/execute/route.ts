import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { postToInstagram } from '@/lib/posting/instagram'
import { postToTelegram } from '@/lib/posting/telegram'
import { postToTikTok } from '@/lib/posting/tiktok'

/**
 * This endpoint is called by Vercel Cron (daily at 12:00 UTC)
 * to execute pending scheduled posts
 * 
 * Note: For Pro plan, can be changed to more frequent execution (e.g., every 5 minutes)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('authorization')
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all pending posts that should be executed now
    const now = new Date().toISOString()
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .limit(10)

    if (fetchError) {
      throw new Error(`Failed to fetch posts: ${fetchError.message}`)
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({
        success: true,
        executed: 0,
        message: 'No posts to execute',
      })
    }

    let executed = 0
    let failed = 0

    for (const post of pendingPosts) {
      try {
        // Get content from database
        const { data: content } = await supabase
          .from('content')
          .select('source_url')
          .eq('id', post.content_id)
          .single()

        if (!content) {
          throw new Error('Content not found')
        }

        // Execute on each platform
        for (const platform of post.platforms) {
          try {
            if (platform === 'instagram') {
              // TODO: Get Instagram token from user integrations
              // await postToInstagram({...})
            } else if (platform === 'telegram') {
              // TODO: Get Telegram token from user integrations
              // await postToTelegram({...})
            } else if (platform === 'tiktok') {
              // TODO: Get TikTok token from user integrations
              // await postToTikTok({...})
            }
          } catch (platformError) {
            console.error(`Platform ${platform} error:`, platformError)
            failed++
            continue
          }
        }

        // Update post status
        await supabase
          .from('scheduled_posts')
          .update({ status: 'posted', posted_at: new Date().toISOString() })
          .eq('id', post.id)

        executed++
      } catch (postError) {
        console.error(`Post ${post.id} error:`, postError)

        // Update with error status
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error: postError instanceof Error ? postError.message : 'Unknown error',
          })
          .eq('id', post.id)

        failed++
      }
    }

    return NextResponse.json({
      success: true,
      executed,
      failed,
      total: pendingPosts.length,
    })
  } catch (error) {
    console.error('Cron execute error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    )
  }
}
