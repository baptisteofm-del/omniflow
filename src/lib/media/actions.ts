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

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100)
}

export async function uploadMediaAsset(formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const creatorId = String(formData.get('creator_id') || '')
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const targetPriceRaw = String(formData.get('target_price') || '').trim()
  const minimumPriceRaw = String(formData.get('minimum_price') || '').trim()
  const standaloneAllowed = formData.get('standalone_allowed') === 'on'
  const file = formData.get('file') as File | null

  if (!creatorId) throw new Error('Sélectionnez une créatrice')
  if (!title) throw new Error('Titre requis')
  if (!file || file.size === 0) throw new Error('Fichier requis')

  const targetPrice = Number(targetPriceRaw)
  const minimumPrice = Number(minimumPriceRaw)
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) throw new Error('Prix cible invalide')
  if (!Number.isFinite(minimumPrice) || minimumPrice <= 0) throw new Error('Prix minimum invalide')
  // Pricing Validator (spec 15.28), applied here too: a media can never be
  // configured with target < minimum in the first place.
  if (minimumPrice > targetPrice) throw new Error('Le prix minimum ne peut pas dépasser le prix cible')

  const mediaType = mediaTypeFromMime(file.type)
  if (!mediaType) throw new Error('Type de fichier non supporté (image, vidéo ou audio uniquement)')

  const storageKey = `${agencyId}/${creatorId}/${Date.now()}-${sanitizeFilename(file.name)}`
  const { error: uploadError } = await supabase.storage.from('media').upload(storageKey, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw new Error(`Échec de l'upload : ${uploadError.message}`)

  const { error } = await supabase.from('media_assets').insert({
    agency_id: agencyId,
    creator_id: creatorId,
    storage_key: storageKey,
    media_type: mediaType,
    title,
    description: description || null,
    target_price: targetPrice,
    minimum_price: minimumPrice,
    standalone_allowed: standaloneAllowed,
  })
  if (error) {
    // Don't leave an orphaned file if the row insert fails.
    await supabase.storage.from('media').remove([storageKey])
    throw new Error(error.message)
  }

  revalidatePath('/media')
  redirect('/media')
}

export async function updateMediaAsset(mediaId: string, formData: FormData) {
  const { supabase } = await getAgencyAndUser()

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const targetPriceRaw = String(formData.get('target_price') || '').trim()
  const minimumPriceRaw = String(formData.get('minimum_price') || '').trim()
  const standaloneAllowed = formData.get('standalone_allowed') === 'on'
  const status = String(formData.get('status') || 'active')

  if (!title) throw new Error('Titre requis')
  if (!['active', 'paused', 'archived'].includes(status)) throw new Error('Statut invalide')

  const targetPrice = Number(targetPriceRaw)
  const minimumPrice = Number(minimumPriceRaw)
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) throw new Error('Prix cible invalide')
  if (!Number.isFinite(minimumPrice) || minimumPrice <= 0) throw new Error('Prix minimum invalide')
  if (minimumPrice > targetPrice) throw new Error('Le prix minimum ne peut pas dépasser le prix cible')

  const { error } = await supabase
    .from('media_assets')
    .update({
      title,
      description: description || null,
      target_price: targetPrice,
      minimum_price: minimumPrice,
      standalone_allowed: standaloneAllowed,
      status,
      archived_at: status === 'archived' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaId)
  if (error) throw new Error(error.message)

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
