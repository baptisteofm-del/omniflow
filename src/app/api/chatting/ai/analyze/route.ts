import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Anthropic } from '@anthropic-ai/sdk'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ConversationAnalysisRequest {
  conversation: string // free text conversation (format: Fan: xxx\nChatter: xxx\n...)
  modelId: string      // uuid
  platform: 'onlyfans' | 'mym'
}

export interface StyleProfile {
  tone: string
  expressions: string[]
  emojiUsage: string
  messageLength: 'court' | 'moyen' | 'long'
  language: string
}

export interface SuccessPattern {
  fanMessage: string
  chatterResponse: string
  why: string
}

export interface AvoidPattern {
  message: string
  reason: string
  betterAlternative: string
}

export interface UpsellMoment {
  context: string
  technique: string
  result: string
}

export interface FeedbackExample {
  original: string
  corrected: string
  reason: string
}

export interface ConversationAnalysis {
  styleProfile: StyleProfile
  successPatterns: SuccessPattern[]
  avoidPatterns: AvoidPattern[]
  upsellMoments: UpsellMoment[]
  keyLearnings: string[]
  feedbackExamples: FeedbackExample[]
}

/**
 * POST /api/chatting/ai/analyze
 * Analyze a conversation to extract learnings for the chatting AI
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversation, modelId, platform } = (await request.json()) as ConversationAnalysisRequest

    // Validate inputs
    if (!conversation || !modelId || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['onlyfans', 'mym'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Send to Claude Sonnet for analysis
    const systemPrompt = `Tu es un expert en analyse de conversations OnlyFans. Analyse cette conversation entre un chatter humain et un fan, et extrais les apprentissages pour améliorer une IA de chatting.

CONTEXTE IMPORTANT : Les chatters humains analysés sont souvent d'origine africaine et ne maîtrisent pas parfaitement le français. Fais la différence entre :
- Erreurs de langue involontaires du chatter (mauvaise grammaire, expressions incorrectes, manque de maîtrise du français) → signaler comme erreur humaine à corriger
- Style SMS naturel voulu (abréviations, "jsp", "mdr", etc.) → ne pas signaler comme erreur
- Opportunités ratées dues à la barrière linguistique (fan qui donne un signal d'achat, chatter qui ne comprend pas et répond à côté) → signaler comme opportunité manquée critique

Retourne un JSON valide (sans markdown) avec la structure suivante:
{
  "styleProfile": {
    "tone": "description du ton utilisé",
    "expressions": ["liste", "des", "expressions"],
    "emojiUsage": "description de l'usage des emojis",
    "messageLength": "court|moyen|long",
    "language": "niveau de langue"
  },
  "successPatterns": [
    {
      "fanMessage": "message du fan",
      "chatterResponse": "réponse du chatter",
      "why": "pourquoi c'est efficace"
    }
  ],
  "avoidPatterns": [
    {
      "message": "texte à éviter",
      "reason": "pourquoi c'est mauvais",
      "betterAlternative": "alternative meilleure"
    }
  ],
  "upsellMoments": [
    {
      "context": "contexte",
      "technique": "technique utilisée",
      "result": "résultat obtenu"
    }
  ],
  "keyLearnings": ["apprentissage 1", "apprentissage 2"],
  "feedbackExamples": [
    {
      "original": "version moins bonne",
      "corrected": "version améliorée",
      "reason": "pourquoi"
    }
  ]
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyse cette conversation:\n\n${conversation}`,
        },
      ],
    })

    // Extract JSON from response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Try to parse JSON from the response
    let analysis: ConversationAnalysis
    try {
      analysis = JSON.parse(responseText)
    } catch (parseError) {
      // If direct JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Claude response')
      }
      analysis = JSON.parse(jsonMatch[0])
    }

    // Save feedback examples to chatting_feedback table
    if (analysis.feedbackExamples && analysis.feedbackExamples.length > 0) {
      for (const example of analysis.feedbackExamples) {
        await supabase
          .from('chatting_feedback')
          .insert({
            model_id: modelId,
            action: 'correct',
            original_message: example.original,
            corrected_message: example.corrected,
            reason: example.reason,
            // Note: These come from analysis, not from specific messages
          })
          .then(result => {
            if (result.error) {
              console.error('Error saving feedback example:', result.error)
            }
          })
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      feedbackExamplesSaved: analysis.feedbackExamples?.length || 0,
    })
  } catch (error) {
    console.error('Error analyzing conversation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
