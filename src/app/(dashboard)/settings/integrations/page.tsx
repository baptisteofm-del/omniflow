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

interface TestResult {
  success: boolean
  message: string
}

interface FormData {
  [key: string]: {
    api_key: string
    api_url?: string
  }
}

const integrations = [
  {
    id: 'adspower',
    name: 'AdsPower',
    description: 'Anti-detect browser avec profils locaux',
    icon: '🌐',
    requiresUrl: true,
    defaultUrl: 'http://local.adspower.net:50325',
  },
  {
    id: 'geelark',
    name: 'GeeLark',
    description: 'Navigateur Android cloud pour TikTok/Instagram',
    icon: '☁️',
    requiresUrl: false,
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Poster directement via bot Telegram',
    icon: '📱',
    requiresUrl: false,
  },
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
    if (!form[toolId]?.api_key) {
      toast.error('Clé API requise')
      return
    }

    setTesting({ ...testing, [toolId]: true })
    try {
      const payload = {
        tool: toolId,
        api_key: form[toolId].api_key,
        ...(form[toolId].api_url && { api_url: form[toolId].api_url }),
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
      toast.success(`${integrations.find(i => i.id === toolId)?.name} configuré ✅`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setTesting({ ...testing, [toolId]: false })
    }
  }

  const isIntegrationConnected = (toolId: string) => {
    return connected[toolId]?.is_active === true
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={28} className="text-purple-400" />
          <h1 className="text-2xl font-bold">Intégrations</h1>
        </div>
        <p className="text-gray-400">Connectez vos outils pour l'automatisation du posting</p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map(integration => {
            const isConnected = isIntegrationConnected(integration.id)
            const formData = form[integration.id] || {
              api_key: '',
              api_url: integration.defaultUrl || '',
            }

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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
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

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      {integration.id === 'telegram' ? 'Bot Token' : 'Clé API'}
                    </label>
                    <input
                      type="password"
                      value={formData.api_key}
                      onChange={e =>
                        setForm({
                          ...form,
                          [integration.id]: {
                            ...formData,
                            api_key: e.target.value,
                          },
                        })
                      }
                      placeholder={
                        integration.id === 'telegram'
                          ? '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'
                          : 'Clé API secrète'
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 font-mono text-sm"
                    />
                  </div>

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
                  {integration.id === 'telegram' && (
                    <p className="text-xs text-gray-500 p-3 bg-white/5 rounded-lg">
                      💡 Créez un bot avec @BotFather sur Telegram et copiez le token
                    </p>
                  )}

                  {/* Save button */}
                  <button
                    onClick={() => handleSave(integration.id)}
                    disabled={testing[integration.id] || !formData.api_key}
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
      )}

      {/* Tip */}
      <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-gray-300">
        <p className="font-medium mb-1">💡 Conseils:</p>
        <ul className="text-xs space-y-1 text-gray-400">
          <li>• Vérifiez que chaque service est accessible avant de sauvegarder</li>
          <li>• Les clés API sont chiffrées et stockées de façon sécurisée</li>
          <li>• Vous pouvez mettre à jour les clés à tout moment</li>
        </ul>
      </div>
    </div>
  )
}
