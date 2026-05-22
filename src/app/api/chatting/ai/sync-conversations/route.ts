import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { loginAndGetToken, getConversations, getMessages } from '@/lib/platforms/mym'
import { decryptIntegrationData } from '@/lib/crypto/sensitive-fields'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modelId } = await request.json()
    if (!modelId) {
      return NextResponse.json({ error: 'Missing modelId' }, { status: 400 })
    }

    // Get agency
    const { data: agency } = await adminSupabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get all chatting integrations for this model (MYM + OnlyFans)
    const { data: integrations } = await adminSupabase
      .from('agency_integrations')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('model_id', modelId)
      .in('tool', ['mym', 'onlyfans'])
      .eq('is_active', true)

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({
        error: 'Aucune intégration MYM ou OnlyFans connectée pour ce modèle. Connectez d\'abord un compte dans Intégrations.',
      }, { status: 400 })
    }

    let conversationsAnalyzed = 0
    let feedbackSaved = 0
    const learnings: string[] = []

    for (const integration of integrations) {
      try {
        // Décrypter les credentials
        let creds: Record<string, string> = {}
        try {
          const raw = integration.api_key
          if (raw && raw.startsWith('{')) {
            creds = JSON.parse(raw)
          } else {
            creds = { api_key: raw }
          }
          creds = decryptIntegrationData(integration.tool, creds)
        } catch {
          creds = { email: '', password: '' }
        }

        // Obtenir le token
        let bearerToken = creds.api_key || ''
        if (!bearerToken && creds.email && creds.password) {
          try {
            bearerToken = await loginAndGetToken(creds.email, creds.password)
          } catch (err) {
            learnings.push(`${integration.tool}: Échec login — ${err instanceof Error ? err.message : 'erreur'}`)
            continue
          }
        }

        if (!bearerToken) {
          learnings.push(`${integration.tool}: Pas de token disponible`)
          continue
        }

        // Récupérer les conversations
        const conversations = await getConversations({ bearerToken }, 20)

        for (const conv of conversations) {
          try {
            // Récupérer les messages de la conversation
            const messages = await getMessages({ bearerToken }, conv.id || '')
            if (!messages || messages.length === 0) continue

            // Formater la conversation
            const convText = messages
              .map((m: any) => `${m.is_mine || m.sender === 'model' ? 'Chatter' : 'Fan'}: ${m.content || m.text || ''}`)
              .filter((line: string) => line.split(': ')[1]?.trim())
              .join('\n')

            if (!convText || convText.length < 50) continue

            // Analyser avec Claude
            const analyzeRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://omniflowapp.ai'}/api/chatting/ai/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.SUPABASE_SERVICE_ROLE_KEY || '' },
              body: JSON.stringify({
                conversation: convText,
                modelId,
                platform: integration.tool,
                agencyId: agency.id,
              }),
            })

            if (!analyzeRes.ok) continue
            const analysis = await analyzeRes.json()
            conversationsAnalyzed++

            // Sauvegarder les feedbacks
            if (analysis.feedbackExamples?.length > 0) {
              const feedbacks = analysis.feedbackExamples.map((f: any) => ({
                agency_id: agency.id,
                model_id: modelId,
                action: 'correct',
                original_message: f.original || '',
                corrected_message: f.corrected || '',
                reason: f.reason || '',
                created_at: new Date().toISOString(),
              }))

              const { error: fbError } = await adminSupabase
                .from('chatting_feedback')
                .insert(feedbacks)

              if (!fbError) feedbackSaved += feedbacks.length
            }

            if (analysis.keyLearnings?.length > 0) {
              learnings.push(...analysis.keyLearnings.slice(0, 2))
            }
          } catch { continue }
        }
      } catch (err) {
        learnings.push(`Erreur ${integration.tool}: ${err instanceof Error ? err.message : 'inconnue'}`)
      }
    }

    return NextResponse.json({
      success: true,
      conversationsAnalyzed,
      feedbackSaved,
      learnings: learnings.slice(0, 5),
      platforms: integrations.map(i => i.tool),
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur interne' }, { status: 500 })
  }
}
