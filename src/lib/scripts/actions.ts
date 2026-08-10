'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { advanceScriptRun } from '@/lib/scripts/engine'
import { validatePrice } from '@/lib/pricing/validator'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDraftVersionId(supabase: SupabaseClient<any, any, any>, scriptId: string) {
  const { data: draft } = await supabase
    .from('script_versions')
    .select('id')
    .eq('script_id', scriptId)
    .eq('status', 'draft')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!draft) throw new Error('Aucun brouillon à éditer — créez une nouvelle version')
  return draft.id as string
}

// Rebuilds the linear 'always' chain (start -> ... -> end) from each node's
// sequence_order. paid_media nodes are excluded: their "next" is decided by
// the purchased/not_purchased branches, never 'always'.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function rewireAlwaysEdges(supabase: SupabaseClient<any, any, any>, agencyId: string, versionId: string) {
  const { data: nodes } = await supabase
    .from('script_nodes')
    .select('id, node_type, sequence_order')
    .eq('script_version_id', versionId)
    .order('sequence_order', { ascending: true })
  if (!nodes) return

  await supabase.from('script_edges').delete().eq('script_version_id', versionId).eq('condition_type', 'always')

  for (let i = 0; i < nodes.length - 1; i++) {
    if (nodes[i].node_type === 'paid_media') continue
    await supabase.from('script_edges').insert({
      agency_id: agencyId,
      script_version_id: versionId,
      from_node_id: nodes[i].id,
      to_node_id: nodes[i + 1].id,
      condition_type: 'always',
    })
  }
}

export async function createScript(formData: FormData) {
  const { supabase, appUser, agencyId } = await getAgencyAndUser()

  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const creatorId = String(formData.get('creator_id') || '') || null
  if (!name) throw new Error('Nom requis')

  const { data: script, error: scriptError } = await supabase
    .from('scripts')
    .insert({ agency_id: agencyId, creator_id: creatorId, name, description: description || null, created_by: appUser.id })
    .select('id')
    .single()
  if (scriptError || !script) throw new Error(scriptError?.message || 'Échec de la création du script')

  const { data: version, error: versionError } = await supabase
    .from('script_versions')
    .insert({ agency_id: agencyId, script_id: script.id, version_number: 1, status: 'draft', created_by: appUser.id })
    .select('id')
    .single()
  if (versionError || !version) throw new Error(versionError?.message || 'Échec de la création de la version')

  const { data: startNode } = await supabase
    .from('script_nodes')
    .insert({ agency_id: agencyId, script_version_id: version.id, node_key: 'start', node_type: 'start', sequence_order: 0 })
    .select('id')
    .single()
  const { data: endNode } = await supabase
    .from('script_nodes')
    .insert({ agency_id: agencyId, script_version_id: version.id, node_key: 'end', node_type: 'end', sequence_order: 1_000_000 })
    .select('id')
    .single()

  if (startNode && endNode) {
    await supabase.from('script_edges').insert({
      agency_id: agencyId,
      script_version_id: version.id,
      from_node_id: startNode.id,
      to_node_id: endNode.id,
      condition_type: 'always',
    })
  }

  redirect(`/scripts/${script.id}`)
}

export async function addScriptNode(scriptId: string, formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()
  const versionId = await getDraftVersionId(supabase, scriptId)

  const nodeType = String(formData.get('node_type') || 'message')
  if (!['message', 'paid_media'].includes(nodeType)) throw new Error('Type d’étape invalide')

  const title = String(formData.get('title') || '').trim()
  const messageTemplate = String(formData.get('message_template') || '').trim()
  const priceRaw = String(formData.get('price_amount') || '').trim()
  const mediaAssetId = String(formData.get('media_asset_id') || '').trim()
  const generationMode = String(formData.get('generation_mode') || 'locked')
  const delayRaw = String(formData.get('delay_seconds') || '').trim()
  if (!messageTemplate) throw new Error('Le message est requis')
  if (!['locked', 'adaptive'].includes(generationMode)) throw new Error('Mode de génération invalide')
  const delaySeconds = delayRaw ? Math.max(0, Number(delayRaw)) : 0
  if (Number.isNaN(delaySeconds)) throw new Error('Délai invalide')

  let price: number | null = null
  if (nodeType === 'paid_media') {
    if (!mediaAssetId) throw new Error('Sélectionnez un média pour une offre payante')
    if (!priceRaw) throw new Error('Le prix est requis pour une offre payante')
    price = Number(priceRaw)
    const { data: media } = await supabase
      .from('media_assets')
      .select('minimum_price, is_for_sale')
      .eq('id', mediaAssetId)
      .single()
    if (!media) throw new Error('Média introuvable')
    validatePrice(price, media)
  }

  const { data: maxNode } = await supabase
    .from('script_nodes')
    .select('sequence_order')
    .eq('script_version_id', versionId)
    .neq('node_type', 'end')
    .order('sequence_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sequenceOrder = (maxNode?.sequence_order ?? 0) + 1

  const { error } = await supabase.from('script_nodes').insert({
    agency_id: agencyId,
    script_version_id: versionId,
    node_key: `node-${sequenceOrder}-${Date.now()}`,
    node_type: nodeType,
    title: title || null,
    message_template: messageTemplate,
    price_amount: price,
    media_asset_id: nodeType === 'paid_media' ? mediaAssetId : null,
    generation_mode: generationMode,
    delay_seconds: delaySeconds,
    sequence_order: sequenceOrder,
  })
  if (error) throw new Error(error.message)

  await rewireAlwaysEdges(supabase, agencyId, versionId)
  revalidatePath(`/scripts/${scriptId}`)
}

export async function updateScriptNode(scriptId: string, nodeId: string, formData: FormData) {
  const { supabase } = await getAgencyAndUser()
  await getDraftVersionId(supabase, scriptId)

  const { data: existing } = await supabase.from('script_nodes').select('node_type').eq('id', nodeId).single()
  if (!existing) throw new Error('Étape introuvable')

  const title = String(formData.get('title') || '').trim()
  const messageTemplate = String(formData.get('message_template') || '').trim()
  const priceRaw = String(formData.get('price_amount') || '').trim()
  const mediaAssetId = String(formData.get('media_asset_id') || '').trim()
  const generationMode = String(formData.get('generation_mode') || 'locked')
  const delayRaw = String(formData.get('delay_seconds') || '').trim()
  if (!messageTemplate) throw new Error('Le message est requis')
  if (!['locked', 'adaptive'].includes(generationMode)) throw new Error('Mode de génération invalide')
  const delaySeconds = delayRaw ? Math.max(0, Number(delayRaw)) : 0
  if (Number.isNaN(delaySeconds)) throw new Error('Délai invalide')

  let price: number | null = null
  if (existing.node_type === 'paid_media') {
    if (!mediaAssetId) throw new Error('Sélectionnez un média pour une offre payante')
    if (!priceRaw) throw new Error('Le prix est requis pour une offre payante')
    price = Number(priceRaw)
    const { data: media } = await supabase
      .from('media_assets')
      .select('minimum_price, is_for_sale')
      .eq('id', mediaAssetId)
      .single()
    if (!media) throw new Error('Média introuvable')
    validatePrice(price, media)
  }

  const { error } = await supabase
    .from('script_nodes')
    .update({
      title: title || null,
      message_template: messageTemplate,
      price_amount: price,
      media_asset_id: existing.node_type === 'paid_media' ? mediaAssetId : null,
      generation_mode: generationMode,
      delay_seconds: delaySeconds,
    })
    .eq('id', nodeId)
  if (error) throw new Error(error.message)

  revalidatePath(`/scripts/${scriptId}`)
}

export async function deleteScriptNode(scriptId: string, nodeId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()
  const versionId = await getDraftVersionId(supabase, scriptId)

  await supabase.from('script_nodes').delete().eq('id', nodeId).eq('script_version_id', versionId)
  await rewireAlwaysEdges(supabase, agencyId, versionId)
  revalidatePath(`/scripts/${scriptId}`)
}

export async function setScriptBranch(scriptId: string, formData: FormData) {
  const { supabase, agencyId } = await getAgencyAndUser()
  const versionId = await getDraftVersionId(supabase, scriptId)

  const nodeId = String(formData.get('node_id') || '')
  const purchasedTarget = String(formData.get('purchased_target') || '')
  const notPurchasedTarget = String(formData.get('not_purchased_target') || '')
  if (!nodeId) throw new Error('Étape manquante')

  await supabase
    .from('script_edges')
    .delete()
    .eq('script_version_id', versionId)
    .eq('from_node_id', nodeId)
    .in('condition_type', ['purchased', 'not_purchased'])

  if (purchasedTarget) {
    await supabase.from('script_edges').insert({
      agency_id: agencyId,
      script_version_id: versionId,
      from_node_id: nodeId,
      to_node_id: purchasedTarget,
      condition_type: 'purchased',
    })
  }
  if (notPurchasedTarget) {
    await supabase.from('script_edges').insert({
      agency_id: agencyId,
      script_version_id: versionId,
      from_node_id: nodeId,
      to_node_id: notPurchasedTarget,
      condition_type: 'not_purchased',
    })
  }

  revalidatePath(`/scripts/${scriptId}`)
}

export async function publishScript(scriptId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()
  const versionId = await getDraftVersionId(supabase, scriptId)

  // Validation du graphe (spec 13.38), minimal subset for this vertical slice.
  const { data: nodes } = await supabase
    .from('script_nodes')
    .select('id, node_type, price_amount')
    .eq('script_version_id', versionId)
  const realNodes = (nodes ?? []).filter((n) => n.node_type !== 'start' && n.node_type !== 'end')
  if (realNodes.length === 0) throw new Error('Ajoutez au moins une étape avant de publier')
  if (realNodes.some((n) => n.node_type === 'paid_media' && !n.price_amount)) {
    throw new Error('Chaque offre payante doit avoir un prix')
  }

  const { error } = await supabase
    .from('script_versions')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', versionId)
  if (error) throw new Error(error.message)

  await supabase.from('scripts').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', scriptId)

  revalidatePath(`/scripts/${scriptId}`)
  revalidatePath('/scripts')
}

export async function createNewDraftVersion(scriptId: string) {
  const { supabase, appUser, agencyId } = await getAgencyAndUser()

  const { data: latest } = await supabase
    .from('script_versions')
    .select('id, version_number')
    .eq('script_id', scriptId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  if (!latest) throw new Error('Script introuvable')

  const { data: newVersion, error } = await supabase
    .from('script_versions')
    .insert({ agency_id: agencyId, script_id: scriptId, version_number: latest.version_number + 1, status: 'draft', created_by: appUser.id })
    .select('id')
    .single()
  if (error || !newVersion) throw new Error(error?.message || 'Échec de la création de la nouvelle version')

  const { data: oldNodes } = await supabase.from('script_nodes').select('*').eq('script_version_id', latest.id)
  const idMap = new Map<string, string>()
  for (const n of oldNodes ?? []) {
    const { data: newNode } = await supabase
      .from('script_nodes')
      .insert({
        agency_id: agencyId,
        script_version_id: newVersion.id,
        node_key: n.node_key,
        node_type: n.node_type,
        title: n.title,
        message_template: n.message_template,
        price_amount: n.price_amount,
        currency: n.currency,
        media_asset_id: n.media_asset_id,
        generation_mode: n.generation_mode,
        delay_seconds: n.delay_seconds,
        sequence_order: n.sequence_order,
      })
      .select('id')
      .single()
    if (newNode) idMap.set(n.id, newNode.id)
  }

  const { data: oldEdges } = await supabase.from('script_edges').select('*').eq('script_version_id', latest.id)
  for (const e of oldEdges ?? []) {
    const fromId = idMap.get(e.from_node_id)
    const toId = idMap.get(e.to_node_id)
    if (!fromId || !toId) continue
    await supabase.from('script_edges').insert({
      agency_id: agencyId,
      script_version_id: newVersion.id,
      from_node_id: fromId,
      to_node_id: toId,
      condition_type: e.condition_type,
      priority: e.priority,
    })
  }

  revalidatePath(`/scripts/${scriptId}`)
}

export async function startScriptRun(conversationId: string, scriptId: string) {
  const { supabase, agencyId } = await getAgencyAndUser()

  const { data: existingActive } = await supabase
    .from('script_runs')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('status', 'active')
    .maybeSingle()
  if (existingActive) throw new Error('Un script est déjà en cours sur cette conversation')

  const { data: version } = await supabase
    .from('script_versions')
    .select('id')
    .eq('script_id', scriptId)
    .eq('status', 'published')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!version) throw new Error('Ce script n’a pas de version publiée')

  const { data: startNode } = await supabase
    .from('script_nodes')
    .select('id')
    .eq('script_version_id', version.id)
    .eq('node_type', 'start')
    .single()
  if (!startNode) throw new Error('Script invalide (pas de nœud de départ)')

  const { data: conversation } = await supabase.from('conversations').select('fan_id, creator_id').eq('id', conversationId).single()
  if (!conversation) throw new Error('Conversation introuvable')

  const { data: run, error } = await supabase
    .from('script_runs')
    .insert({
      agency_id: agencyId,
      script_version_id: version.id,
      conversation_id: conversationId,
      fan_id: conversation.fan_id,
      creator_id: conversation.creator_id,
      current_node_id: startNode.id,
      status: 'active',
    })
    .select('id')
    .single()
  if (error || !run) throw new Error(error?.message || 'Échec du démarrage du script')

  await supabase
    .from('script_run_events')
    .insert({ agency_id: agencyId, script_run_id: run.id, node_id: startNode.id, event_type: 'entered_node' })

  await advanceScriptRun(supabase, agencyId, run.id)

  revalidatePath(`/inbox/${conversationId}`)
}

export async function stopScriptRun(conversationId: string, runId: string) {
  const { supabase } = await getAgencyAndUser()

  const { error } = await supabase
    .from('script_runs')
    .update({ status: 'stopped', abandoned_at: new Date().toISOString() })
    .eq('id', runId)
  if (error) throw new Error(error.message)

  revalidatePath(`/inbox/${conversationId}`)
}
