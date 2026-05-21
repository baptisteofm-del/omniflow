/**
 * Instagram Graph API Client
 * https://developers.facebook.com/docs/instagram-graph-api
 */

export interface InstagramPostConfig {
  caption: string
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO' // VIDEO requires 3-60 seconds
  accessToken: string
  pageId: string
}

export interface InstagramPostResponse {
  id: string
  status: 'pending' | 'posted' | 'failed'
  url?: string
  error?: string
}

export async function postToInstagram(
  config: InstagramPostConfig
): Promise<InstagramPostResponse> {
  try {
    // First, create the media object
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v18.0/${config.pageId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: config.mediaUrl,
          caption: config.caption,
          access_token: config.accessToken,
        }),
      }
    )

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json()
      throw new Error(error.error?.message || 'Failed to create media')
    }

    const mediaData = await mediaResponse.json()

    // Then publish it
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${config.pageId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: config.accessToken,
        }),
      }
    )

    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(error.error?.message || 'Failed to publish media')
    }

    const publishData = await publishResponse.json()

    return {
      id: publishData.id,
      status: 'posted',
      url: `https://instagram.com/p/${publishData.id}`,
    }
  } catch (error) {
    console.error('Instagram post error:', error)
    return {
      id: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function validateInstagramToken(
  accessToken: string,
  pageId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${pageId}?fields=name&access_token=${accessToken}`
    )
    return response.ok
  } catch {
    return false
  }
}
