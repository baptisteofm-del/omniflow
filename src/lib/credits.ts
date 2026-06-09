import { createClient } from '@/lib/supabase/server'

export const CREDIT_COSTS: Record<string, number> = {
  ai_generation: 1,
  trend_run: 1,
  chatting_message: 0,
  prospection_run: 1,
}

/**
 * Récupère le solde de crédits d'une agence
 */
export async function getBalance(agencyId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_credits')
    .select('balance')
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    console.error('Error fetching balance:', error)
    return 0
  }

  return data?.balance || 0
}

/**
 * Récupère l'ensemble des données de crédits (solde + config auto top-up)
 */
export async function getCreditsData(agencyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_credits')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    console.error('Error fetching credits data:', error)
    return null
  }

  return data
}

/**
 * Consomme des crédits (validation d'usage)
 */
export async function consumeCredits(
  agencyId: string,
  amount: number,
  feature: string,
  description: string
): Promise<{ success: boolean; balance: number; error?: string }> {
  const supabase = await createClient()

  // Vérifier le solde
  const currentBalance = await getBalance(agencyId)
  if (currentBalance < amount) {
    return {
      success: false,
      balance: currentBalance,
      error: `Insufficient credits. You have ${currentBalance} credits, but ${amount} are needed.`,
    }
  }

  // Déduire les crédits
  const { error: updateError } = await supabase
    .from('agency_credits')
    .update({ balance: currentBalance - amount })
    .eq('agency_id', agencyId)

  if (updateError) {
    console.error('Error updating credits:', updateError)
    return {
      success: false,
      balance: currentBalance,
      error: updateError.message,
    }
  }

  // Enregistrer la transaction
  await supabase.from('credit_transactions').insert({
    agency_id: agencyId,
    amount: -amount,
    balance_after: currentBalance - amount,
    type: 'consumption',
    description,
    feature,
  })

  return {
    success: true,
    balance: currentBalance - amount,
  }
}

/**
 * Ajoute des crédits (achat, bonus, remboursement)
 */
export async function addCredits(
  agencyId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'refund' | 'promo',
  description: string,
  paymentId?: string,
  promoCode?: string
): Promise<number> {
  const supabase = await createClient()

  const currentBalance = await getBalance(agencyId)
  const newBalance = currentBalance + amount

  // Ajouter les crédits
  const { error: updateError } = await supabase
    .from('agency_credits')
    .update({
      balance: newBalance,
      lifetime_purchased:
        type === 'purchase'
          ? (await getCreditsData(agencyId)).lifetime_purchased + amount
          : undefined,
    })
    .eq('agency_id', agencyId)

  if (updateError) {
    console.error('Error adding credits:', updateError)
    throw updateError
  }

  // Enregistrer la transaction
  await supabase.from('credit_transactions').insert({
    agency_id: agencyId,
    amount,
    balance_after: newBalance,
    type,
    description,
    payment_id: paymentId,
    promo_code: promoCode,
  })

  return newBalance
}

/**
 * Configure l'auto top-up
 */
export async function configureAutoTopup(
  agencyId: string,
  enabled: boolean,
  threshold?: number,
  amount?: number
): Promise<boolean> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {
    auto_topup_enabled: enabled,
  }

  if (threshold !== undefined) {
    updates.auto_topup_threshold = threshold
  }
  if (amount !== undefined) {
    updates.auto_topup_amount = amount
  }

  const { error } = await supabase
    .from('agency_credits')
    .update(updates)
    .eq('agency_id', agencyId)

  if (error) {
    console.error('Error configuring auto topup:', error)
    return false
  }

  return true
}

/**
 * Récupère l'historique des transactions de crédits
 */
export async function getTransactionHistory(
  agencyId: string,
  limit: number = 10
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }

  return data || []
}

/**
 * Initialise les crédits pour une nouvelle agence
 */
export async function initializeCredits(agencyId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('agency_credits').insert({
    agency_id: agencyId,
    balance: 0,
  })

  if (error) {
    console.error('Error initializing credits:', error)
    return false
  }

  return true
}

/**
 * Détermine si une agence peut utiliser auto top-up
 */
export async function canUseAutoTopup(agencyId: string): Promise<boolean> {
  const creditsData = await getCreditsData(agencyId)
  return creditsData?.auto_topup_enabled || false
}
