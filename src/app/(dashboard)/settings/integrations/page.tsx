'use client'

import { useState, useEffect } from 'react'
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
  logo: React.ComponentType
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

// SVG Logo Components
const LogoOnlyFans = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#00AFF0"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui">OF</text>
  </svg>
)

const LogoMYM = () => (
  <svg viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="40" height="20" rx="4" fill="#1a1a2e"/>
    <text x="20" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">MYM</text>
  </svg>
)

const LogoAdsPower = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#2563eb"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">A</text>
  </svg>
)

const LogoGeeLark = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#059669"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">G</text>
  </svg>
)

const LogoBinance = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#F3BA2F"/>
    <text x="12" y="16" textAnchor="middle" fill="#1a1a1a" fontSize="7" fontWeight="bold" fontFamily="system-ui">BNB</text>
  </svg>
)

const LogoCoinbase = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <circle cx="12" cy="12" r="12" fill="#0052FF"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">C</text>
  </svg>
)

const LogoStripe = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#635BFF"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">S</text>
  </svg>
)

const LogoPayPal = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#003087"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="system-ui">PP</text>
  </svg>
)

const LogoRevolut = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#000000"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">R</text>
  </svg>
)

const LogoWise = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#9FE870"/>
    <text x="12" y="16" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="bold" fontFamily="system-ui">W</text>
  </svg>
)

const LogoN8n = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#EA4B27"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">n8n</text>
  </svg>
)

const LogoZapier = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
    <rect width="24" height="24" rx="6" fill="#FF4A00"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="system-ui">Z</text>
  </svg>
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
    fields: ['userId', 'authId', 'sess', 'bcTokens', 'userAgent'],
  },
  {
    id: 'mym',
    name: 'MYM',
    description: 'Synchronisez vos messages MYM avec le chatting IA',
    logo: LogoMYM,
    requiresUrl: false,
    category: 'chatting',
    fields: ['api_key'],
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
  const [connected, setConnected] = useState<Record<string, Integration>>({})
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<FormData>({})

  useEffect(() => {
    loadIntegrations()
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
      const payload: any = {
        tool: toolId,
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
