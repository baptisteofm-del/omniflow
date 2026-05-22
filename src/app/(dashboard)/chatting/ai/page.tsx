'use client'

import { useState, useEffect } from 'react'
import {
  Settings, Plus, Trash2, CheckCircle2, XCircle, MessageSquare,
  Eye, Edit2, Bot, Zap, Users, TrendingUp, Clock, Shield,
  Radio, ChevronDown, ChevronRight, Info, ArrowRight, Sliders, Brain,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useUsage } from '@/lib/hooks/useUsage'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { ListConfigPanel } from '@/components/dashboard/chatting/ListConfigPanel'
import { FanNotesPanel } from '@/components/dashboard/chatting/FanNotesPanel'

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
  response_delay_seconds?: number
}

interface Script {
  id: string
  name: string
  category: string
  content: string
  variables?: string[]
  ai_score?: number
  is_active: boolean
}

interface AIMessage {
  id: string
  content: string
  direction: string
  ai_generated: boolean
  approved?: boolean | null
  sent_at: string
  fan_profile?: { fan_name: string }
}

interface FeedbackModal {
  isOpen: boolean
  messageId: string | null
  originalContent: string
  corrected: string
  reason: string
}

interface FanProfile {
  id: string
  fan_name: string
  total_spent: number
  interaction_count: number
  sentiment_score: number
  last_interaction: string
}

interface Stats {
  messages_today: number
  pending_validation: number
  approval_rate: number | null
  revenue_month: number
  commission_month: number
  active_models: number
}

const PERSONALITY_TYPES = [
  { id: 'gfe', label: 'GFE', desc: 'Girlfriend Experience — intime, attachante, comme une vraie petite amie' },
  { id: 'milf', label: 'MILF', desc: 'Mature, expérimentée, confiante et sensuelle' },
  { id: 'fitness', label: 'Fitness', desc: 'Coach sportive — dynamique, motivante, lifestyle sain' },
  { id: 'baddie', label: 'Baddie', desc: 'Haut standing, luxury, légèrement inaccessible' },
  { id: 'shy', label: 'Shy / Cute', desc: 'Douce et timide en apparence, curieuse et espiègle' },
  { id: 'influencer', label: 'Influenceuse', desc: 'Lifestyle & mode, derrière les réseaux, behind the scenes' },
  { id: 'gothic', label: 'Gothique', desc: 'Mystérieuse, sombre, univers dark et envoûtant' },
]

export default function ChattingAIPage() {
  const { planId } = useUsage()
  const [models, setModels] = useState<Model[]>([])
  const [personalities, setPersonalities] = useState<Record<string, Personality>>({})
  const [scripts, setScripts] = useState<Script[]>([])
  const [pendingMessages, setPendingMessages] = useState<AIMessage[]>([])
  const [recentMessages, setRecentMessages] = useState<AIMessage[]>([])
  const [recentFans, setRecentFans] = useState<FanProfile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [listConfigs, setListConfigs] = useState<Record<string, any>>({
    onlyfans: null,
    mym: null,
  })

  // UI state
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [showPersonalityModal, setShowPersonalityModal] = useState(false)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    isOpen: false,
    messageId: null,
    originalContent: '',
    corrected: '',
    reason: '',
  })
  const [activeTab, setActiveTab] = useState<'models' | 'scripts' | 'queue' | 'fans' | 'activity' | 'config' | 'analyze'>('models')
  const [selectedFanForNotes, setSelectedFanForNotes] = useState<FanProfile | null>(null)
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false)
  const [analyzeForm, setAnalyzeForm] = useState({
    conversation: '',
    selectedModelId: '',
    platform: 'onlyfans' as 'onlyfans' | 'mym',
  })
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<any>(null)

  const [personalityForm, setPersonalityForm] = useState({
    displayName: '',
    personalityType: 'warm',
    communicationStyle: '',
    exampleMessages: [] as string[],
    languages: ['fr'],
    topicsToAvoid: [] as string[],
    ppvPriceRange: '',
    tipsStrategy: '',
    autoMode: false,
    responseDelay: 60,
  })

  const [scriptForm, setScriptForm] = useState({
    name: '', category: 'ppv', content: '', variables: [] as string[],
  })

  const handleAnalyzeConversation = async () => {
    if (!analyzeForm.conversation.trim() || !analyzeForm.selectedModelId) {
      toast.error('Remplissez tous les champs')
      return
    }

    setAnalyzeLoading(true)
    try {
      const res = await fetch('/api/chatting/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: analyzeForm.conversation,
          modelId: analyzeForm.selectedModelId,
          platform: analyzeForm.platform,
        }),
      })

      if (!res.ok) throw new Error('Erreur lors de l\'analyse')
      const data = await res.json()
      setAnalyzeResult(data.analysis)
      toast.success(`Analyse complétée! ${data.feedbackExamplesSaved} exemples de feedback sauvegardés`)
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de l\'analyse')
    } finally {
      setAnalyzeLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [modelsRes, scriptsRes, statsRes, configRes] = await Promise.all([
        fetch('/api/chatting/models'),
        fetch('/api/chatting/ai/scripts'),
        fetch('/api/chatting/stats'),
        fetch('/api/chatting/config'),
      ])

      if (modelsRes.ok) setModels((await modelsRes.json()).models || [])
      if (scriptsRes.ok) setScripts((await scriptsRes.json()).scripts || [])
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
        setRecentFans(data.recent_fans || [])
        setRecentMessages(data.recent_messages || [])
        setPendingMessages(
          (data.recent_messages || []).filter((m: AIMessage) => m.approved === null && m.direction === 'outbound')
        )
      }
      if (configRes.ok) {
        const data = await configRes.json()
        setListConfigs({
          onlyfans: data.onlyfans,
          mym: data.mym,
        })
      }

      // Load personalities
      const pRes = await fetch('/api/chatting/ai/personalities')
      if (pRes.ok) {
        const pData = await pRes.json()
        const map: Record<string, Personality> = {}
        ;(pData.personalities || []).forEach((p: Personality) => { map[p.model_id] = p })
        setPersonalities(map)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleAI = async (platform: string) => {
    const current = listConfigs[platform]?.is_active ?? false
    setListConfigs(prev => ({ ...prev, [platform]: { ...prev[platform], is_active: !current } }))
    try {
      await fetch('/api/chatting/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, is_active: !current })
      })
      toast.success(!current ? `IA ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'} activée` : `IA désactivée`)
    } catch {
      setListConfigs(prev => ({ ...prev, [platform]: { ...prev[platform], is_active: current } }))
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const toggleAutoMode = async (modelId: string) => {
    const personality = personalities[modelId]
    if (!personality) return

    const newAutoMode = !personality.auto_mode

    // Optimistic update
    setPersonalities((prev) => ({
      ...prev,
      [modelId]: { ...prev[modelId], auto_mode: newAutoMode } as Personality,
    }))

    try {
      const res = await fetch('/api/chatting/ai/personalities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          displayName: personality.display_name,
          personalityType: personality.personality_type,
          communicationStyle: personality.communication_style,
          exampleMessages: personality.example_messages,
          languages: personality.languages,
          topicsToAvoid: personality.topics_to_avoid,
          ppvPriceRange: personality.ppv_price_range,
          tipsStrategy: personality.tips_strategy,
          autoMode: newAutoMode,
          responseDelay: personality.response_delay_seconds,
        }),
      })

      if (!res.ok) throw new Error('Erreur')
      const data = await res.json()

      setPersonalities((prev) => ({
        ...prev,
        [modelId]: data.personality,
      }))

      toast.success(newAutoMode ? '✅ IA activée' : '⊘ IA désactivée')
    } catch (e) {
      console.error(e)
      // Revert on error
      setPersonalities((prev) => ({
        ...prev,
        [modelId]: { ...prev[modelId], auto_mode: personality.auto_mode } as Personality,
      }))
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const openConfigureModel = (modelId: string) => {
    setSelectedModel(modelId)
    const existing = personalities[modelId]
    if (existing) {
      setPersonalityForm({
        displayName: existing.display_name || '',
        personalityType: existing.personality_type || 'warm',
        communicationStyle: existing.communication_style || '',
        exampleMessages: existing.example_messages || [],
        languages: existing.languages || ['fr'],
        topicsToAvoid: existing.topics_to_avoid || [],
        ppvPriceRange: existing.ppv_price_range || '',
        tipsStrategy: existing.tips_strategy || '',
        autoMode: existing.auto_mode || false,
        responseDelay: existing.response_delay_seconds || 60,
      })
    } else {
      setPersonalityForm({
        displayName: '', personalityType: 'warm', communicationStyle: '',
        exampleMessages: [], languages: ['fr'], topicsToAvoid: [],
        ppvPriceRange: '', tipsStrategy: '', autoMode: false, responseDelay: 60,
      })
    }
    setShowPersonalityModal(true)
  }

  const handleSavePersonality = async () => {
    if (!selectedModel) return
    try {
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
          responseDelay: personalityForm.responseDelay,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPersonalities((prev) => ({ ...prev, [selectedModel]: data.personality }))
      setShowPersonalityModal(false)
      toast.success('Personnalité sauvegardée ✅')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleSaveScript = async () => {
    if (!scriptForm.name || !scriptForm.content) { toast.error('Remplissez tous les champs'); return }
    try {
      const res = await fetch('/api/chatting/ai/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptForm),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setScripts((prev) => [data.script, ...prev])
      setScriptForm({ name: '', category: 'ppv', content: '', variables: [] })
      setShowScriptModal(false)
      toast.success('Script sauvegardé')
    } catch { toast.error('Erreur') }
  }

  const handleAnalyzeScript = async (scriptId: string) => {
    const script = scripts.find((s) => s.id === scriptId)
    if (!script) return
    try {
      const res = await fetch('/api/chatting/ai/scripts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptContent: script.content, category: script.category }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setScripts((prev) => prev.map((s) => s.id === scriptId ? { ...s, ai_score: data.score } : s))
      toast.success(`Score IA : ${data.score}/100`)
    } catch { toast.error('Analyse impossible') }
  }

  const handleApproveMessage = async (messageId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/chatting/ai/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action }),
      })
      if (!res.ok) throw new Error()
      setPendingMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success(action === 'approve' ? '✅ Message approuvé' : '❌ Message rejeté')
    } catch { toast.error('Erreur') }
  }

  const handleFeedback = async (messageId: string, action: 'validate' | 'correct' | 'reject', correction?: string, reason?: string) => {
    try {
      const res = await fetch('/api/chatting/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          action,
          correction,
          reason,
        }),
      })
      if (!res.ok) throw new Error()
      setRecentMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success(
        action === 'validate' ? '✅ Message validé' :
        action === 'correct' ? '✏️ Correction enregistrée' :
        '❌ Message rejeté'
      )
      setFeedbackModal({ isOpen: false, messageId: null, originalContent: '', corrected: '', reason: '' })
    } catch { toast.error('Erreur lors de l\'envoi du feedback') }
  }

  const openFeedbackModal = (messageId: string, content: string) => {
    setFeedbackModal({
      isOpen: true,
      messageId,
      originalContent: content,
      corrected: content,
      reason: '',
    })
  }

  const modelName = (id: string) => models.find((m) => m.id === id)?.name || id

  const AI_GENERATED_FEEDBACK_ENABLED = true // Feature flag

  return (
    <FeatureGate feature="chatting_ai" planId={planId}>
      <div className="p-6 lg:p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="text-violet-400" size={28} /> Chatting IA
          </h1>
          <p className="text-gray-400 mt-1">
            Claude répond à vos fans OF/MYM en automatique — 24h/24, 7j/7
          </p>
        </div>
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-violet-300 transition-all text-sm"
        >
          <Info size={16} />
          Comment ça fonctionne ?
          <ChevronDown size={14} className={`transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── AI Status Banner ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {(['onlyfans', 'mym'] as const).map((platform) => {
          const config = listConfigs[platform]
          const isActive = config?.is_active ?? false
          return (
            <div
              key={platform}
              className={`glass rounded-2xl p-5 border ${
                isActive ? 'border-green-500/40 bg-green-500/5' : 'border-white/5 bg-white/2'
              } flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-3">
                {/* Logo plateforme */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    platform === 'onlyfans' ? 'bg-[#00AFF0]/20' : 'bg-black/40 border border-white/10'
                  }`}
                >
                  <span className="text-xs font-bold text-white">
                    {platform === 'onlyfans' ? 'OF' : 'MYM'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {isActive ? '● IA active' : '○ IA désactivée'}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggleAI(platform)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isActive ? 'bg-green-500' : 'bg-gray-700'
                }`}
                title={`Toggle ${platform} IA`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {/* ── How it works panel ── */}
      {showHowItWorks && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <Zap size={18} className="text-violet-400" /> Le flux complet du Chatting IA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '1',
                icon: '🔌',
                title: 'Connexion OF/MYM',
                desc: 'Ajoutez vos tokens dans Paramètres → Intégrations. n8n commence à surveiller les messages.',
                color: 'border-blue-500/30 bg-blue-500/5',
              },
              {
                step: '2',
                icon: '📡',
                title: 'Poll toutes les 30s',
                desc: 'n8n interroge l\'API OF/MYM et détecte les nouveaux messages fans entrants.',
                color: 'border-cyan-500/30 bg-cyan-500/5',
              },
              {
                step: '3',
                icon: '🧠',
                title: 'Claude génère la réponse',
                desc: 'Claude Haiku lit le message du fan, la mémoire du fan, et génère une réponse selon la personnalité configurée.',
                color: 'border-violet-500/30 bg-violet-500/5',
              },
              {
                step: '4',
                icon: '⚡ / 👁️',
                title: 'Auto ou Supervisé',
                desc: 'Mode auto → envoi immédiat. Mode supervisé → le message apparaît dans la file de validation pour approbation.',
                color: 'border-amber-500/30 bg-amber-500/5',
              },
              {
                step: '5',
                icon: '💰',
                title: 'Revenus trackés',
                desc: 'Chaque vente (PPV, tips) générée par l\'IA est tracée. OmniFlow prend 10% de commission sur ces ventes.',
                color: 'border-green-500/30 bg-green-500/5',
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className={`rounded-xl border ${s.color} p-4 h-full`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Étape {s.step}</p>
                  <p className="text-white text-sm font-semibold mb-1">{s.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-amber-300 text-sm font-medium mb-2">⚠️ Prérequis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
              <div>1. <strong className="text-white">Paramètres → Intégrations</strong> : Connecter OnlyFans et/ou MYM</div>
              <div>2. <strong className="text-white">Ci-dessous → Configuration modèles</strong> : Créer une personnalité par modèle</div>
              <div>3. <strong className="text-white">n8n</strong> : Les workflows "Chatting IA Poll" et "Sync Messages" doivent être actifs</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Messages aujourd\'hui',
            value: stats?.messages_today ?? '—',
            icon: <MessageSquare size={18} />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: 'En attente validation',
            value: stats?.pending_validation ?? '—',
            icon: <Clock size={18} />,
            color: stats && stats.pending_validation > 0 ? 'text-amber-400' : 'text-gray-400',
            bg: stats && stats.pending_validation > 0
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-white/5 border-white/10',
          },
          {
            label: 'Taux d\'approbation',
            value: stats?.approval_rate != null ? stats.approval_rate + '%' : '—',
            icon: <Shield size={18} />,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            label: 'Revenus IA (mois)',
            value: stats ? stats.revenue_month.toFixed(0) + '€' : '—',
            icon: <TrendingUp size={18} />,
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
          },
          {
            label: 'Commission OmniFlow',
            value: stats ? stats.commission_month.toFixed(0) + '€' : '—',
            icon: <Zap size={18} />,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10 border-pink-500/20',
          },
          {
            label: 'Modèles configurés',
            value: stats?.active_models ?? '—',
            icon: <Users size={18} />,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20',
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4`}>
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <div className="text-2xl font-bold text-white">{loading ? '…' : s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-0">
        {[
          { id: 'models', label: 'Modèles', badge: models.length },
          { id: 'queue', label: 'File de validation', badge: pendingMessages.length, alert: pendingMessages.length > 0 },
          { id: 'scripts', label: 'Scripts', badge: scripts.length },
          { id: 'analyze', label: 'Analyser', badge: null, icon: <Brain size={14} /> },
          { id: 'config', label: 'Config par liste', badge: null, icon: <Sliders size={14} /> },
          { id: 'fans', label: 'Profils fans', badge: recentFans.length },
          { id: 'activity', label: 'Activité récente', badge: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon && tab.icon}
            {tab.label}
            {tab.badge !== null && tab.badge !== undefined && tab.badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab.alert ? 'bg-amber-500/30 text-amber-300' : 'bg-white/10 text-gray-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Models ── */}
      {activeTab === 'models' && (
        <div className="space-y-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucun modèle trouvé</p>
              <p className="text-sm mt-1">Ajoutez des modèles dans <strong className="text-gray-400">Pilotage → Comptes & Modèles</strong></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => {
                const p = personalities[model.id]
                const isConfigured = !!p
                return (
                  <div
                    key={model.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isConfigured
                        ? 'border-violet-500/30 bg-violet-500/5'
                        : 'border-white/10 bg-white/3'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm">
                          {model.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{model.name}</p>
                          {isConfigured ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className={`w-2 h-2 rounded-full ${p.auto_mode ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                              <span className="text-xs text-gray-400">
                                {p.auto_mode ? 'Mode automatique' : 'Mode supervisé'} · {
                                  PERSONALITY_TYPES.find((t) => t.id === p.personality_type)?.label || p.personality_type
                                }
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 mt-0.5">Non configurée</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {/* Auto Mode Toggle */}
                        {isConfigured && (
                          <button
                            onClick={() => toggleAutoMode(model.id)}
                            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                              p.auto_mode ? 'bg-green-500' : 'bg-gray-700'
                            }`}
                            title={p.auto_mode ? 'Désactiver l\'IA automatique' : 'Activer l\'IA automatique'}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                p.auto_mode ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => openConfigureModel(model.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs hover:border-violet-500/40 hover:text-violet-300 transition-all flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Settings size={13} />
                          {isConfigured ? 'Modifier' : 'Configurer'}
                        </button>
                      </div>
                    </div>

                    {isConfigured && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center p-2 rounded-lg bg-black/20">
                          <p className="text-white text-sm font-bold">{p.response_delay_seconds || 60}s</p>
                          <p className="text-gray-600 text-[10px]">Délai réponse</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-black/20">
                          <p className="text-white text-sm font-bold">{p.languages?.join('/') || 'FR'}</p>
                          <p className="text-gray-600 text-[10px]">Langue(s)</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-black/20">
                          <p className="text-white text-sm font-bold">{p.ppv_price_range || '—'}</p>
                          <p className="text-gray-600 text-[10px]">Fourchette PPV</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Queue ── */}
      {activeTab === 'queue' && (
        <div className="space-y-3">
          {pendingMessages.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucun message en attente</p>
              <p className="text-xs mt-1 text-gray-600">Les messages en mode supervisé apparaissent ici</p>
            </div>
          ) : (
            pendingMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-400">
                      👤 {msg.fan_profile?.fan_name || 'Fan inconnu'}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(msg.sent_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.ai_generated && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">IA</span>
                    )}
                  </div>
                  <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApproveMessage(msg.id, 'approve')}
                    className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    onClick={() => handleApproveMessage(msg.id, 'reject')}
                    className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Scripts ── */}
      {activeTab === 'scripts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{scripts.length} script(s) importé(s)</p>
            <button
              onClick={() => setShowScriptModal(true)}
              className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Nouveau script
            </button>
          </div>

          {scripts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucun script</p>
              <p className="text-sm mt-1">Les scripts guident Claude dans ses réponses (PPV, tips, réactivation...)</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scripts.map((script) => (
                <div key={script.id} className="p-4 rounded-xl border border-white/10 bg-white/3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white text-sm">{script.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          script.category === 'ppv' ? 'bg-pink-500/20 text-pink-400' :
                          script.category === 'tips' ? 'bg-amber-500/20 text-amber-400' :
                          script.category === 'reactivation' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-white/10 text-gray-400'
                        }`}>
                          {script.category}
                        </span>
                        {script.ai_score != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-medium">
                            ⭐ {script.ai_score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{script.content}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button onClick={() => handleAnalyzeScript(script.id)} className="p-2 text-gray-500 hover:text-violet-400" title="Analyser par IA">
                        <Eye size={15} />
                      </button>
                      <button onClick={async () => {
                        await fetch('/api/chatting/ai/scripts', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ scriptId: script.id }),
                        })
                        setScripts((prev) => prev.filter((s) => s.id !== script.id))
                        toast.success('Script supprimé')
                      }} className="p-2 text-gray-500 hover:text-red-400">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Fans ── */}
      {activeTab === 'fans' && (
        <div className="space-y-3">
          {recentFans.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucun profil fan</p>
              <p className="text-sm mt-1">Les profils se remplissent au fil des conversations via le chatting IA</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentFans.map((fan) => (
                <div key={fan.id} className="p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{fan.fan_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      fan.total_spent > 500 ? 'bg-yellow-500/20 text-yellow-400' :
                      fan.total_spent > 100 ? 'bg-violet-500/20 text-violet-400' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {fan.total_spent > 500 ? '👑 VIP' : fan.total_spent > 100 ? '⭐ Régulier' : '🆕 Nouveau'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-white text-sm font-bold">{fan.total_spent?.toFixed(0) || 0}€</p>
                      <p className="text-gray-600 text-[10px]">Total dépensé</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{fan.interaction_count || 0}</p>
                      <p className="text-gray-600 text-[10px]">Interactions</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${
                        (fan.sentiment_score || 0) > 0.6 ? 'text-green-400' :
                        (fan.sentiment_score || 0) > 0.3 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {((fan.sentiment_score || 0) * 100).toFixed(0)}%
                      </p>
                      <p className="text-gray-600 text-[10px]">Sentiment</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Config ── */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Configuration par Liste</h2>
            <p className="text-gray-400 text-sm">Configurez les paramètres PPV, mode relationnel et instructions pour chaque plateforme</p>
          </div>
          <ListConfigPanel />
        </div>
      )}

      {/* ── Tab: Activity ── */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          {recentMessages.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Radio size={40} className="mx-auto mb-3 opacity-20" />
              <p>Aucune activité récente</p>
            </div>
          ) : (
            recentMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 p-3 rounded-xl border ${
                msg.direction === 'inbound'
                  ? 'border-white/5 bg-white/2'
                  : msg.approved === true
                  ? 'border-green-500/15 bg-green-500/3'
                  : msg.approved === null
                  ? 'border-amber-500/20 bg-amber-500/3'
                  : 'border-white/5 bg-white/2'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {msg.direction === 'inbound' ? (
                    <span className="text-lg">👤</span>
                  ) : (
                    <Bot size={20} className={
                      msg.approved === null ? 'text-amber-400' :
                      msg.approved ? 'text-green-400' : 'text-gray-500'
                    } />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-medium text-gray-400">
                      {msg.direction === 'inbound' ? (msg.fan_profile?.fan_name || 'Fan') : 'Claude (IA)'}
                    </span>
                    {msg.direction === 'outbound' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        msg.approved === null ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                        msg.approved ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                        'bg-red-500/20 border-red-500/30 text-red-400'
                      }`}>
                        {msg.approved === null ? 'En attente' : msg.approved ? 'Approuvé' : 'Rejeté'}
                      </span>
                    )}
                    <span className="text-gray-700 text-[10px] ml-auto">
                      {new Date(msg.sent_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{msg.content}</p>
                </div>
                {/* Feedback buttons for AI-generated messages */}
                {msg.direction === 'outbound' && msg.ai_generated && AI_GENERATED_FEEDBACK_ENABLED && (
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleFeedback(msg.id, 'validate')}
                      title="Valider cette réponse IA"
                      className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => openFeedbackModal(msg.id, msg.content)}
                      title="Corriger cette réponse"
                      className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg.id, 'reject')}
                      title="Rejeter cette réponse"
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Analyze ── */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Analyser une Conversation</h2>
            <p className="text-gray-400 text-sm">Collez une conversation et l'IA extraira les patterns pour améliorer vos modèles</p>
          </div>

          {/* Analysis Form */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            {/* Model Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Modèle concerné</label>
              <select
                value={analyzeForm.selectedModelId}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, selectedModelId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              >
                <option value="">Sélectionner un modèle...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Plateforme</label>
              <div className="flex gap-3">
                {(['onlyfans', 'mym'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnalyzeForm({ ...analyzeForm, platform: p })}
                    className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                      analyzeForm.platform === p
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Colle ici une conversation</label>
              <textarea
                value={analyzeForm.conversation}
                onChange={(e) => setAnalyzeForm({ ...analyzeForm, conversation: e.target.value })}
                placeholder="Fan: salut bb ❤️\nChatter: coucou ma belle! Comment tu vas aujourd'hui? 😘\nFan: très bien! J'aimerais bien un petit truc\nChatter: Bien sur! C'est quoi? 💋"
                className="w-full h-48 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzeConversation}
              disabled={analyzeLoading}
              className="w-full px-4 py-3 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:bg-gray-700 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              {analyzeLoading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain size={18} />
                  Analyser la conversation
                </>
              )}
            </button>
          </div>

          {/* Analysis Results */}
          {analyzeResult && (
            <div className="space-y-4">
              {/* Style Profile */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">🎨 Style Détecté</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Ton:</span>
                    <p className="text-white font-medium">{analyzeResult.styleProfile?.tone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Longueur des messages:</span>
                    <p className="text-white font-medium">{analyzeResult.styleProfile?.messageLength || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Emojis:</span>
                    <p className="text-white font-medium">{analyzeResult.styleProfile?.emojiUsage || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Niveau de langue:</span>
                    <p className="text-white font-medium">{analyzeResult.styleProfile?.language || '—'}</p>
                  </div>
                </div>
                {analyzeResult.styleProfile?.expressions && (
                  <div className="mt-4">
                    <span className="text-gray-400 block mb-2">Expressions naturelles:</span>
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.styleProfile.expressions.map((expr: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-medium">
                          {expr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Success Patterns */}
              {analyzeResult.successPatterns && analyzeResult.successPatterns.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">✅ Patterns Gagnants</h3>
                  <div className="space-y-3">
                    {analyzeResult.successPatterns.map((p: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="font-medium">Fan:</span> {p.fanMessage}
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="font-medium">Réponse:</span> {p.chatterResponse}
                        </div>
                        <div className="text-xs text-green-400">💡 {p.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avoid Patterns */}
              {analyzeResult.avoidPatterns && analyzeResult.avoidPatterns.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">❌ À Éviter</h3>
                  <div className="space-y-3">
                    {analyzeResult.avoidPatterns.map((p: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="text-sm text-red-400 mb-2 font-medium">{p.message}</div>
                        <div className="text-xs text-gray-400 mb-2">{p.reason}</div>
                        <div className="text-xs text-green-400">✓ Meilleure alternative: {p.betterAlternative}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upsell Moments */}
              {analyzeResult.upsellMoments && analyzeResult.upsellMoments.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">💰 Moments d'Upsell</h3>
                  <div className="space-y-3">
                    {analyzeResult.upsellMoments.map((u: any, i: number) => (
                      <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="text-sm text-white font-medium mb-1">{u.technique}</div>
                        <div className="text-xs text-gray-400 mb-2">Contexte: {u.context}</div>
                        <div className="text-xs text-amber-400">Résultat: {u.result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Learnings */}
              {analyzeResult.keyLearnings && analyzeResult.keyLearnings.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-3">🧠 Apprentissages Clés</h3>
                  <ul className="space-y-2">
                    {analyzeResult.keyLearnings.map((l: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-violet-400 font-bold">•</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════ FEEDBACK CORRECTION MODAL ════ */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12111a] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 size={20} className="text-amber-400" />
                Corriger la réponse IA
              </h3>
              <button
                onClick={() => setFeedbackModal({ isOpen: false, messageId: null, originalContent: '', corrected: '', reason: '' })}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Original message */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Message original (IA)
                </label>
                <div className="p-3 rounded-lg bg-black/30 border border-white/10 text-gray-300 text-sm leading-relaxed">
                  {feedbackModal.originalContent}
                </div>
              </div>

              {/* Corrected message */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Message corrigé
                </label>
                <textarea
                  value={feedbackModal.corrected}
                  onChange={(e) => setFeedbackModal({ ...feedbackModal, corrected: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none text-sm resize-none"
                  placeholder="Écrivez la version corrigée du message..."
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Pourquoi ? (optionnel)
                </label>
                <input
                  type="text"
                  value={feedbackModal.reason}
                  onChange={(e) => setFeedbackModal({ ...feedbackModal, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                  placeholder="ex: trop formel, mauvaise expression, manque d'authenticité..."
                />
              </div>

              <p className="text-xs text-gray-600 italic">
                Cette correction sera enregistrée et servira à l'IA pour générer de meilleures réponses à l'avenir.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFeedbackModal({ isOpen: false, messageId: null, originalContent: '', corrected: '', reason: '' })}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20"
              >
                Annuler
              </button>
              <button
                onClick={() => feedbackModal.messageId && handleFeedback(
                  feedbackModal.messageId,
                  'correct',
                  feedbackModal.corrected,
                  feedbackModal.reason
                )}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/20"
              >
                Enregistrer la correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ PERSONALITY MODAL ════ */}
      {showPersonalityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12111a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Personnalité — {selectedModel ? modelName(selectedModel) : ''}
              </h3>
              <button onClick={() => setShowPersonalityModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-5">
              {/* Nom d'affichage */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nom d'affichage (le nom que Claude utilise)</label>
                <input
                  type="text" value={personalityForm.displayName}
                  onChange={(e) => setPersonalityForm({ ...personalityForm, displayName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm"
                  placeholder="ex: Sofia"
                />
              </div>

              {/* Type de personnalité */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Personnalité</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERSONALITY_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPersonalityForm({ ...personalityForm, personalityType: t.id })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        personalityForm.personalityType === t.id
                          ? 'bg-violet-500/20 border-violet-500/50'
                          : 'bg-black/20 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white">{t.label}</p>
                      <p className="text-xs text-gray-500">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style de communication */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Style de communication</label>
                <textarea
                  value={personalityForm.communicationStyle}
                  onChange={(e) => setPersonalityForm({ ...personalityForm, communicationStyle: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm resize-none"
                  placeholder="ex: Écrit avec des fautes légères, beaucoup d'emojis, répond avec du sous-entendu..."
                />
              </div>

              {/* Stratégie PPV/Tips */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sujets à éviter</label>
                  <input
                    type="text"
                    value={personalityForm.topicsToAvoid.join(', ')}
                    onChange={(e) => setPersonalityForm({
                      ...personalityForm,
                      topicsToAvoid: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                    placeholder="ex: âge, lieu..."
                  />
                </div>
              </div>

              {/* Stratégie tips */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Stratégie tips/PPV</label>
                <textarea
                  value={personalityForm.tipsStrategy}
                  onChange={(e) => setPersonalityForm({ ...personalityForm, tipsStrategy: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none text-sm resize-none"
                  placeholder="ex: Propose un PPV après 3 échanges, un tip sur les photos exclusives..."
                />
              </div>

              {/* Mode auto */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">Mode automatique</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {personalityForm.autoMode
                        ? '🟢 Claude répond sans approbation — surveille les premières 48h'
                        : '🔵 Chaque réponse passe dans la file de validation avant envoi'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPersonalityForm({ ...personalityForm, autoMode: !personalityForm.autoMode })}
                    className={`w-12 h-6 rounded-full transition-all flex items-center px-0.5 ${
                      personalityForm.autoMode ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              </div>

              {/* Délai de réponse */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Délai de réponse :{' '}
                  <span className="text-white normal-case font-bold">
                    {personalityForm.responseDelay < 60
                      ? `${personalityForm.responseDelay}s`
                      : `${Math.floor(personalityForm.responseDelay / 60)}min${personalityForm.responseDelay % 60 > 0 ? ` ${personalityForm.responseDelay % 60}s` : ''}`}
                  </span>
                  <span className="text-gray-600 normal-case font-normal ml-2">(simulation humaine)</span>
                </label>
                <input
                  type="range" min={30} max={300} step={30}
                  value={personalityForm.responseDelay}
                  onChange={(e) => setPersonalityForm({ ...personalityForm, responseDelay: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-700 mt-1">
                  <span>30s</span><span>1min</span><span>2min</span><span>3min</span><span>4min</span><span>5min</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPersonalityModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20">
                Annuler
              </button>
              <button onClick={handleSavePersonality} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/20">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SCRIPT MODAL ════ */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12111a] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nouveau script</h3>
              <button onClick={() => setShowScriptModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nom</label>
                  <input type="text" value={scriptForm.name} onChange={(e) => setScriptForm({ ...scriptForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                    placeholder="ex: PPV spécial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Catégorie</label>
                  <select value={scriptForm.category} onChange={(e) => setScriptForm({ ...scriptForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-violet-500 focus:outline-none"
                  >
                    {['ppv', 'tips', 'reactivation', 'greeting', 'upsell', 'custom'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contenu du script</label>
                <textarea value={scriptForm.content} onChange={(e) => setScriptForm({ ...scriptForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-600 text-sm focus:border-violet-500 focus:outline-none resize-none"
                  placeholder="Écrivez le script... Utilisez {{fan_name}}, {{model_name}} comme variables."
                />
              </div>
              <p className="text-xs text-gray-600">Variables : <code className="text-gray-400">{'{{fan_name}}'}</code> <code className="text-gray-400">{'{{model_name}}'}</code> <code className="text-gray-400">{'{{ppv_price}}'}</code></p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowScriptModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">Annuler</button>
              <button onClick={handleSaveScript} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Fan Notes ── */}
      {selectedFanForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <FanNotesPanel
              fanProfileId={selectedFanForNotes.id}
              fanName={selectedFanForNotes.fan_name}
              onClose={() => setSelectedFanForNotes(null)}
            />
          </div>
        </div>
      )}
      </div>
    </FeatureGate>
  )
}
