import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Prix d'overuse par feature (coût × marge 3x)
export const OVERUSE_PRICING: Record<string, { price: number; unit: string; pack: number; label: string }> = {
  ai_generation:  { price: 2.50,  unit: '/ vidéo',   pack: 5,   label: '5 générations IA' },
  trend_run:      { price: 0.99,  unit: '/ session', pack: 10,  label: '10 sessions Veille' },
  chatting_ai:    { price: 4.90,  unit: '/ pack',    pack: 500, label: '500 messages Chatting IA' },
  prospection_run:{ price: 3.90,  unit: '/ run',     pack: 3,   label: '3 runs Recrutement' },
}

// GET: informations sur le pricing d'overuse
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const feature = url.searchParams.get('feature')

  if (feature && OVERUSE_PRICING[feature]) {
    return NextResponse.json({ feature, ...OVERUSE_PRICING[feature] })
  }

  return NextResponse.json({ pricing: OVERUSE_PRICING })
}

// POST: enregistrer un achat d'overuse (après paiement confirmé)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: agency } = await supabase.from('agencies').select('id').eq('owner_id', user.id).single()
    if (!agency) return NextResponse.json({ error: 'No agency' }, { status: 404 })

    const { feature, paymentId } = await request.json()
    const pricing = OVERUSE_PRICING[feature]
    if (!pricing) return NextResponse.json({ error: 'Feature inconnue' }, { status: 400 })

    // Enregistrer les crédits overuse
    const { error } = await supabase.from('overuse_credits').insert({
      agency_id: agency.id,
      feature,
      credits: pricing.pack,
      payment_id: paymentId || 'manual',
      price_paid: pricing.price,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    })

    if (error) throw error
    return NextResponse.json({ success: true, credits: pricing.pack, feature })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register overuse' }, { status: 500 })
  }
}
