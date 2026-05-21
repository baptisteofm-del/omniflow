// GeeLark Cloud API Client
// GeeLark = navigateur Android cloud — parfait pour TikTok/Instagram mobile
// Chaque agence a ses propres clés API

const GEELARK_API_URL = 'https://openapi.geelark.com'

interface GeelarkResponse<T = unknown> {
  code: number
  msg: string
  data?: T
}

async function geelarkRequest<T>(
  apiKey: string,
  path: string,
  method: 'GET' | 'POST' = 'POST',
  body?: object
): Promise<T> {
  const res = await fetch(`${GEELARK_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'aKey': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data: GeelarkResponse<T> = await res.json()
  if (data.code !== 0) throw new Error(`GeeLark error: ${data.msg}`)
  return data.data as T
}

export interface GeelarkProfile {
  profileId: string
  name: string
  status: 'running' | 'stopped'
  platform?: string
}

// Lister les profils
export async function listProfiles(apiKey: string): Promise<GeelarkProfile[]> {
  return geelarkRequest<GeelarkProfile[]>(apiKey, '/open/v1/profile/list', 'POST', {
    pageNo: 1,
    pageSize: 100,
  })
}

// Démarrer un profil cloud
export async function startProfile(apiKey: string, profileId: string): Promise<void> {
  await geelarkRequest(apiKey, '/open/v1/profile/start', 'POST', { profileIds: [profileId] })
}

// Arrêter un profil
export async function stopProfile(apiKey: string, profileId: string): Promise<void> {
  await geelarkRequest(apiKey, '/open/v1/profile/stop', 'POST', { profileIds: [profileId] })
}

// Lancer une tâche RPA (automatisation)
export async function runTask(
  apiKey: string,
  profileId: string,
  taskType: string,
  params: object
): Promise<string> {
  const result = await geelarkRequest<{ taskId: string }>(apiKey, '/open/v1/task/run', 'POST', {
    profileId,
    taskType,
    params,
  })
  return result.taskId
}

// Statut d'une tâche RPA
export async function getTaskStatus(apiKey: string, taskId: string): Promise<{ status: string; result?: unknown }> {
  return geelarkRequest(apiKey, '/open/v1/task/status', 'POST', { taskId })
}

// Poster sur TikTok via GeeLark RPA
export async function postToTikTok(
  apiKey: string,
  profileId: string,
  videoUrl: string,
  caption: string
): Promise<string> {
  return runTask(apiKey, profileId, 'tiktok_post', {
    videoUrl,
    caption,
    autoPublish: true,
  })
}

// Poster sur Instagram via GeeLark RPA
export async function postToInstagram(
  apiKey: string,
  profileId: string,
  mediaUrl: string,
  caption: string
): Promise<string> {
  return runTask(apiKey, profileId, 'instagram_post', {
    mediaUrl,
    caption,
    postType: 'reel',
  })
}
