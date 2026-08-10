'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getAgencyAndUser() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser!.id)
    .single()
  if (!appUser) throw new Error('Utilisateur introuvable')

  const { data: membership } = await supabase
    .from('agency_memberships')
    .select('agency_id')
    .eq('user_id', appUser.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (!membership) throw new Error('Aucune agence active pour cet utilisateur')

  return { supabase, agencyId: membership.agency_id as string }
}

export async function markNotificationRead(notificationId: string) {
  const { supabase } = await getAgencyAndUser()

  const { error } = await supabase
    .from('agency_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .is('read_at', null)
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}

export async function markAllNotificationsRead() {
  const { supabase, agencyId } = await getAgencyAndUser()

  const { error } = await supabase
    .from('agency_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('agency_id', agencyId)
    .is('read_at', null)
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}
