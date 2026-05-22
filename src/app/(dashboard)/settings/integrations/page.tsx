'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, X, Loader2, Settings, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
  id: string
  tool: string
  is_active: boolean
  api_url?: string
}

interface IntegrationConfig {
  id: string
  name: string
  description: string
  logo: () => ReactNode
  requiresUrl?: boolean
  defaultUrl?: string
  category: string
  fields?: string[]
  comingSoon?: boolean
}

interface FormData {
  [key: string]: {
    api_key: string
    api_url?: string
    secret_key?: string
    [key: string]: string | undefined
  }
}

// SVG Logo Components with Official Brand SVGs
const LogoOnlyFans = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00AFF0' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173 0 0-2.399.585-4.43 0 4.018-.777 6.333-3.037 7.005-5.995zM5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996 7.996 7.996 0 0 0-7.996-7.996Zm0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z" />
    </svg>
  </div>
)

const LogoMYM = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
    <span className="text-white font-bold" style={{fontSize:'9px', letterSpacing:'-0.5px'}}>MYM</span>
  </div>
)

const LogoAdsPower = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2563eb' }}>
    <img src="/logo-adspower.png" alt="AdsPower" className="w-full h-full object-contain" />
  </div>
)

const LogoGeeLark = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#059669' }}>
    <img src="/logo-geelark.png" alt="GeeLark" className="w-full h-full object-contain" />
  </div>
)

const LogoBinance = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3BA2F' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#000000">
      <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z" />
    </svg>
  </div>
)

const LogoCoinbase = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0052FF' }}>
    <span className="text-white font-bold text-lg">C</span>
  </div>
)

const LogoStripe = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#635BFF' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  </div>
)

const LogoPayPal = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#003087' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
    </svg>
  </div>
)

const LogoRevolut = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#191C1F' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z" />
    </svg>
  </div>
)

const LogoWise = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9FE870' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#163300">
      <path d="M6.488 7.469 0 15.05h11.585l1.301-3.576H7.922l3.033-3.507.01-.092L8.993 4.48h8.873l-6.878 18.925h4.706L24 .595H2.543l3.945 6.874Z" />
    </svg>
  </div>
)

const LogoN8n = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EA4B27' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 10c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5S7.67 9 8.5 9s1.5.67 1.5 1.5S9.33 12 8.5 12zm3.5 6.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
    </svg>
  </div>
)

const LogoZapier = () => (
  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF4A00' }}>
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
      <path d="M18.4 1H5.6A1.6 1.6 0 0 0 4 2.6v3.2h4.8V2.8h6.4v2.8V9.6H20V2.6A1.6 1.6 0 0 0 18.4 1zm1.6 6.4h-4.8v3.2h4.8V7.4zM4 9.6h4.8v3.2H4V9.6zm0 4.8h4.8v3.2H4v-3.2zm6.4 0h4.8v3.2h-4.8v-3.2zm6.4 0H20v3.2h-3.2v-3.2zM4 18.8h4.8V22H5.6A1.6 1.6 0 0 1 4 20.4v-1.6zm6.4 0h4.8V22h-4.8v-3.2zm6.4 0H20V22h-3.2v-3.2z" />
    </svg>
  </div>
)

const integrations = [
  // CHATTING IA - Creator Platforms
  {
    id: 'onlyfans',
    name: 'OnlyFans',
    description: 'Connectez vos comptes OnlyFans pour le chatting IA',
    logo: LogoOnlyFans,
    requiresUrl: false,
    category: 'chatting',
    fields: ['email', 'password'],
    fieldLabels: { email: 'Adresse email', password: 'Mot de passe' },
    helpText: '⚠️ La double authentification (2FA) doit être désactivée sur ce compte pour que la connexion fonctionne.',
  },
  {
    id: 'mym',
    name: 'MYM',
    description: 'Synchronisez vos messages MYM avec le chatting IA',
    logo: LogoMYM,
    requiresUrl: false,
    category: 'chatting',
    fields: ['email', 'password'],
    fieldLabels: { email: 'Adresse email', password: 'Mot de passe' },
  },
  // POSTING - Anti-detect Browsers & Platform Connectors
  {
    id: 'adspower',
    name: 'AdsPower',
    description: 'Anti-detect browser avec profils locaux pour le posting',
    logo: LogoAdsPower,
    requiresUrl: true,
    defaultUrl: 'http://local.adspower.net:50325',
    category: 'posting',
  },
  {
    id: 'geelark',
    name: 'GeeLark',
    description: 'Navigateur Android cloud pour TikTok/Instagram posting',
    logo: LogoGeeLark,
    requiresUrl: false,
    category: 'posting',
  },
  // FINANCE & CRYPTO
  {
    id: 'binance',
    name: 'Binance',
    description: 'Synchronisez vos transactions crypto et soldes USDT',
    logo: LogoBinance,
    requiresUrl: false,
    category: 'finance',
    fields: ['api_key', 'secret_key'],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Connectez votre portefeuille Coinbase',
    logo: LogoCoinbase,
    requiresUrl: false,
    category: 'finance',
    fields: ['api_key'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Synchronisez vos paiements et revenus Stripe',
    logo: LogoStripe,
    requiresUrl: false,
    category: 'finance',
    fields: ['api_key'],
    comingSoon: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Importez vos transactions PayPal',
    logo: LogoPayPal,
    requiresUrl: false,
    category: 'finance',
    fields: ['client_id', 'client_secret'],
    comingSoon: true,
  },
  {
    id: 'revolut',
    name: 'Revolut Business',
    description: 'Connectez votre compte Revolut Business',
    logo: LogoRevolut,
    requiresUrl: false,
    category: 'finance',
    fields: ['api_key'],
    comingSoon: true,
  },
  {
    id: 'wise',
    name: 'Wise',
    description: 'Synchronisez vos virements internationaux',
    logo: LogoWise,
    requiresUrl: false,
    category: 'finance',
    fields: ['api_key'],
    comingSoon: true,
  },
  // AUTOMATION
  {
    id: 'n8n',
    name: 'n8n Webhook',
    description: 'Connectez vos workflows n8n pour automatiser',
    logo: LogoN8n,
    requiresUrl: false,
    category: 'automation',
    fields: ['webhook_url'],
    comingSoon: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connectez OmniFlow à 5000+ applications',
    logo: LogoZapier,
    requiresUrl: false,
    category: 'automation',
    fields: ['webhook_url'],
    comingSoon: true,
  },
]

const categories = [
  { id: 'chatting', label: 'Chatting IA' },
  { id: 'posting', label: 'Posting & Anti-detect' },
  { id: 'finance', label: 'Finance & Crypto' },
  { id: 'automation', label: 'Automatisation' },
]

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const modelIdFromUrl = searchParams.get('model')
  const toolFromUrl = searchParams.get('tool')
  const [connected, setConnected] = useState<Record<string, Integration>>({})
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<FormData>({})
  const [models, setModels] = useState<{id:string;name:string}[]>([])

  useEffect(() => {
    loadIntegrations()
    fetch('/api/models').then(r => r.json()).then(d => setModels(d.models || []))
  }, [])

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()

      const indexed: Record<string, Integration> = {}
      for (const integ of data.integrations || []) {
        indexed[integ.tool] = integ
      }
      setConnected(indexed)
    } catch (error) {
      console.error('Load error:', error)
      toast.error('Erreur lors du chargement des intégrations')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (toolId: string) => {
    const integration = integrations.find(i => i.id === toolId)
    if (!integration) return

    // Check required fields
    const fields = integration.fields || ['api_key']
    const missingFields = fields.filter(f => !form[toolId]?.[f])
    
    if (missingFields.length > 0) {
      toast.error(`Champs requis manquants: ${missingFields.join(', ')}`)
      return
    }

    setTesting({ ...testing, [toolId]: true })
    try {
      // Inclure model_id pour OF et MYM
      const isPerModel = ['onlyfans', 'mym'].includes(toolId)
      const selectedModelId = form[toolId]?.model_id || modelIdFromUrl
      const payload: any = {
        tool: toolId,
        ...(isPerModel && selectedModelId ? { model_id: selectedModelId } : {}),
        ...form[toolId],
      }

      // Test la connexion
      const testRes = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!testRes.ok) {
        const error = await testRes.json()
        throw new Error(error.error || 'Test failed')
      }

      const testData = await testRes.json()
      if (!testData.connected) {
        throw new Error(testData.message || 'Connection failed')
      }

      // Sauvegarde
      const saveRes = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!saveRes.ok) throw new Error('Save failed')

      await loadIntegrations()
      toast.success(`${integration.name} configuré ✅`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setTesting({ ...testing, [toolId]: false })
    }
  }

  const isIntegrationConnected = (toolId: string) => {
    return connected[toolId]?.is_active === true
  }

  const getFieldLabel = (toolId: string, field: string): string => {
    const labels: Record<string, Record<string, string>> = {
      onlyfans: {
        userId: 'ID Utilisateur',
        authId: 'Cookie auth_id',
        sess: 'Cookie sess',
        bcTokens: 'Cookie bc-tokens-p11',
        userAgent: 'User Agent',
      },
      binance: {
        api_key: 'API Key',
        secret_key: 'Secret Key',
      },
    }
    return labels[toolId]?.[field] || field
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={28} className="text-purple-400" />
          <h1 className="text-2xl font-bold">Intégrations</h1>
        </div>
        <p className="text-gray-400">Connectez vos outils pour le chatting IA, le posting automatisé et la finance</p>
      </div>

      {/* Bandeau modèle */}
      {modelIdFromUrl && (
        <div className="mb-6 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-sm text-purple-300">
            Connexion pour un profil modèle spécifique — {toolFromUrl && <strong className="text-white capitalize">{toolFromUrl}</strong>} sera lié uniquement à ce modèle.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <>
          {/* Sections by category */}
          {categories.map((category) => {
            const categoryIntegrations = integrations.filter(i => i.category === category.id)
            return (
              <div key={category.id} className="mb-10">
                <h2 className="text-lg font-bold mb-4">{category.label}</h2>
                
                {/* Category description */}
                {category.id === 'chatting' && (
                  <p className="text-sm text-gray-400 mb-4">Connectez vos comptes creator pour que l'IA réponde aux messages de vos fans</p>
                )}
                {category.id === 'posting' && (
                  <p className="text-sm text-gray-400 mb-4">Connectez vos navigateurs anti-détection pour automatiser le posting sur les réseaux sociaux</p>
                )}
                {category.id === 'finance' && (
                  <p className="text-sm text-gray-400 mb-4">Synchronisez vos portefeuilles et paiements pour le suivi financier</p>
                )}
                {category.id === 'automation' && (
                  <p className="text-sm text-gray-400 mb-4">Connectez vos outils d'automatisation pour intégrer OmniFlow</p>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryIntegrations.map(integration => {
                    const isConnected = isIntegrationConnected(integration.id)
                    const formData = form[integration.id] || {
                      api_key: '',
                      api_url: integration.defaultUrl || '',
                    }

                    const fields = integration.fields || ['api_key']

                    return (
                      <div key={integration.id} className="glass rounded-2xl p-6 border border-purple-500/10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center">
                              {integration.logo && <integration.logo />}
                            </div>
                            <div>
                              <h2 className="font-semibold text-white">{integration.name}</h2>
                              <p className="text-sm text-gray-400">{integration.description}</p>
                            </div>
                          </div>
                          <div>
                            {integration.comingSoon ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-gray-500/20 text-gray-400">
                                Bientôt disponible
                              </div>
                            ) : (
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                                  isConnected
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {isConnected ? (
                                  <>
                                    <Check size={14} /> Connecté
                                  </>
                                ) : (
                                  <>Non connecté</>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form */}
                        {!integration.comingSoon && (
                        <div className="space-y-4">
                          {integration.category === 'chatting' && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                Profil modèle associé
                              </label>
                              <select
                                value={form[integration.id]?.model_id || modelIdFromUrl || ''}
                                onChange={e => setForm({
                                  ...form,
                                  [integration.id]: { ...form[integration.id], model_id: e.target.value }
                                })}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                              >
                                <option value="">-- Sélectionner un profil --</option>
                                {models.map(m => (
                                  <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {integration.requiresUrl && (
                            <div>
                              <label className="block text-sm text-gray-400 mb-1.5">URL API</label>
                              <input
                                type="url"
                                value={formData.api_url || integration.defaultUrl || ''}
                                onChange={e =>
                                  setForm({
                                    ...form,
                                    [integration.id]: {
                                      ...formData,
                                      api_url: e.target.value,
                                    },
                                  })
                                }
                                placeholder={integration.defaultUrl || 'https://...'}
                                className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                              />
                            </div>
                          )}

                          {/* Dynamic fields */}
                          {fields.map((field) => (
                            <div key={field}>
                              <label className="block text-sm text-gray-400 mb-1.5">
                                {getFieldLabel(integration.id, field)}
                              </label>
                              <input
                                type={field.includes('secret') || field.includes('token') || field.includes('auth') ? 'password' : 'text'}
                                value={formData[field] || ''}
                                onChange={e =>
                                  setForm({
                                    ...form,
                                    [integration.id]: {
                                      ...formData,
                                      [field]: e.target.value,
                                    },
                                  })
                                }
                                placeholder={`Entrez votre ${getFieldLabel(integration.id, field).toLowerCase()}`}
                                className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 font-mono text-sm"
                              />
                            </div>
                          ))}

                          {/* Help text */}
                          {integration.id === 'adspower' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 URL locale : l'agent AdsPower doit tourner sur votre PC. Port par défaut: 50325
                            </p>
                          )}
                          {integration.id === 'geelark' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Obtenez votre clé API dans le panneau GeeLark
                            </p>
                          )}
                          {integration.id === 'onlyfans' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 <strong>Guide:</strong> Ouvrez OnlyFans → F12 → Application → Cookies
                              <br/>Copiez les valeurs de: auth_id, sess, bc-tokens-p11
                            </p>
                          )}
                          {integration.id === 'mym' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Bearer token disponible dans les paramètres de développeur MYM
                            </p>
                          )}
                          {integration.id === 'stripe' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Générez une clé API secrète sur votre dashboard Stripe
                            </p>
                          )}
                          {integration.id === 'paypal' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Créez une application sur le compte développeur PayPal
                            </p>
                          )}
                          {integration.id === 'revolut' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Obtenez votre clé API dans les paramètres Revolut Business
                            </p>
                          )}
                          {integration.id === 'wise' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Générez une clé API sur le panel développeur Wise
                            </p>
                          )}
                          {integration.id === 'n8n' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Créez un webhook dans vos workflows n8n
                            </p>
                          )}
                          {integration.id === 'zapier' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Générez un webhook Zapier pour connecter OmniFlow
                            </p>
                          )}
                          {integration.id === 'binance' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Créez une clé API read-only sur{' '}
                              <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                                Binance Account
                              </a>
                            </p>
                          )}
                          {integration.id === 'coinbase' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 Générez une clé API sur{' '}
                              <a href="https://coinbase.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                                Coinbase Settings
                              </a>
                            </p>
                          )}


                          {/* Save button */}
                          <button
                            onClick={() => handleSave(integration.id)}
                            disabled={testing[integration.id] || fields.some(f => !form[integration.id]?.[f])}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                          >
                            {testing[integration.id] ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Test de connexion...
                              </>
                            ) : isConnected ? (
                              <>
                                <Check size={16} />
                                Mettre à jour
                              </>
                            ) : (
                              <>
                                <Plus size={16} />
                                Connecter
                              </>
                            )}
                          </button>
                        </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Tip */}
      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-gray-300">
        <p className="font-medium mb-2">💡 Conseils de sécurité:</p>
        <ul className="text-xs space-y-1 text-gray-400">
          <li>• Les clés API sont chiffrées et stockées de façon sécurisée</li>
          <li>• Utilisez des clés API read-only quand possible (Binance, Coinbase)</li>
          <li>• Vérifiez que chaque service est accessible avant de sauvegarder</li>
          <li>• Les intégrations de chatting (OnlyFans, MYM) sont séparées du posting (AdsPower, GeeLark)</li>
          <li>• Vous pouvez mettre à jour les clés à tout moment</li>
        </ul>
      </div>
    </div>
  )
}
