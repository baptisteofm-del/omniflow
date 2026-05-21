// AdsPower Local API Client
// L'API AdsPower tourne en local sur le PC de l'utilisateur (port 50325)
// Chaque agence a ses propres clés API et URL locale

export interface AdsPowerProfile {
  id: string
  name: string
  group_id?: string
  remark?: string
}

// Lister tous les profils
export async function listProfiles(
  apiKey: string,
  apiUrl: string,
  page = 0,
  pageSize = 100
): Promise<AdsPowerProfile[]> {
  const res = await fetch(
    `${apiUrl}/api/v1/user/list?page=${page}&page_size=${pageSize}`,
    { headers: { 'x-api-key': apiKey } }
  )
  const data = await res.json()
  if (data.code !== 0) throw new Error(`AdsPower error: ${data.msg}`)
  return data.data?.list || []
}

// Ouvrir un profil (lance le navigateur)
export async function openProfile(
  apiKey: string,
  apiUrl: string,
  profileId: string
): Promise<{ wsEndpoint: string; debugPort: string }> {
  const res = await fetch(
    `${apiUrl}/api/v1/browser/start?user_id=${profileId}`,
    { headers: { 'x-api-key': apiKey } }
  )
  const data = await res.json()
  if (data.code !== 0) throw new Error(`AdsPower open error: ${data.msg}`)
  return {
    wsEndpoint: data.data.ws.puppeteer,
    debugPort: data.data.debug_port,
  }
}

// Fermer un profil
export async function closeProfile(
  apiKey: string,
  apiUrl: string,
  profileId: string
): Promise<void> {
  await fetch(
    `${apiUrl}/api/v1/browser/stop?user_id=${profileId}`,
    { headers: { 'x-api-key': apiKey } }
  )
}

// Vérifier si un profil est ouvert
export async function isProfileActive(
  apiKey: string,
  apiUrl: string,
  profileId: string
): Promise<boolean> {
  const res = await fetch(
    `${apiUrl}/api/v1/browser/active?user_id=${profileId}`,
    { headers: { 'x-api-key': apiKey } }
  )
  const data = await res.json()
  return data.data?.status === 'Active'
}
