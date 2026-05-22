import { createAdminClient } from '@/lib/supabase/server'

export async function logAudit(params: {
  agencyId?: string
  action: string
  resource?: string
  ip?: string
  success?: boolean
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = await createAdminClient()
    await supabase.from('audit_log').insert({
      agency_id: params.agencyId || null,
      action: params.action,
      resource: params.resource,
      ip_address: params.ip,
      success: params.success ?? true,
      metadata: params.metadata,
    })
  } catch {
    // Ne jamais faire crasher l'app pour un log
  }
}
