import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Descriptions de style — ce que chaque style doit produire ──
const STYLE_INSTRUCTIONS: Record<string, string> = {
  soft: `
Style : DOUX & ENGAGEANT
- Ton chaleureux, proche, intime, comme un message personnel à des amis proches
- Parle de son quotidien, de ses émotions, de ses petits bonheurs
- Crée de la proximité et un sentiment de relation exclusive
- Exemples d'énergie : "J'ai passé une super journée...", "Vous m'avez tellement manqué...", "J'ai quelque chose de doux pour vous ce soir"
  `.trim(),

  provocant: `
Style : PROVOCANT & MYSTÉRIEUX
- Teasing audacieux, suggestif sans être explicite, suspense et curiosité
- Commence une idée sans la finir, laisse imaginer, joue sur l'anticipation
- Utilise des points de suspension, des emojis sensuels (🔥🫦👀😈)
- Exemples d'énergie : "Ce que j'ai fait hier... vous seriez surpris 👀", "J'ai quelque chose de spécial ce soir... mais seulement pour les plus curieux 🔥"
  `.trim(),

  conversationnel: `
Style : NATUREL & AUTHENTIQUE
- Comme si elle envoyait un message vocal retranscrit, spontané, imparfait
- Coulisses, behind-the-scenes, moments non filtrés
- Partage de vraie vie : matinée, préparation, shooting, après
- Exemples d'énergie : "Franchement là je suis en train de finir mon café et je pense à vous 😅", "Le shooting d'hier c'était intense, j'ai des photos dingues"
  `.trim(),

  direct: `
Style : DIRECT & COMMERCIAL
- Appel à l'action clair, offre ou contenu mis en avant
- Crée l'urgence (temps limité, exclusivité, nombre de places)
- Montre la valeur sans tout dévoiler
- Exemples d'énergie : "Nouveau contenu dispo maintenant 🔥", "Seulement aujourd'hui : accès spécial pour mes fans Telegram 💫", "Je viens de poster quelque chose de CHAUD sur ma page"
  `.trim(),
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      examples = [],
      style = 'soft',
      count = 3,
      channel_name = '',
      model_id,
      model_name: modelNameOverride,
      existing_posts = [],
    } = body

    // ── Récupérer les infos du modèle si model_id fourni ──
    let modelName = modelNameOverride || 'la créatrice'
    let modelPlatform = 'OnlyFans'

    if (model_id) {
      const { data: model } = await supabase
        .from('models')
        .select('name, platform')
        .eq('id', model_id)
        .single()
      if (model) {
        modelName = model.name || modelName
        if (model.platform === 'mym') modelPlatform = 'MYM'
        else if (model.platform === 'onlyfans') modelPlatform = 'OnlyFans'
        else if (model.platform) modelPlatform = model.platform
      }
    }

    const styleInstructions = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.soft
    const examplesSection = examples.filter((e: string) => e.trim()).length > 0
      ? `\n\nEXEMPLES FOURNIS PAR L'AGENCE (analyse le style, le ton, la longueur — reproduis cette énergie) :\n${examples.filter((e: string) => e.trim()).join('\n\n')}`
      : ''
    const avoidSection = existing_posts.length > 0
      ? `\n\nPOSTS DÉJÀ GÉNÉRÉS (ne pas reprendre ces idées) :\n${existing_posts.slice(0, 5).join('\n')}`
      : ''

    const prompt = `Tu es le copywriter de ${modelName}, une créatrice de contenu professionnelle. Tu écris SES messages Telegram à la première personne, comme si c'était elle qui écrivait directement à ses fans.

═══════════════════
CONTEXTE
═══════════════════
Canal Telegram : ${channel_name || `Canal de ${modelName}`}
Créatrice : ${modelName}
Plateforme principale : ${modelPlatform}
Objectif du canal : maintenir l'engagement des fans et les encourager à consulter la page ${modelPlatform} de ${modelName}

═══════════════════
STYLE DEMANDÉ
═══════════════════
${styleInstructions}

═══════════════════
TYPES DE CONTENUS À MÉLANGER
═══════════════════
Varie entre ces catégories pour que les posts ne se ressemblent pas :
• Quotidien / mood : matin, humeur, routine, journée
• Shooting & création : annonce d'un shooting, nouvelle tenue, nouveau contenu
• Teaser exclusif : aperçu de ce qui est disponible sur ${modelPlatform}, sans tout dévoiler
• Coulisses : behind-the-scenes, préparation, moments spontanés
• Interaction : question aux fans, sondage, "dites-moi..."
• Promo/urgence : contenu nouveau, offre, mise en avant${examplesSection}${avoidSection}

═══════════════════
RÈGLES ABSOLUES
═══════════════════
✅ Toujours à la 1ère personne ("je", "mes", "moi", "vous")
✅ Longueur : 1 à 4 lignes maximum (format mobile Telegram)
✅ Emojis naturels et variés, pas plus de 3 par post
✅ Chaque post doit avoir son énergie propre, aucun doublon
✅ Pas de hashtags, pas de @mentions
✅ Langage français familier et authentique (pas corporate)
✅ Le teasing doit rester suggestif — jamais de contenu explicite
✅ Mentionner naturellement la plateforme quand pertinent

═══════════════════
TÂCHE
═══════════════════
Génère exactement ${count} posts Telegram différents pour ${modelName}.
Sépare chaque post par ---
Donne UNIQUEMENT les posts, aucun commentaire, aucune numérotation.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const posts = text
      .split('---')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 10)
      .slice(0, count)

    return NextResponse.json({ posts, style, model_name: modelName, count: posts.length })
  } catch (error) {
    console.error('Telegram generate-text error:', error)
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 })
  }
}
