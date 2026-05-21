/**
 * Higgsfield API Client
 * https://higgsfield.ai
 */

export interface GenerationRequest {
  prompt: string
  style?: string
  duration?: number // seconds: 3, 5, 10
  model?: string
  aspectRatio?: string // 16:9, 9:16, 1:1
}

export interface GenerationResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  style?: string
  duration?: number
  videoUrl?: string
  thumbnail?: string
  error?: string
  createdAt: string
  completedAt?: string
}

export class HiggsFieldClient {
  private apiKey: string
  private baseURL: string = 'https://api.higgsfield.ai/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateVideo(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style || 'realistic',
          duration: request.duration || 5,
          model: request.model || 'higgs-1',
          aspect_ratio: request.aspectRatio || '16:9',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Generation request failed')
      }

      const data = await response.json()
      return {
        id: data.id,
        status: 'processing',
        prompt: request.prompt,
        style: request.style,
        duration: request.duration,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Higgsfield generation error:', error)
      throw error
    }
  }

  async checkStatus(generationId: string): Promise<GenerationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check generation status')
      }

      const data = await response.json()
      return {
        id: data.id,
        status: data.status,
        prompt: data.prompt,
        style: data.style,
        duration: data.duration,
        videoUrl: data.video_url,
        thumbnail: data.thumbnail_url,
        error: data.error,
        createdAt: data.created_at,
        completedAt: data.completed_at,
      }
    } catch (error) {
      console.error('Status check error:', error)
      throw error
    }
  }

  async listGenerations(limit: number = 50): Promise<GenerationResponse[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/generations?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to list generations')
      }

      const data = await response.json()
      return data.items.map((item: any) => ({
        id: item.id,
        status: item.status,
        prompt: item.prompt,
        style: item.style,
        duration: item.duration,
        videoUrl: item.video_url,
        thumbnail: item.thumbnail_url,
        createdAt: item.created_at,
        completedAt: item.completed_at,
      }))
    } catch (error) {
      console.error('List generations error:', error)
      throw error
    }
  }
}

export function createHiggsFieldClient(apiKey: string): HiggsFieldClient {
  return new HiggsFieldClient(apiKey)
}
