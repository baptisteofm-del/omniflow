// Client n8n — appelle les webhooks de tes workflows existants

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.srv1610420.hstgr.cloud'
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || ''

interface N8nWebhookPayload {
  agencyId: string
  [key: string]: unknown
}

async function callWebhook(path: string, payload: N8nWebhookPayload) {
  const url = `${N8N_BASE_URL}/webhook/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Omniflow-Secret': N8N_WEBHOOK_SECRET,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`n8n webhook error: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

// --- Veille contenu ---
export async function triggerContentWatch(agencyId: string) {
  return callWebhook('veille-contenu', { agencyId })
}

// --- Montage + Spoof vidéo ---
export async function triggerVideoProcess(agencyId: string, videoUrl: string, modelId: string) {
  return callWebhook('montage-spoof', { agencyId, videoUrl, modelId })
}

// --- Génération IA Higgsfield ---
export async function triggerAIGeneration(agencyId: string, prompt: string, modelId: string) {
  return callWebhook('ai-generation-higgsfield', { agencyId, prompt, modelId })
}

// --- Post Telegram ---
export async function triggerTelegramPost(agencyId: string, modelId: string, contentId: string) {
  return callWebhook('telegram-post', { agencyId, modelId, contentId })
}

// --- Post multi-comptes ---
export async function triggerScheduledPost(agencyId: string, postId: string) {
  return callWebhook('scheduled-post', { agencyId, postId })
}

// --- Rapport chatting ---
export async function triggerChattingReport(agencyId: string, date: string) {
  return callWebhook('chatting-report', { agencyId, date })
}
