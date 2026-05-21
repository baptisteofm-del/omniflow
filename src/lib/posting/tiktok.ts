/**
 * TikTok Open API Client
 * https://open.tiktok.com/
 */

export interface TikTokPostConfig {
  accessToken: string
  videoUrl: string
  caption: string
  coverImageUrl?: string
}

export interface TikTokPostResponse {
  id: string
  status: 'pending' | 'posted' | 'failed'
  url?: string
  error?: string
}

const TIKTOK_API_URL = 'https://open.tiktok.com/v1'

export async function postToTikTok(
  config: TikTokPostConfig
): Promise<TikTokPostResponse> {
  try {
    const response = await fetch(`${TIKTOK_API_URL}/video/publish/action/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: config.videoUrl,
        caption: config.caption,
        cover_image_url: config.coverImageUrl,
        privacy_level: 'PUBLIC_TO_EVERYONE',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to post to TikTok')
    }

    const data = await response.json()

    return {
      id: data.data.video_id,
      status: 'posted',
      url: `https://www.tiktok.com/@user/video/${data.data.video_id}`,
    }
  } catch (error) {
    console.error('TikTok post error:', error)
    return {
      id: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function validateTikTokToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${TIKTOK_API_URL}/user/info/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

export async function getTikTokUserInfo(accessToken: string) {
  try {
    const response = await fetch(`${TIKTOK_API_URL}/user/info/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get user info')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Get user info error:', error)
    return null
  }
}
