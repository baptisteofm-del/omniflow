'use client'

import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, CheckCircle2, XCircle, MessageSquare, Eye, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Model {
  id: string
  name: string
}

interface Personality {
  id: string
  model_id: string
  display_name: string
  personality_type: string
  communication_style: string
  auto_mode: boolean
  example_messages: string[]
  languages: string[]
  topics_to_avoid: string[]
  ppv_price_range: string
  tips_strategy: string
}

interface Script {
  id: string
  name: string
  category: string
  content: string
  variables?: string[]
  ai_score?: number
  conversion_rate?: number
  usage_count?: number
  is_active: boolean
}

interface AIMessage {
  id: string
  content: string
  direction: string
  ai_generated: boolean
  approved?: boolean
  sent_at: string
  fan_profile: {
    fan_name: string
  }
}

export default function ChattingAIPage() {
  const [models, setModels] = useState<Model[]>([])
  const [personalities, setPersonalities] = useState<Record<string, Personality>>({})
  const [scripts, setScripts] = useState<Script[]>([])
  const [pendingMessages, setPendingMessages] = useState<AIMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [showPersonalityModal, setShowPersonalityModal] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [showValidationQueue, setShowValidationQueue] = useState(false)

  // Personality form
  const [personalityForm, setPersonalityForm] = useState<{
    displayName: string
    personalityType: string
    communicationStyle: string
    exampleMessages: string[]
    languages: string[]
    topicsToAvoid: string[]
    ppvPriceRange: string
    tipsStrategy: string
    autoMode: boolean
    responseDelay: number
  }>({
    displayName: '',
    personalityType: 'warm',
    communicationStyle: '',
    exampleMessages: [],
    languages: ['fr'],
    topicsToAvoid: [],
    ppvPriceRange: '',
    tipsStrategy: '',
    autoMode: false,
    responseDelay: 60,
  })

  // Script form
  const [scriptForm, setScriptForm] = useState<{
    name: string
    category: string
    content: string
    variables: string[]
  }>({
    name: '',
    category: 'custom',
    content: '',
    variables: [],
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(false)
      // Don't block initial render - load data in background
      // Only fetch models to show the UI immediately
      const modelsRes = await fetch('/api/chatting/models')
      if (modelsRes.ok) {
        const data = await modelsRes.json()
        setModels(data.models || [])
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
    
    // Load heavy data in background
    loadBackgroundData()
  }

  const loadBackgroundData = async () => {
    try {
      // Fetch scripts
      const scriptsRes = await fetch('/api/chatting/ai/scripts')
      if (scriptsRes.ok) {
        const data = await scriptsRes.json()
        setScripts(data.scripts || [])
      }

      // Fetch pending messages for supervised mode
      const messagesRes = await fetch('/api/chatting/ai/messages?approved=null')
      if (messagesRes.ok) {
        const data = await messagesRes.json()
        setPendingMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading background data:', error)
    }
  }

  const handleSavePersonality = async () => {
    try {
      if (!selectedModel) {
        toast.error('Sélectionnez un modèle')
        return
      }

      const res = await fetch('/api/chatting/ai/personalities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel,
          displayName: personalityForm.displayName,
          personalityType: personalityForm.personalityType,
          communicationStyle: personalityForm.communicationStyle,
          exampleMessages: personalityForm.exampleMessages,
          languages: personalityForm.languages,
          topicsToAvoid: personalityForm.topicsToAvoid,
          ppvPriceRange: personalityForm.ppvPriceRange,
          tipsStrategy: personalityForm.tipsStrategy,
          autoMode: personalityForm.autoMode,
        }),
      })

      if (!res.ok) throw new Error('Failed to save personality')

      const data = await res.json()
      setPersonalities(prev => ({
        ...prev,
        [selectedModel]: data.personality,
      }))

      setShowPersonalityModal(false)
      toast.success('Personnalité sauvegardée')
    } catch (error) {
      console.error('Error saving personality:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleSaveScript = async () => {
    try {
      if (!scriptForm.name || !scriptForm.content) {
        toast.error('Remplissez tous les champs')
        return
      }

      const res = await fetch('/api/chatting/ai/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scriptForm.name,
          category: scriptForm.category,
          content: scriptForm.content,
          variables: scriptForm.variables,
        }),
      })

      if (!res.ok) throw new Error('Failed to save script')

      const data = await res.json()
      setScripts(prev => [data.script, ...prev])

      setScriptForm({
        name: '',
        category: 'custom',
        content: '',
        variables: [],
      })

      setShowScriptModal(false)
      toast.success('Script sauvegardé')
    } catch (error) {
      console.error('Error saving script:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleAnalyzeScript = async (scriptId: string) => {
    try {
      const script = scripts.find(s => s.id === scriptId)
      if (!script) return

      const res = await fetch('/api/chatting/ai/scripts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptContent: script.content,
          category: script.category,
        }),
      })

      if (!res.ok) throw new Error('Failed to analyze script')

      const analysis = await res.json()

      setScripts(prev =>
        prev.map(s =>
          s.id === scriptId
            ? { ...s, ai_score: analysis.score }
            : s
        )
      )

      toast.success(`Score: ${analysis.score}/100`)
    } catch (error) {
      console.error('Error analyzing script:', error)
      toast.error('Erreur lors de l\'analyse')
    }
  }

  const handleApproveMessage = async (messageId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/chatting/ai/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          action,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve message')

      setPendingMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success(action === 'approve' ? 'Message approuvé' : 'Message rejeté')
    } catch (error) {
      console.error('Error approving message:', error)
      toast.error('Erreur lors de l\'approbation')
    }
  }



  return (
    <div className="p-8" data-tutorial="chatting-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chatting IA</h1>
        <p className="text-gray-400 mt-1">Gérez les réponses automatiques et les personnalités de vos modèles</p>
      </div>

      {/* Model Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Configuration des modèles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {models.map(model => (
            <div key={model.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {personalities[model.id]?.auto_mode ? '🟢 Mode auto' : '🔵 Mode supervisé'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedModel(model.id)
                    const existing = personalities[model.id]
                    if (existing) {
                      setPersonalityForm({
                        displayName: existing.display_name || '',
                        personalityType: existing.personality_type || 'warm',
                        communicationStyle: existing.communication_style || '',
                        exampleMessages: (existing.example_messages as string[]) || [],
                        languages: (existing.languages as string[]) || ['fr'],
                        topicsToAvoid: (existing.topics_to_avoid as string[]) || [],
                        ppvPriceRange: existing.ppv_price_range || '',
                        tipsStrategy: existing.tips_strategy || '',
                        autoMode: existing.auto_mode || false,
                        responseDelay: (existing as unknown as { response_delay_seconds?: number }).response_delay_seconds || 60,
                      })
                    }
                    setShowPersonalityModal(true)
                  }}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm font-medium text-blue-300 transition-all"
                  data-tutorial="chatting-configure"
                >
                  <Settings size={16} className="inline mr-1" />
                  Configurer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Validation Queue */}
      {pendingMessages.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">File de validation</h2>
            <button
              onClick={() => setShowValidationQueue(!showValidationQueue)}
              className="text-gray-400 hover:text-white transition-all"
            >
              {showValidationQueue ? '▼' : '▶'} {pendingMessages.length} message(s)
            </button>
          </div>

          {showValidationQueue && (
            <div className="space-y-4">
              {pendingMessages.map(msg => (
                <div key={msg.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-400">
                        {msg.fan_profile?.fan_name || 'Unknown fan'}
                      </p>
                      <p className="mt-2 text-white">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(msg.sent_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApproveMessage(msg.id, 'approve')}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 transition-all"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => handleApproveMessage(msg.id, 'reject')}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Scripts */}
      <section className="mb-12" data-tutorial="chatting-scripts">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Scripts</h2>
          <button
            onClick={() => setShowScriptModal(true)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm font-medium text-blue-300 transition-all"
          >
            <Plus size={16} className="inline mr-2" />
            Importer un script
          </button>
        </div>

        <div className="space-y-3">
          {scripts.map(script => (
            <div key={script.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{script.name}</h3>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded">
                      {script.category}
                    </span>
                    {script.ai_score && (
                      <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-300 rounded">
                        ⭐ {script.ai_score}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{script.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAnalyzeScript(script.id)}
                    className="p-2 text-gray-400 hover:text-white transition-all"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const s = scripts.find(x => x.id === script.id)
                      if (s) {
                        setScriptForm({
                          name: s.name,
                          category: s.category,
                          content: s.content,
                          variables: s.variables || [],
                        })
                        setShowScriptModal(true)
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      await fetch('/api/chatting/ai/scripts', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ scriptId: script.id }),
                      })
                      setScripts(prev => prev.filter(s => s.id !== script.id))
                      toast.success('Script supprimé')
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Statistiques IA</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Messages aujourd\'hui</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Taux d\'acceptation</p>
            <p className="text-3xl font-bold mt-2">—</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Revenus (mois)</p>
            <p className="text-3xl font-bold mt-2">€0</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-gray-400 text-sm">Commission (10%)</p>
            <p className="text-3xl font-bold mt-2">€0</p>
          </div>
        </div>
      </section>

      {/* Personality Modal */}
      {showPersonalityModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Configurer la personnalité</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom d'affichage</label>
                <input
                  type="text"
                  value={personalityForm.displayName}
                  onChange={e => setPersonalityForm({ ...personalityForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  placeholder="ex: Sophie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de personnalité</label>
                <select
                  value={personalityForm.personalityType}
                  onChange={e => setPersonalityForm({ ...personalityForm, personalityType: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option>warm</option>
                  <option>playful</option>
                  <option>mysterious</option>
                  <option>direct</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Style de communication</label>
                <textarea
                  value={personalityForm.communicationStyle}
                  onChange={e => setPersonalityForm({ ...personalityForm, communicationStyle: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  placeholder="Décrivez comment elle écrit..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sujets à éviter (séparés par des virgules)</label>
                <textarea
                  value={personalityForm.topicsToAvoid.join(', ')}
                  onChange={e =>
                    setPersonalityForm({
                      ...personalityForm,
                      topicsToAvoid: e.target.value.split(',').map(t => t.trim()),
                    })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stratégie tips/PPV</label>
                <textarea
                  value={personalityForm.tipsStrategy}
                  onChange={e => setPersonalityForm({ ...personalityForm, tipsStrategy: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2" data-tutorial="chatting-auto-mode">
                <input
                  type="checkbox"
                  id="autoMode"
                  checked={personalityForm.autoMode}
                  onChange={e => setPersonalityForm({ ...personalityForm, autoMode: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="autoMode" className="text-sm">
                  Mode automatique (sinon: supervisé)
                </label>
              </div>

              {/* Délai de réponse */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Délai de réponse :{' '}
                  <strong className="text-white">
                    {personalityForm.responseDelay < 60
                      ? `${personalityForm.responseDelay}s`
                      : `${Math.floor(personalityForm.responseDelay / 60)}min${personalityForm.responseDelay % 60 > 0 ? ` ${personalityForm.responseDelay % 60}s` : ''}`}
                  </strong>
                  <span className="text-gray-500 font-normal ml-2">(simulation humaine)</span>
                </label>
                <input
                  type="range"
                  min={30}
                  max={300}
                  step={30}
                  value={personalityForm.responseDelay}
                  onChange={e => setPersonalityForm({ ...personalityForm, responseDelay: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>30s</span>
                  <span>1min</span>
                  <span>2min</span>
                  <span>3min</span>
                  <span>4min</span>
                  <span>5min</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowPersonalityModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePersonality}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 transition-all"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Importer un script</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du script</label>
                <input
                  type="text"
                  value={scriptForm.name}
                  onChange={e => setScriptForm({ ...scriptForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  placeholder="ex: Greeting PPV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Catégorie</label>
                <select
                  value={scriptForm.category}
                  onChange={e => setScriptForm({ ...scriptForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option>ppv</option>
                  <option>tips</option>
                  <option>reactivation</option>
                  <option>greeting</option>
                  <option>custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contenu</label>
                <textarea
                  value={scriptForm.content}
                  onChange={e => setScriptForm({ ...scriptForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                  placeholder="Écrivez le script ici..."
                  rows={6}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowScriptModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveScript}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-300 transition-all"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
