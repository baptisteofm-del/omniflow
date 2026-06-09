/**
 * Commission Omniflow — 10% sur les ventes générées par les agences Agency
 * Architecture: déclaration manuelle/import + facturation Paddle mensuelle
 * 
 * Les commissions sont enregistrées par période mensuelle et trackées
 * pour les agences ayant souscrit au plan Agency.
 */

import { createClient } from '@/lib/supabase/server'

export const COMMISSION_RATE = 0.10

/**
 * Record de vente brute (avant commission)
 */
export interface SaleRecord {
  agencyId: string
  periodMonth: string // 'YYYY-MM-01'
  grossRevenue: number
  dataSource: 'manual' | 'api' | 'webhook'
  notes?: string
}

/**
 * Enregistrer une vente brute pour une agence (calcul auto de commission 10%)
 * En cas de doublon (agency_id + period_month), mise à jour des données existantes
 */
export async function recordSales(record: SaleRecord) {
  const supabase = await createClient()
  const commissionAmount = record.grossRevenue * COMMISSION_RATE

  const { data, error } = await supabase
    .from('agency_sales')
    .upsert(
      {
        agency_id: record.agencyId,
        period_month: record.periodMonth,
        gross_revenue: record.grossRevenue,
        data_source: record.dataSource,
        notes: record.notes,
      },
      { onConflict: 'agency_id,period_month' }
    )
    .select()
    .single()

  if (error) throw error
  return { ...data, commissionAmount }
}

/**
 * Récupérer le résumé des commissions pour une agence (derniers 12 mois)
 */
export async function getCommissionSummary(agencyId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_sales')
    .select('*')
    .eq('agency_id', agencyId)
    .order('period_month', { ascending: false })
    .limit(12)

  if (error) throw error

  const totalGross = data?.reduce((sum, r) => sum + r.gross_revenue, 0) ?? 0
  const totalCommission = totalGross * COMMISSION_RATE
  const pendingCommission = data
    ?.filter((r) => r.commission_status === 'pending')
    .reduce((sum, r) => sum + r.commission_amount, 0) ?? 0

  return { records: data, totalGross, totalCommission, pendingCommission }
}

/**
 * Récupérer toutes les commissions en attente (status = 'pending')
 * Utile pour le batch processing mensuel
 */
export async function getPendingCommissions() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('commission_overview').select('*').eq('commission_status', 'pending')

  if (error) throw error
  return data
}

/**
 * Marquer une commission comme 'invoiced' (envoyé à Paddle/facturation)
 */
export async function markCommissionInvoiced(
  agencyId: string,
  periodMonth: string,
  paddleInvoiceId?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_sales')
    .update({
      commission_status: 'invoiced',
      notes: paddleInvoiceId
        ? `Invoiced via Paddle (${paddleInvoiceId})`
        : 'Invoiced via manual entry',
    })
    .eq('agency_id', agencyId)
    .eq('period_month', periodMonth)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Marquer une commission comme 'paid' (payée à l'agence)
 */
export async function markCommissionPaid(agencyId: string, periodMonth: string, paidDate: Date) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_sales')
    .update({
      commission_status: 'paid',
      notes: `Paid on ${paidDate.toISOString().split('T')[0]}`,
    })
    .eq('agency_id', agencyId)
    .eq('period_month', periodMonth)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Disputer une commission (status = 'disputed')
 * Utile en cas d'erreur ou de litige avec l'agence
 */
export async function disputeCommission(agencyId: string, periodMonth: string, reason: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agency_sales')
    .update({
      commission_status: 'disputed',
      notes: `Disputed: ${reason}`,
    })
    .eq('agency_id', agencyId)
    .eq('period_month', periodMonth)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Récupérer les statistiques de commissions pour le dashboard admin
 */
export async function getCommissionStats() {
  const supabase = await createClient()

  // Total par statut
  const { data: byStatus, error: e1 } = await supabase
    .from('agency_sales')
    .select('commission_status, commission_amount')

  if (e1) throw e1

  const stats = {
    totalGross: 0,
    totalCommission: 0,
    pending: 0,
    invoiced: 0,
    paid: 0,
    disputed: 0,
    agencyCount: 0,
  }

  const agencyIds = new Set<string>()

  for (const row of byStatus) {
    stats.totalCommission += row.commission_amount
    switch (row.commission_status) {
      case 'pending':
        stats.pending += row.commission_amount
        break
      case 'invoiced':
        stats.invoiced += row.commission_amount
        break
      case 'paid':
        stats.paid += row.commission_amount
        break
      case 'disputed':
        stats.disputed += row.commission_amount
        break
    }
  }

  return stats
}
