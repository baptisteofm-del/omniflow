'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2, Settings, Plus, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
  id: string
  tool: string
  is_active: boolean
  api_url?: string
}

interface FormData {
  [key: string]: {
    api_key: string
    api_url?: string
    secret_key?: string
    [key: string]: string | undefined
  }
}

const integrations = [
  // CHATTING IA - Creator Platforms
  {
    id: 'onlyfans',
    name: 'OnlyFans',
    description: 'Connectez vos comptes OnlyFans pour le chatting IA',
    icon: '🔵',
    requiresUrl: false,
    category: 'chatting',
    fields: ['userId', 'authId', 'sess', 'bcTokens', 'userAgent'],
  },
  {
    id: 'mym',
    name: 'MYM.fans',
    description: 'Plateforme française - accédez aux messages avec l\'IA',
    icon: '🩷',
    requiresUrl: false,
    category: 'chatting',
    fields: ['api_key'],
  },
  // POSTING - Anti-detect Browsers & Platform Connectors
  {
    id: 'adspower',
    name: 'AdsPower',
    description: 'Anti-detect browser avec profils locaux pour le posting',
    icon: '🌐',
    requiresUrl: true,
    defaultUrl: 'http://local.adspower.net:50325',
    category: 'posting',
  },
  {
    id: 'geelark',
    name: 'GeeLark',
    description: 'Navigateur Android cloud pour TikTok/Instagram posting',
    icon: '☁️',
    requiresUrl: false,
    category: 'posting',
  },
  {
    id: 'reddit',
    name: 'Reddit API',
    description: 'Connectez votre compte Reddit pour poster automatiquement',
    icon: '🟠',
    requiresUrl: false,
    category: 'posting',
    fields: ['client_id', 'client_secret', 'refresh_token'],
  },
  // FINANCE & CRYPTO
  {
    id: 'binance',
    name: 'Binance',
    description: 'Synchronisez vos transactions crypto et soldes USDT',
    icon: '🪙',
    requiresUrl: false,
    category: 'crypto',
    fields: ['api_key', 'secret_key'],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Connectez votre portefeuille Coinbase',
    icon: '🏢',
    requiresUrl: false,
    category: 'crypto',
    fields: ['api_key'],
  },
]

const categories = [
  { id: 'chatting', label: '💬 Chatting IA - Plateformes Creator', icon: '💬' },
  { id: 'posting', label: '📤 Posting - Navigateurs & Réseaux', icon: '📤' },
  { id: 'crypto', label: '💰 Finance & Crypto', icon: '💰' },
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="text-lg font-bold">{category.label}</h2>
                </div>
                
                {/* Category description */}
                {category.id === 'chatting' && (
                  <p className="text-sm text-gray-400 mb-4">Connectez vos comptes creator pour que l'IA réponde aux messages de vos fans</p>
                )}
                {category.id === 'posting' && (
                  <p className="text-sm text-gray-400 mb-4">Connectez vos navigateurs anti-détection pour automatiser le posting sur les réseaux sociaux</p>
                )}
                {category.id === 'crypto' && (
                  <p className="text-sm text-gray-400 mb-4">Synchronisez vos portefeuilles crypto pour le suivi financier</p>
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
                            <span className="text-3xl">{integration.icon}</span>
                            <div>
                              <h2 className="font-bold text-lg">{integration.name}</h2>
                              <p className="text-sm text-gray-400">{integration.description}</p>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                              isConnected
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {isConnected ? (
                              <>
                                <Check size={14} /> Connecté
                              </>
                            ) : (
                              <>
                                <X size={14} /> Pas connecté
                              </>
                            )}
                          </div>
                        </div>

                        {/* Form */}
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
                          {integration.id === 'reddit' && (
                            <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                              💡 <strong>Guide:</strong> Allez sur{' '}
                              <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                                Reddit Apps Settings
                              </a>
                              <br/>Créez une "script app" et copiez le client_id, client_secret et refresh_token
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
