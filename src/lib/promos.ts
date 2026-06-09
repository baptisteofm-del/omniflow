import { createClient } from '@/lib/supabase/server'

export interface PromoDiscount {
  type: 'percent' | 'fixed' | 'credits'
  value: number
  finalAmount: number
  creditsBonus: number
}

export interface PromoCodeData {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed' | 'credits'
  discount_value: number
  max_uses: number | null
  used_count: number
  max_uses_per_user: number
  applicable_plans: string[] | null
  applicable_to: 'subscription' | 'credits' | 'both'
  min_amount: number
  expires_at: string | null
  is_active: boolean
}

/**
 * Valide un code promo sans l'appliquer
 */
export async function validatePromoCode(
  code: string,
  agencyId: string,
  planId?: string,
  amount?: number
): Promise<{
  valid: boolean
  discount?: PromoDiscount
  error?: string
}> {
  const supabase = await createClient()

  // Récupérer le code promo
  const { data: promoData, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !promoData) {
    return { valid: false, error: 'Code promo invalide' }
  }

  const promo = promoData as PromoCodeData

  // Vérifier si le code est actif
  if (!promo.is_active) {
    return { valid: false, error: 'Ce code promo n\'est plus valide' }
  }

  // Vérifier la date d'expiration
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, error: 'Ce code promo a expiré' }
  }

  // Vérifier le nombre d'utilisations
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisations' }
  }

  // Vérifier si l'utilisateur a déjà utilisé ce code
  const { data: userUses } = await supabase
    .from('promo_code_uses')
    .select('id')
    .eq('promo_code_id', promo.id)
    .eq('agency_id', agencyId)

  if (userUses && userUses.length >= promo.max_uses_per_user) {
    return {
      valid: false,
      error: `Vous avez déjà utilisé ce code promo (${promo.max_uses_per_user} utilisation${promo.max_uses_per_user > 1 ? 's' : ''} maximum)`,
    }
  }

  // Vérifier les plans applicables
  if (planId && promo.applicable_plans && !promo.applicable_plans.includes(planId)) {
    return {
      valid: false,
      error: 'Ce code promo n\'est pas applicable à votre plan',
    }
  }

  // Vérifier le montant minimum
  if (amount && amount < promo.min_amount) {
    return {
      valid: false,
      error: `Le montant minimum pour ce code promo est ${promo.min_amount}€`,
    }
  }

  // Calculer la réduction
  let discountAmount = 0
  let creditsBonus = 0
  let finalAmount = amount || 0

  switch (promo.discount_type) {
    case 'percent':
      discountAmount = Math.round((finalAmount * promo.discount_value) / 100)
      finalAmount = finalAmount - discountAmount
      break
    case 'fixed':
      discountAmount = Math.min(promo.discount_value, finalAmount)
      finalAmount = finalAmount - discountAmount
      break
    case 'credits':
      creditsBonus = promo.discount_value
      break
  }

  return {
    valid: true,
    discount: {
      type: promo.discount_type,
      value: promo.discount_value,
      finalAmount,
      creditsBonus,
    },
  }
}

/**
 * Applique un code promo après validation
 */
export async function applyPromoCode(
  code: string,
  agencyId: string,
  userEmail: string,
  appliedTo: 'subscription' | 'credits',
  paymentId?: string
): Promise<{
  success: boolean
  discount?: PromoDiscount
  error?: string
}> {
  const supabase = await createClient()

  // Valider d'abord le code
  const validation = await validatePromoCode(code, agencyId)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Récupérer le code
  const { data: promoData } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  const promo = promoData as PromoCodeData

  // Enregistrer l'utilisation
  const { error: useError } = await supabase
    .from('promo_code_uses')
    .insert({
      promo_code_id: promo.id,
      agency_id: agencyId,
      user_email: userEmail,
      discount_amount:
        promo.discount_type === 'credits' ? 0 : promo.discount_value,
      applied_to: appliedTo,
      payment_id: paymentId,
    })

  if (useError) {
    return { success: false, error: 'Erreur lors de l\'application du code promo' }
  }

  // Incrémenter le compteur d'utilisations
  await supabase
    .from('promo_codes')
    .update({ used_count: promo.used_count + 1 })
    .eq('id', promo.id)

  return {
    success: true,
    discount: validation.discount,
  }
}

/**
 * Crée un nouveau code promo (admin uniquement)
 */
export async function createPromoCode(
  code: string,
  discountType: 'percent' | 'fixed' | 'credits',
  discountValue: number,
  options?: {
    description?: string
    maxUses?: number
    maxUsesPerUser?: number
    applicablePlans?: string[]
    applicableTo?: 'subscription' | 'credits' | 'both'
    minAmount?: number
    expiresAt?: string
    createdBy?: string
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      description: options?.description,
      max_uses: options?.maxUses,
      max_uses_per_user: options?.maxUsesPerUser || 1,
      applicable_plans: options?.applicablePlans,
      applicable_to: options?.applicableTo || 'both',
      min_amount: options?.minAmount || 0,
      expires_at: options?.expiresAt,
      is_active: true,
      created_by: options?.createdBy,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, id: data?.id }
}

/**
 * Liste tous les codes promo (admin uniquement)
 */
export async function listPromoCodes(
  activeOnly: boolean = false
): Promise<PromoCodeData[]> {
  const supabase = await createClient()

  let query = supabase.from('promo_codes').select('*')

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data: promoData, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing promo codes:', error)
    return []
  }

  return (promoData as PromoCodeData[]) || []
}

/**
 * Désactive un code promo (admin uniquement)
 */
export async function disablePromoCode(codeId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .update({ is_active: false })
    .eq('id', codeId)

  if (error) {
    console.error('Error disabling promo code:', error)
    return false
  }

  return true
}

/**
 * Récupère les statistiques d'un code promo
 */
export async function getPromoCodeStats(codeId: string) {
  const supabase = await createClient()

  const { data: code } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('id', codeId)
    .single()

  const { data: uses } = await supabase
    .from('promo_code_uses')
    .select('*')
    .eq('promo_code_id', codeId)

  return {
    code,
    totalUses: uses?.length || 0,
    totalDiscountAmount:
      uses?.reduce((acc, u) => acc + u.discount_amount, 0) || 0,
  }
}
