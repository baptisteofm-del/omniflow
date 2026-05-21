// Kling AI — Client API pour génération vidéo
import crypto from 'crypto'

const KLING_API_URL = 'https://api.klingai.com'
const ACCESS_KEY = process.env.KLING_ACCESS_KEY!
const SECRET_KEY = process.env.KLING_SECRET_KEY!

// Générer le JWT pour l'auth Kling
function generateToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const payload = Buffer.from(JSON.stringify({
    iss: ACCESS_KEY,
    exp: now + 1800,
    nbf: now - 5,
  })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${sig}`
}

async function klingRequest(path: string, method = 'GET', body?: object) {
  const res = await fetch(`${KLING_API_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${generateToken()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Kling error ${res.status}: ${await res.text()}`)
  return res.json()
}

export type KlingModel = 'kling-v1' | 'kling-v1-5' | 'kling-v2'
export type KlingDuration = '5' | '10'
export type KlingAspect = '16:9' | '9:16' | '1:1'

export interface GenerateVideoParams {
  prompt: string
  negativePrompt?: string
  model?: KlingModel
  duration?: KlingDuration
  aspectRatio?: KlingAspect
  imageUrl?: string  // Pour image-to-video
}

export interface KlingGeneration {
  taskId: string
  status: 'submitted' | 'processing' | 'succeed' | 'failed'
  videoUrl?: string
  coverUrl?: string
  duration?: string
  prompt: string
  createdAt: number
}

// Générer une vidéo text-to-video
export async function generateVideo(params: GenerateVideoParams): Promise<string> {
  const endpoint = params.imageUrl
    ? '/v1/videos/image2video'
    : '/v1/videos/text2video'

  const body: Record<string, unknown> = {
    model_name: params.model || 'kling-v1-5',
    prompt: params.prompt,
    negative_prompt: params.negativePrompt || 'blurry, low quality, watermark',
    duration: params.duration || '5',
    aspect_ratio: params.aspectRatio || '9:16', // Format vertical pour OF/IG/TT
    cfg_scale: 0.5,
  }

  if (params.imageUrl) {
    body.image_url = params.imageUrl
  }

  const data = await klingRequest(endpoint, 'POST', body)
  return data.data?.task_id || data.task_id
}

// Vérifier le statut d'une génération
export async function getGenerationStatus(taskId: string): Promise<KlingGeneration> {
  const data = await klingRequest(`/v1/videos/text2video/${taskId}`)
  const task = data.data || data

  return {
    taskId,
    status: mapStatus(task.task_status),
    videoUrl: task.task_result?.videos?.[0]?.url,
    coverUrl: task.task_result?.videos?.[0]?.cover_image_url,
    duration: task.task_result?.videos?.[0]?.duration,
    prompt: task.task_info?.input?.prompt || '',
    createdAt: task.created_at || Date.now(),
  }
}

function mapStatus(s: string): KlingGeneration['status'] {
  const map: Record<string, KlingGeneration['status']> = {
    submitted: 'submitted',
    processing: 'processing',
    succeed: 'succeed',
    failed: 'failed',
  }
  return map[s] || 'processing'
}

// Lister les générations récentes
export async function listGenerations(): Promise<KlingGeneration[]> {
  const data = await klingRequest('/v1/videos/text2video?page_size=20')
  return (data.data?.list || []).map((t: Record<string, unknown>) => {
    const taskResult = t.task_result as Record<string, unknown> | undefined
    const videos = (taskResult?.videos as Record<string, unknown>[] | undefined) || []
    const taskInfo = t.task_info as Record<string, unknown> | undefined
    const input = taskInfo?.input as Record<string, unknown> | undefined
    return {
      taskId: t.task_id,
      status: mapStatus(t.task_status as string),
      videoUrl: videos[0]?.url as string | undefined,
      coverUrl: videos[0]?.cover_image_url as string | undefined,
      prompt: (input?.prompt as string) || '',
      createdAt: (t.created_at as number) || 0,
    }
  })
}
