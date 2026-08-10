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

  return { supabase, appUser, agencyId: membership.agency_id as string }
}

function mediaTypeFromMime(mime: string): 'image' | 'video' | 'audio' | null {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return null
}

// Step 1 of "deposit then configure": the file itself is uploaded directly
// from the browser to Supabase Storage (see NewMediaForm) — Server Actions
// cap request bodies at 1MB and Vercel's function payload limit (~4.5MB)
// makes routing file bytes through here unworkable anyway. This just
// records the row once the bytes are already safely in the bucket.
export async function createMediaAsset(input: { creator_id: string; storage_key: string; mime: string; title: string }) {
  const { supabase, agencyId } = await getAgencyAndUser()

  if (!input.creator_id) throw new Error('Sélectionnez une créatrice')
  if (!input.storage_key.startsWith(`${agencyId}/`)) throw new Error('Chemin de stockage invalide')

  const mediaType = mediaTypeFromMime(input.mime)
  if (!mediaType) throw new Error('Type de fichier non supporté (image, vidéo ou audio uniquement)')

  const title = input.title.trim() || 'Sans titre'

  const { error } = await supabase.from('media_assets').insert({
    agency_id: agencyId,
    creator_id: input.creator_id,
    storage_key: input.storage_key,
    media_type: mediaType,
    title,
  })
  if (error) {
    // Don't leave an orphaned file if the row insert fails.
    await supabase.storage.from('media').remove([input.storage_key])
    throw new Error(error.message)
  }

  revalidatePath('/media')
}

// Step 2: configure (or reconfigure) a media already deposited — price is
// optional (empty = not priced yet), folder is optional, and a media can be
// marked not-for-sale (free content) which clears any price.
export async function updateMediaAsset(mediaId: string, formData: FormData) {
  const { supabase } = await getAgencyAndUser()

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const targetPriceRaw = String(formData.get('target_price') || '').trim()
  const minimumPriceRaw = String(formData.get('minimum_price') || '').trim()
  const standaloneAllowed = formData.get('standalone_allowed') === 'on'
  const isForSale = formData.get('is_for_sale') === 'on'
  const folderIdRaw = String(formData.get('folder_id') || '').trim()
  const status = String(formData.get('status') || 'active')

  if (!title) throw new Error('Titre requis')
  if (!['active', 'paused', 'archived'].includes(status)) throw new Error('Statut invalide')

  let targetPrice: number | null = null
  let minimumPrice: number | null = null
  if (isForSale) {
    if (targetPriceRaw) {
      targetPrice = Number(targetPriceRaw)
      if (!Number.isFinite(targetPrice) || targetPrice <= 0) throw new Error('Prix cible invalide')
    }
    if (minimumPriceRaw) {
      minimumPrice = Number(minimumPriceRaw)
      if (!Number.isFinite(minimumPrice) || minimumPrice <= 0) throw new Error('Prix minimum invalide')
    }
    if (targetPrice !== null && minimumPrice !== null && minimumPrice > targetPrice) {
      throw new Error('Le prix minimum ne peut pas dépasser le prix cible')
    }
  }

  const { error } = await supabase
    .from('media_assets')
    .update({
      title,
      description: description || null,
      target_price: targetPrice,
      minimum_price: minimumPrice,
      is_for_sale: isForSale,
      folder_id: folderIdRaw || null,
      standalone_allowed: standaloneAllowed,
      status,
      archived_at: status === 'archived' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
  if (error) throw new Error(error.message)

  revalidatePath('/media')
}

export async function createMediaFolder(formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Nom de dossier requis')

  const { error } = await supabase.from('media_folders').insert({ agency_id: agencyId, name })
  if (error) {
    if (error.code === '23505') throw new Error('Un dossier avec ce nom existe déjà')
    throw new Error(error.message)
  }

  revalidatePath('/media')
}

export async function addMediaTag(mediaId: string, formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const name = String(formData.get('name') || '').trim().toLowerCase()
  if (!name) throw new Error('Nom de tag requis')

  const { data: tag, error: tagError } = await supabase
    .from('media_tags')
    .upsert({ agency_id: agencyId, name }, { onConflict: 'agency_id,name' })
    .select('id')
    .single()
  if (tagError || !tag) throw new Error(tagError?.message || 'Échec de création du tag')

  const { error } = await supabase
    .from('media_asset_tags')
    .upsert({ agency_id: agencyId, media_asset_id: mediaId, media_tag_id: tag.id }, { onConflict: 'media_asset_id,media_tag_id' })
  if (error) throw new Error(error.message)

  revalidatePath('/media')
}

export async function removeMediaTag(mediaId: string, tagId: string) {
  const { supabase } = await getAgencyAndUser()

  const { error } = await supabase.from('media_asset_tags').delete().eq('media_asset_id', mediaId).eq('media_tag_id', tagId)
  if (error) throw new Error(error.message)

  revalidatePath('/media')
}
